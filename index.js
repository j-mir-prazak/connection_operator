// var net = require('net');
var net = require('tls');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')


var listen_addr = '0.0.0.0'
var server_bank = '7778'

var servers = new Array()

var ports = new Array()

if ( ! process.argv[2] ) process.exit(1)
var secret = fs.readFileSync(process.argv[2], 'utf-8')
secret = secret.replace(/\r?\n/g,"")
// if ( secret ) console.log(secret)


ports.push(443)

for( var i = 10000; i < 11000; i++) {

	ports.push(i)

}

var server_options = {
  key: fs.readFileSync('./cert/private.pem'),
  cert: fs.readFileSync('./cert/self-sign.pem'),
  // requestCert: true,
  ca: [ fs.readFileSync('./cert/private-csr.pem') ]
};

var banker = net.createServer(server_options, function(socket) {

	var input = socket

	input.on('error', function(e){
		console.log('banker connection abruptly ended.')
	})

	socket.on('data', function(d){

		var data = decoder.write(d).replace(/\r?\n/g, "")

		// console.log( data == secret )
		// console.log(data)
		// console.log(secret)
		if ( data.match(/\:/) ) {

			var split = data.split(/\:/)
			// console.log(split)

			if ( split[0] == secret && split[1] != "list" ) {

				console.log("setting server.")
				var port = ports.shift()
				var hoc = adHocServer(port, split[1])
				console.log("client name: " + split[1])

				console.log(port)

				try {

				console.log("sending port to connect to: " + port)
				socket.write( String(port) + ";")

				}
				catch (e) {

					console.log("error writing.")

				}
				socket.end()

			}

			else if ( split[0] == secret && split[1] == "list" ) {

				if (servers.length > 0 ) {

					var json = {
						items: new Array()
					}
					servers.forEach((item, i) => {

						json.items.push({
							name: item.name,
							port: item.port
						})


					});

					try {
					socket.write(JSON.stringify(json))
					}
					catch (e) {
						console.log("error writing.")
					}

				}

				socket.end()

			}

			else socket.end()

		}
		else socket.end()

	})
	// bridgeSockets(input)
	// socket.pipe(socket);



});

banker.listen(server_bank, listen_addr);

function connectionTimeout(server) {

		var timeout = setTimeout(function(){
			console.log("timeout")
			if ( server.server ){
				server.sockets.primar.end()
				server.sockets.primar.destroy()
				server.server.close()
			}
		}.bind(null, server), 5000)
	return timeout
	}


function adHocServer(port, name) {

	var port = port || false
	var name = name

	console.log("serving on port " + port + ".")

	var server

	var hoc = net.createServer(server_options, function(socket) {

		console.log(server.port + " connection.")

		var bridge_port = null
		var bridge_server = null

		var input = socket


		if ( server.sockets.primar == null ) {

			console.log("setting up primary connection.")

			server.sockets.primar = input

			input.on('error', function(e) {

				console.log(port + " primar connection abruptly disconnected.")

			})

			server.timeout = connectionTimeout(server)
			server.sockets.primar.write("ping.")

			server.sockets.primar.on('data', (d) => {
				if ( decoder.write(d) == "pong." ) {

					clearTimeout(server.timeout)
					server.timeout = setTimeout(function(){

					 clearTimeout(server.timeout)

						// console.log("pong.")
						server.sockets.primar.write("ping.")

						server.timeout = connectionTimeout(server)

					}.bind(null, server), 5000)

				}
			})

			console.log("waiting for second connection.")

			server.sockets.primar.on('close', function() {

				if (server.timeout) clearTimeout(server.timeout)
				server.sockets.primar = null

				console.log("primar socket closed.")
				console.log("giving back port: " + port + ".")

				if ( hoc ) {

					hoc.close()
					ports.unshift( port )

				}

				servers.forEach((item, i) => {

					if ( item.port == port ) servers.splice(i,1)

				});

				server.sockets.secundar.forEach((item, i) => {

					item.end()

				});

			})

		}

		else if ( server.sockets.primar  ) {

			server.sockets.secundar.push( input )

			input.on('error', function(e) {

				console.log(port + " adhoc secoundar connection abruptly disconnected.")

			})

			bridge_port = ports.pop()

			console.log("new connection.")

			bridge_server = adHocSubServer( bridge_port , input)

			console.log("calling otherside.")

			console.log("bridge port: " + bridge_port)

			server.sockets.primar.write( String(bridge_port) + ";" )


			input.on('close', function() {

				// server.sockets.secundar = null

				console.log("secundar socket closed.")
				console.log("giving back port: " + bridge_port + ".")

				if ( bridge_server ) {

					console.log("closing sub-server.")

					bridge_server.server.close()
					if ( bridge_server.sockets.secundar ) bridge_server.sockets.secundar.destroy()

					ports.push( bridge_port )

				}

				if ( server.sockets.secundar.indexOf(input) >= 0 ) {

					console.log("splice.")
					server.sockets.secundar.splice( server.sockets.secundar.indexOf(input),1 )

				}

			})

		}


	})



	hoc.listen(port, '0.0.0.0');


	server = {
		port:port,
		name:name,
		server:hoc,
		timeout:null,
		sockets: {
			primar:null,
			secundar:new Array()
		},
		servers: new Array()
	}

	servers.push(server)

	// console.log(servers)


}

function adHocSubServer(port, socket) {

	var port = port || false

	var input = socket

	console.log("serving on port " + port + ".")

	var server

	var hoc = net.createServer(server_options, (socket) => {

		console.log(server.port + " connection.")

		var socket = socket

		if ( server.sockets.secundar == null ) {

			server.sockets.secundar = socket

			server.sockets.primar.on('data', (d) =>{


						try {

						server.sockets.secundar.write(d)

						}
						catch (e) {

							console.log("error writing.")

						}


			})

			server.sockets.secundar.on('data', (d) =>{

				try {

				var data = d
				if (data == null ) console.log("null data: " + data)

				server.sockets.primar.write(d)

				}
				catch (e) {

					console.log("error writing.")

				}

			})

			// try {
			//
			// var data = input.read()
			// console.log(""+data)
			// server.sockets.secundar.write( data )
			//
			// }
			// catch (e) {
			//
			// 	console.log("error writing.")
			//
			// }



		}

		socket.on('error', function(e) {

			console.log(port + " connection abruptly disconnected.")

		})

		socket.on('close', function() {


			console.log("closing socket on port " + port + ".")
			// console.log(ports)

			// hoc.close()
			// console.log(hoc)

			// ports.push(port)
			// console.log(ports)

			})

	});


	hoc.listen(port, '0.0.0.0');

	server = {
		port:port,
		server:hoc,
		timeout:null,
		sockets: {
			primar:input,
			secundar:null
		}
	}

	return server

}
