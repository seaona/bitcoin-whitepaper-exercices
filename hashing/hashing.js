"use strict";

const crypto = require("crypto");
const { stat } = require("fs");

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

function createBlock (line) {
	var index = Blockchain.blocks.length;
	var block = new Object();
	block.index = index
	block.prevHash = Blockchain.blocks[index-1].hash;
	block.data = line
	block.timestamp = Date.now();
	var hash = blockHash(block);
	block.hash = hash;
	Blockchain.blocks.push(block);
	console.log(block)
}

function blockHash(bl) {
	const hashedBlock = crypto.createHash('sha256')
	.update(JSON.stringify(bl))
	.digest('hex')
	return hashedBlock
}

function createBlockchain() {
	for (let line of poem) {
		createBlock(line)
	}
}


createBlockchain()
console.log(`Blockchain is ${verifyChain(Blockchain)}`)

function verifyChain(blockchain) {
	let statusArray = [];
	let status =""
	const chainLength = blockchain.blocks.length

	for(let i=1; i<chainLength; i++) {
		statusArray.push(verifyBlock(blockchain.blocks[i], blockchain))
	}

	if(statusArray.indexOf(false) === -1) {
		status = "valid"
	}

	else {
		status = "not valid"
	}

	return status;
}

function verifyBlock(block, blockchain) {
	var valid = true
	// data is non-empty
	if(!block.data) {
		console.log(`For block number ${block.index} the data field is empty`)
		valid = false
	}

	// Genesis block has 000000 on block.hash
	if(block.index === 0 && block.hash != "000000") {
		console.log(`For the Genesis block the hash is not 000000`)
		valid = false
	}

	// Previous block hash must be non-empty
	if(!block.prevHash) {
		console.log(`For block number ${block.index} the prevHash field is empty`)
		valid = false
	}

	// Previous block Hash must match block hash from previous block
	if( block.prevHash !== blockchain.blocks[block.index-1].hash) {
		console.log(`For block number ${block.index} the prevHash field is empty`)
		valid = false
	}
	
	// Compute hash and verify it's correct
	const subset = (({index, prevHash, data, timestamp}) => ({index, prevHash, data, timestamp}))(block);
	if(block.hash !== blockHash(subset)) {
		console.log(`For block number ${block.index} the hash is not correct`)
		valid = false
	}

	// Index must be an integer
	if(block.index < 0) {
		console.log(`For block number ${block.index} the index is not correct`)
		valid = false
	}

	return valid;
}

