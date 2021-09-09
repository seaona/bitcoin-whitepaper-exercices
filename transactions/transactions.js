"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"priv.pgp.key"),"utf8");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

addPoem()
.then(checkPoem)
.catch(console.log);


// **********************************

async function addPoem() {
	var transactions = [];

	// TODO: add poem lines as authorized transactions
	for (let line of poem) {
		let tx = createTransaction(line)
		let tx_auth = await authorizeTransaction(tx)
		transactions.push(tx_auth)
	}

	var bl = createBlock(transactions);
	Blockchain.blocks.push(bl);

	return Blockchain;
}

async function checkPoem(chain) {
	console.log("Blockchain is correct", await verifyChain(chain));
}

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function createTransaction(line) {
	var tx = new Object();
	tx.data = line
	tx.hash = transactionHash(tx)
	return tx;
}

function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr.data)}`
	).digest("hex");
}

async function authorizeTransaction(tx) {
	tx.pubKey = PUB_KEY_TEXT 
	tx.signature = await createSignature(tx.data, PRIV_KEY_TEXT)
	return tx;
}

async function createSignature(msg, privKey) {
	const passphrase = `super long and hard to guess secret`; // what the private key is encrypted with
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privKey }),
        passphrase
    });
	const unsignedMessage = await openpgp.createCleartextMessage({ text: `${msg}`});
	const cleartextMessage = await openpgp.sign({
        message: unsignedMessage, // CleartextMessage or Message object
        signingKeys: privateKey
    });
    //console.log(cleartextMessage); // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'

    const signedMessage = await openpgp.readCleartextMessage({
        cleartextMessage // parse armored message
    });

	return signedMessage;
}

async function verifySignature(signedMessage, pubKey) {
	const verificationResult = await openpgp.verify({
        message: signedMessage,
        verificationKeys: pubKey
    });
    const { verified, keyID } = verificationResult.signatures[0];


    try {
        await verified; // throws on invalid signature
        console.log('Signed by key id ' + keyID.toHex());
		return true
    } catch (e) {
        throw new Error('Signature could not be verified: ' + e.message);
    }

	
}

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp}`
	).digest("hex");
}

async function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
		if (!Array.isArray(bl.data)) return false;

		// Verify transactions in block
		for(let tx of bl.data) {
			if(transactionHash(tx) !== tx.hash) {
				console.log("Transaction hash does is not correct")
				return false
			}

			if(!tx.pubKey) {
				console.log("Missing public key of the transaction")
				return false
			}

			if(!tx.signature) {
				console.log("Missing signature of the transaction")
				return false
			}

			if(await verifySignature(tx.signature, tx.pubKey) === false) {
				console.log("Signature not correct")
				return false
			}
		}
		
	}

	return true;
}

async function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!(await verifyBlock(bl))) return false;
		prevHash = bl.hash;
	}

	return true;
}
