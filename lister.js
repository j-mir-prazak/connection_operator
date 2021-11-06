var net = require('net');
var StringDecoder = require('string_decoder');
var decoder = new StringDecoder.StringDecoder('utf8');
var fs = require('fs')

var filter = new RegExp(process.argv[2]) || /.*/
var user = process.argv[3] || false

var server_addr = '139.162.251.161'
var server_bank = '7777'

var pairs = new Array()

var persistent = null

var secret = fs.readFileSync('./secret_factory', "utf-8")
// if ( secret ) console.log(secret)

function askBanker() {

	var output = new Array()

	var client = new net.Socket();
	client.connect(server_bank, server_addr, function(s) {

			console.error('Connected.');

			client.write(secret+":list");

		});
		//
		client.on('data', function(data) {

			var data = JSON.parse(data)

			data.items.forEach((item, i) => {

				if ( item.name.match( filter ) ) {

					item.server = server_addr
					output.push(item)

				}

			});


			// client.destroy();

		});

		client.on('close', function() {

			if ( output.length > 0 ) {
				console.error(output)
				if ( user ) {

					output.forEach((item, i) => {
						console.log(user+"@"+item.server+":"+item.port)
					});


				}

		}

			console.error('Banker connection closed.');

		});


}

askBanker()
