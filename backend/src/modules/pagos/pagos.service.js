const Pago = require('./pagos.model');
const { mineBlock } = require('../blockchain/mining.service');
const BlockchainService = require('../blockchain/blockchain.service');
const { MINING_DIFFICULTY } = require('../../config/env');

class PagosService {
  static async getAll() {
    return Pago.find().sort({ index: 1 }).lean();
  }

  static async getById(id) {
    return Pago.findById(id).lean();
  }

  static async getStats() {
    const pagos = await Pago.find().lean();
    
    let total = 0;
    const byMetodo = {};
    const byMes = {};
    const byConcepto = {};
    
    pagos.forEach(p => {
      const { valor, metodo, mes, concepto } = p.data;
      total += valor;
      
      byMetodo[metodo] = (byMetodo[metodo] || 0) + valor;
      byMes[mes] = (byMes[mes] || 0) + valor;
      byConcepto[concepto] = (byConcepto[concepto] || 0) + valor;
    });
    
    return { total, byMetodo, byMes, byConcepto };
  }

  static async create(pagoData) {
    // Get last block
    const lastBlock = await Pago.findOne().sort({ index: -1 });
    const newIndex = lastBlock ? lastBlock.index + 1 : 0;
    const previousHash = lastBlock ? lastBlock.hash : '';
    
    let newBlock = {
      index: newIndex,
      date: new Date(),
      data: pagoData,
      previousHash: previousHash,
      nonce: 0,
      hash: ''
    };
    
    // Mine block
    newBlock = mineBlock(newBlock, MINING_DIFFICULTY);
    
    const pago = new Pago(newBlock);
    await pago.save();
    return pago;
  }

  static async update(id, updateData) {
    const pagoToUpdate = await Pago.findById(id);
    if (!pagoToUpdate) throw new Error('Pago not found');

    pagoToUpdate.data = { ...pagoToUpdate.data, ...updateData };
    
    // Fetch all chain
    const chain = await Pago.find().sort({ index: 1 }).lean();
    
    // Replace the block in the chain array
    const blockIndexInChain = chain.findIndex(b => b._id.toString() === id);
    if (blockIndexInChain === -1) throw new Error('Block not found in chain');
    
    chain[blockIndexInChain].data = pagoToUpdate.data;
    
    // Remine from this block
    const reminedChain = BlockchainService.remineFrom(chain, blockIndexInChain);
    
    // Save updated chain
    // Usually we would use bulkWrite for performance
    const bulkOps = reminedChain.map(block => ({
      updateOne: {
        filter: { _id: block._id },
        update: { 
          $set: { 
            data: block.data, 
            hash: block.hash, 
            previousHash: block.previousHash, 
            nonce: block.nonce 
          } 
        }
      }
    }));
    
    await Pago.bulkWrite(bulkOps);
    
    return reminedChain[blockIndexInChain];
  }

  static async delete(id) {
    const pagoToDelete = await Pago.findById(id);
    if (!pagoToDelete) throw new Error('Pago not found');
    
    const indexToDelete = pagoToDelete.index;
    
    // Delete block
    await Pago.findByIdAndDelete(id);
    
    // Fetch remaining chain
    const chain = await Pago.find().sort({ index: 1 }).lean();
    
    if (chain.length > 0 && indexToDelete < chain.length + 1) { // If it wasn't the last block
      // Remine from the index of the deleted block (which is now occupied by the next block)
      const reminedChain = BlockchainService.remineFrom(chain, indexToDelete);
      
      const bulkOps = reminedChain.map(block => ({
        updateOne: {
          filter: { _id: block._id },
          update: { 
            $set: { 
              index: block.index,
              hash: block.hash, 
              previousHash: block.previousHash, 
              nonce: block.nonce 
            } 
          }
        }
      }));
      
      await Pago.bulkWrite(bulkOps);
    }
    
    return { message: 'Pago deleted and chain remined' };
  }
}

module.exports = PagosService;
