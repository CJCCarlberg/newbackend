const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const Statistics = new Schema({
  userId: { type: ObjectId, required: true }, // email
  someString: { type: String, required: true, maxlength: 2000 },
  someNumber: { type: Number, required: false },
}, {
  timestamps: true,
})

const StatisticsModel = mongoose.model('Statistics', Statistics)
module.exports = StatisticsModel
