var net = require('net');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')

var dgram = require('dgram');


function message_parse(msg) {

	var msg = msg || false
	if ( msg == false ) return false;


	// 4084 (buffer)
	//	+
	// 	2 - type
	// 	4	- length ( msgdata + zerofill == buffer; length == msgdata)
	// 	2 - end sign
	// 	4	- position ( roll over after 9999 )


}

function message_unparse(msg) {

	var msg = msg || false
	if ( msg == false ) return false;



}


function dgram_server_setup(port) {

	var dgram_port = port
	var dgram_server = dgram.createSocket('udp4');

	dgram_server.on('error', (err) => {

		console.log("udp server error.")
	  dgram_server.close();

	});

	dgram_server.on('message', (msg, rinfo) => {

		console.log("client message: " + msg)

		dgram_server.send("hello.", rinfo.port)

	});

	dgram_server.on('listening', () => {

	});

	dgram_server.bind(port);

	return dgram_server

}





function dgram_client_setup(port) {

	var dgram_connected = false
	var dgram_port = port || 8989

	var dgram_client = dgram.createSocket('udp4');

	dgram_client.on('connect', () => {

		console.log("udp client connected.")
		dgram_client.send("hello.")
		dgram_connected = true

	})

	dgram_client.on('message', (m, info) => {

		console.log("server message: " + m)

	})


	dgram_client.connect(dgram_port)


	return dgram_client
}

var port = 8989
var dgram_server = dgram_server_setup(port)

var dgram_client = dgram_client_setup(port)





var server = net.createServer( function(socket) {

	var input = socket

	socket.on('data', function(d){


	})

	socket.on('end', function(d){

		console.log("tcp ended.")

	})

	input.on('error', function(e){

		console.log('tcp connection abruptly ended.')

	})

});

server.listen(7891, "0.0.0.0");
