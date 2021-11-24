var localnet = require('net');
var net = require('tls');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')
var child_process = require('child_process')



var name = process.argv[3] || "avatar000"
var local_port = process.argv[2] || 22

// var server_addr = 'localhost'
var server_addr = '139.162.251.161'
var server_bank = '7778'

var pairs = new Array()

var persistent = null

var connection_check = null
var connection_timeout = null

var secret = fs.readFileSync('./secret_factory', "utf-8")
// if ( secret ) console.log(secret)

function askBanker() {


	var client = new net.TLSSocket();
	client.connect(server_bank, server_addr, function(s) {

			console.log('Connected.');

			try {
				client.write(secret+":"+name);
			}
			catch (e) {
				console.log("error writing.")
			}

		});
		//
		client.on('data', function(data) {

			var port = decoder.write(data)
			console.log(port)
			port = port.replace(/(.*?)\;.*/, "$1")
			console.log(port)

			console.log("set persistent on " + port + ".")

			persistent = setPersistent( parseInt(port), server_addr )

			// client.destroy();

		});

		client.on('error', function() {

			console.log('connection refused.')

		})

		client.on('close', function() {

			console.log('Banker connection closed.');

		});


}

// askBanker()

function setPersistent(port, address) {

	var client = new net.TLSSocket();

	client.connect(port, address, function(s) {

			console.log('Persistent connected.');
			client.write("pong")

		});

		client.on('error', function(e) {

			console.log('persistent connection reset.')

		})

		client.on('data', function(data) {

			// console.log("persistent: " + data)

			var port = decoder.write(data)


			if ( port == "ping.") {

				// console.log("ping.")

				try {
				client.write("pong.")
				}
				catch (e) {
					console.log("error writing.")
				}

			}


			else {

				var ports = port.split(/;/)
				console.log(ports)

				ports.forEach((port, i) => {

					if ( port != '') {

						console.log(port)

						var pair = {

							local: setLocal(local_port, '127.0.0.1'),
							remote: setRemote(parseInt(port), server_addr)

							}

						pairs.push(pair)

						pair.local.on('connect', () => {
							console.log('local connected')
						})

						pair.remote.on('connect', () => {
							console.log('remote connected')
						})


						pair.local.on('data', function(data) {
							console.log("local data")
							try {
								pair.remote.write(data)
							}
							catch (e) {
								console.log("error writing.")
							}
						})

						pair.remote.on('data', function(data) {
							console.log("remote data")
							try {

								pair.local.write(data)
							}

							catch (e) {

								console.log("error writing.")

							}
						})


						pair.local.on('close', function(){

							console.log("local close; killing")
							pair.local = null
							if ( pair.remote ) pair.remote.destroy()

						})

						pair.remote.on('close', function(){
							console.log("remote close; killing")
							pair.remote = null
							if ( pair.local ) pair.local.destroy()
						})
					// client.destroy();
					}
				})
			}

		})

		client.on('error', function(){

			console.log('Persistent connection error.')

		})


		client.on('close', function() {

			console.log('Persistent connection closed.');
			persistent = null

		});

		return client


}

function setLocal(port, address) {

	var client = new localnet.Socket();

	client.connect(port, '127.0.0.1', function(s) {

		// client.write("")

		// client.write(new Buffer.alloc(0))
		console.log('Local connected.');


	});

	client.on('error', function(){

		console.log('cannot connect to local.')

	})

	client.on('close', function() {

		console.log('Local connection closed.');

	});

	return client

}


function setRemote(port, address) {

	// console.log(port)

	var client = new net.TLSSocket();

	console.log("connect here: " + port)

	client.connect(port, server_addr, function(s) {

		// console.log(client)
		//
		client.write("blank")

		console.log('Server connected.');


	});

	client.on('error', function(){

		console.log('Remote connection error.')

	})

	client.on('secureConnect', function(){

		console.log('remote is connected securely')

	})


	client.on('close', function() {

		console.log('Remote connection closed.');

	});

	return client
}

var connection_fails = 0

console.log("setting interval.")

setInterval(function() {


	if ( connection_check == null ) {

		// console.log("ping server.")

		connection_check = child_process.spawn("bash", new Array("-c", "./ping.sh"), {detached: true})
		connection_check.on('exit', (e) => {

			// console.log(e)

			if ( e == 0 ) {

				// console.log("still online.")
				if ( persistent == null ) {

					askBanker()

				}

				connection_timeout = setTimeout(function(){
					// console.log("allow next check.")
					connection_check = null
				}, 3000)
			}

			else {

				if ( connection_fails > 6 ) {

				console.log("no internets.")
				if ( persistent ) persistent.destroy()
				pesistent = null
				connection_fails = 0

				}

				else connection_fails++

				connection_check = null
			}

		})

	}
}, 2000)
