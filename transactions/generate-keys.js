"use strict";

const path = require("path");
const fs = require("fs");
const openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");

const generateKeys = async () => {
    await openpgp.generateKey({
        type: 'rsa', // Type of the key
        rsaBits: 4096, // RSA key size (defaults to 4096 bits)
        userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
        passphrase: 'super long and hard to guess secret' // protects the private key
    })

	.then( keys => {	
		fs.mkdirSync(KEYS_DIR)
		fs.writeFileSync(path.join(KEYS_DIR,"priv.pgp.key"), keys.privateKey,"utf8")
		fs.writeFileSync(path.join(KEYS_DIR,"pub.pgp.key"), keys.publicKey,"utf8")

		console.log("Keypair generated.");
	})
}

generateKeys()