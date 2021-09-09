var net = require('net');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')

var name = process.argv[3] || "avatar000"
var local_port = process.argv[2] || 22

var server_addr = '139.162.251.161'
var server_bank = '7777'

var pairs = new Array()

var persistent = null

var secret = fs.readFileSync('./secret_factory', "utf-8")
// if ( secret ) console.log(secret)

function askBanker() {


	var client = new net.Socket();
	client.connect(server_bank, server_addr, function(s) {

			console.log('Connected.');

			client.write(secret+":"+name);

		});
		//
		client.on('data', function(data) {

			var port = decoder.write(data)

			console.log("set persistent on " + port + ".")

			persistent = setPersistent( parseInt(port), server_addr )

			// client.destroy();

		});

		client.on('close', function() {

			console.log('Banker connection closed.');

		});


}

askBanker()

function setPersistent(port, address) {

	var client = new net.Socket();

	client.connect(port, address, function(s) {

			console.log('Persistent connected.');

		});

		client.on('data', function(data) {

			var port = decoder.write(data)

			// console.log(port)

			var pair = {

				local: setLocal(local_port, '127.0.0.1'),
				remote: setRemote(parseInt(port), server_addr)

				}

			pairs.push(pair)

			pair.local.on('data', function(data) {

				pair.remote.write(data)

			})

			pair.remote.on('data', function(data){

				pair.local.write(data)

			})

			pair.local.on('close', function(){
				pair.local = null
				if ( pair.remote ) pair.remote.destroy()
			})

			pair.remote.on('close', function(){
				pair.remote = null
				if ( pair.local ) pair.local.destroy()
			})
			// client.destroy();

		});

		client.on('close', function() {

			console.log('Persistent connection closed.');

		});



}

function setLocal(port, address) {

	var client = new net.Socket();

	client.connect(port, '127.0.0.1', function(s) {

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

	var client = new net.Socket();

	client.connect(port, server_addr, function(s) {

		console.log('Server connected.');


	});


	client.on('close', function() {

		console.log('Remote connection closed.');

	});

	return client
}
