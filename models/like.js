const mongoose = require('mongoose')

const likeSchema = mongoose.Schema({
  stock: { type: String, required: true },
  ip: { type: String, required: true }
})

likeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Like', likeSchema)
