const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index,data,previousHash=''){
    this.index = index;
    this.data = data;
    this.date = new Date();
    this.previousHash = previousHash;
    this.hash = this.createHash();
    }
    createHash(){
        return SHA256(this.index + this.data + this.date + this.previousHash ).toString();
    }
}

block = new Block(1,'Hola');
console.log(JSON.stringify(block,null,2));