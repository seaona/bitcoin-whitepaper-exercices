"use strict";

const crypto = require("crypto");

// The Power of a Smile
// by Tupac Shakur
const poem = [
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

function createBlock (poem) {
	var index = Blockchain.blocks.length;
	var block = new Object();
	block.index = index
	block.prevHash = Blockchain.blocks[index-1].hash;
	block.data = poem[index-1]
	block.timestamp = Date.now();
	var hash = blockHash(block);
	block.hash = hash;
	Blockchain.blocks.push(block);
	console.log(block)
}

function blockHash(bl) {
	console.log(JSON.stringify(bl))
	const hashedBlock = crypto.createHash('sha256')
	.update(JSON.stringify(bl))
	.digest('hex')
	return hashedBlock
}

function createBlockchain() {
	for (let line of poem) {
		createBlock(poem)
	}
}


createBlockchain()


function verifyChain(blockchain) {
	let status = false;
	const chainLength = blockchain.blocks.length

	for(let i=0; i<chainLength; i++) {
		verifyBlock(blockchain.blocks[i])
	}

	return status;
}

function verifyBlock(block) {

}


console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);
