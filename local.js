var localnet = require('net');
var net = require('tls');
var tls = require('tls');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')
var child_process = require('child_process')

var server_options = {
  key: fs.readFileSync('./cert/private.pem'),
  cert: fs.readFileSync('./cert/self-sign.pem'),
  // requestCert: true,
  ca: [ fs.readFileSync('./cert/private-csr.pem') ]
};

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
							var data = data
							try {
								pair.remote.write(data)
							}
							catch (e) {
								console.log("error writing.")
							}
						})

						pair.remote.on('data', function(data) {
							var data = data
							console.log("remote data:\n" + data)
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

	// {allowHalfOpen:true}
	var client = new localnet.Socket();
	client.connect(port, '127.0.0.1', function(s) {
		console.log('Local connected.');
	});

	client.on('error', function(){
		console.log('cannot connect to local.')
	})

	client.on('timeout', function(){
		console.log('timeout local.')
	})

	client.on('end', function(){
		console.log('end local.')
	})

	client.on('close', function() {
		console.log('Local connection closed.');
	});

	return client

}


function setRemote(port, address) {

	var client = new net.TLSSocket();
	console.log("connect here: " + port)

	client.connect(port, server_addr, function(s) {
		console.log('Server connected.');
		// client.write("blank")
		// setInterval(() => { client.write(new Buffer.alloc(0)) }, 1000)

	});

	client.on('error', function(e){
		console.log('Remote connection error.')
		console.log(e)
	})

	client.on('secureConnect', function(){
		console.log('remote is connected securely')
	})


	client.on('end', function(){
		console.log('end local.')
	})


	client.on('close', function() {
		console.log('Remote connection closed.');
	});

	return client
}

function server(port) {

	var port = port || false

	console.log("serving on port " + port + ".")

	var server
	var hoc = net.createServer(server_options, (socket) => {

		console.log("connection on server.")

		var remote = socket
		var local = setLocal(5555, "localhost")

		local.on('data', (d) => {
			var data = d
			try {
				remote.write(data, () => {

					if ( remote.writableLength > 1000 ) {
						local.pause()
						console.log("pause")
					}

				})
			}
			catch (e) {
				console.log("error writing.")
			}


		})

		remote.on('drain', () => {
			console.log('drain')
			console.log(remote.writableLength)
			local.resume()
		})

		remote.on('data', (d) => {

			var data = d


			console.log(remote.writableLength)

			try {
				local.write(data)
			}
			catch (e) {
				console.log("error writing.")
			}



		})


		local.on('error', function(e) {
			console.log("5555 connection abruptly disconnected.")
		})

		local.on('close', function() {
			console.log("closing socket on port 5555.")
			})

		remote.on('error', function(e) {
			console.log(port + " connection abruptly disconnected.")
		})

		remote.on('close', function() {
			console.log("closing socket on port " + port + ".")
			})

	});

	hoc.listen(port, '0.0.0.0');

	return hoc

}

server(6666)
