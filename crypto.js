var crypto = require('crypto')
var fs = require('fs')

// crypto.privateEncrypt
// crypto.privateDEcrypt

// crypto.publicEncrypt
// crypto.publicDecrypt


var key = fs.readFileSync('./cert/private.pem')
var cert = fs.readFileSync('./cert/self-sign.pem')

var string = "weird but typical mood for these times: this is how being dumped tastes like."

// console.log(key)
// console.log(cert)

var encrypted = crypto.privateEncrypt(key, string)

console.log(encrypted + "")

var decrypted = crypto.publicDecrypt(cert, encrypted)

console.log(decrypted + "")

encrypted = crypto.publicEncrypt(cert, decrypted)

console.log(encrypted + "")

// decrypted = crypto.publicDecrypt(cert, encrypted)
decrypted = crypto.privateDecrypt(key, encrypted)

console.log(decrypted + "")




// function crosscrypt(string) {
//
// 	fs.readFile(absolutePath, 'utf-8', (err, publicKey) => {
//
// 	        console.log(publicKey);
//
// 	        var buffer = Buffer.from(toEncrypt);
//
// 	        var encrypted = crypto.publicEncrypt(publicKey, buffer);
//
//
//
// 	    });
//
// 	}
