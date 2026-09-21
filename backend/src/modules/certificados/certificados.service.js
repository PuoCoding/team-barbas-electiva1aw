const Certificado = require('./certificados.model');
const { mineBlock } = require('../blockchain/mining.service');
const BlockchainService = require('../blockchain/blockchain.service');
const { MINING_DIFFICULTY } = require('../../config/env');

class CertificadosService {
  static async getAll() {
    return Certificado.find().sort({ index: 1 }).lean();
  }

  static async getById(id) {
    return Certificado.findById(id).lean();
  }

  static async create(data) {
    const lastBlock = await Certificado.findOne().sort({ index: -1 });
    const newIndex = lastBlock ? lastBlock.index + 1 : 0;
    const previousHash = lastBlock ? lastBlock.hash : '';
    
    let newBlock = {
      index: newIndex,
      date: new Date(),
      data: data,
      previousHash: previousHash,
      nonce: 0,
      hash: ''
    };
    
    newBlock = mineBlock(newBlock, MINING_DIFFICULTY);
    const doc = new Certificado(newBlock);
    await doc.save();
    return doc;
  }

  static async update(id, updateData) {
    const docToUpdate = await Certificado.findById(id);
    if (!docToUpdate) throw new Error('Certificado not found');

    docToUpdate.data = { ...docToUpdate.data, ...updateData };
    
    const chain = await Certificado.find().sort({ index: 1 }).lean();
    const blockIndex = chain.findIndex(b => b._id.toString() === id);
    if (blockIndex === -1) throw new Error('Block not found');
    
    chain[blockIndex].data = docToUpdate.data;
    
    const reminedChain = BlockchainService.remineFrom(chain, blockIndex);
    
    const bulkOps = reminedChain.map(block => ({
      updateOne: {
        filter: { _id: block._id },
        update: { $set: { data: block.data, hash: block.hash, previousHash: block.previousHash, nonce: block.nonce } }
      }
    }));
    
    await Certificado.bulkWrite(bulkOps);
    return reminedChain[blockIndex];
  }

  static async delete(id) {
    const doc = await Certificado.findById(id);
    if (!doc) throw new Error('Certificado not found');
    
    const indexToDelete = doc.index;
    await Certificado.findByIdAndDelete(id);
    
    const chain = await Certificado.find().sort({ index: 1 }).lean();
    
    if (chain.length > 0 && indexToDelete < chain.length + 1) {
      const reminedChain = BlockchainService.remineFrom(chain, indexToDelete);
      const bulkOps = reminedChain.map(block => ({
        updateOne: {
          filter: { _id: block._id },
          update: { $set: { index: block.index, hash: block.hash, previousHash: block.previousHash, nonce: block.nonce } }
        }
      }));
      await Certificado.bulkWrite(bulkOps);
    }
    
    return { message: 'Certificado deleted and chain remined' };
  }
}

module.exports = CertificadosService;
