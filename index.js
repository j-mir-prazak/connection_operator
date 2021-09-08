var net = require('net');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')

var listen_addr = '0.0.0.0'
var server_bank = '1337'

var servers = new Array()

var ports = new Array()

var secret = fs.readFileSync('/home/manjaro/bin/secret_factory', 'utf-8')
secret = secret.replace(/\r?\n/g,"")
// if ( secret ) console.log(secret)

for( var i = 8000; i < 9000; i++) {

	ports.push(i)

}




var banker = net.createServer(function(socket) {

	var input = socket

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

				socket.write( String(port) )
				socket.end()

			}

			else if ( split[0] == secret && split[1] == "list" ) {

				if (servers.length > 0 ) {
					servers.forEach((item, i) => {

						socket.write(item.name + ": " + item.port)

					});
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


function adHocServer(port, name) {

	var port = port || false
	var name = name

	console.log("serving on port " + port + ".")

	var server

	var hoc = net.createServer(function(socket) {

		console.log(server.port + " connection.")

		var bridge_port = null
		var bridge_server = null

		var input = socket

		if ( server.sockets.primar == null ) {

			server.sockets.primar = input
			console.log("waiting for second connection.")

			server.sockets.primar.on('close', function() {

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

			bridge_port = ports.pop()

			console.log("new connection.")

			bridge_server = adHocSubServer( bridge_port , input)

			console.log("calling otherside.")

			server.sockets.primar.write( String(bridge_port) )

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

				if ( server.sockets.secundar.indexOf(input) > 0 ) {

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

	var hoc = net.createServer(function(socket) {

		console.log(server.port + " connection.")

		var socket = socket

		if ( server.sockets.secundar == null ) {

			server.sockets.secundar = socket

			server.sockets.primar.on('data', (d) =>{

				server.sockets.secundar.write(d)

			})

			server.sockets.secundar.on('data', (d) =>{

				server.sockets.primar.write(d)

			})

		}

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
