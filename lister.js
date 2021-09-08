var net = require('net');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')


var server_addr = '127.0.0.1'
var server_bank = '1337'

var pairs = new Array()

var persistent = null

var secret = fs.readFileSync('/home/manjaro/bin/secret_factory', "utf-8")
// if ( secret ) console.log(secret)

function askBanker() {


	var client = new net.Socket();
	client.connect(server_bank, server_addr, function(s) {

			console.log('Connected.');

			client.write(secret+":list");

		});
		//
		client.on('data', function(data) {

			var data = decoder.write(data)

			console.log(data)

			// client.destroy();

		});

		client.on('close', function() {

			console.log('Banker connection closed.');

		});


}

askBanker()
