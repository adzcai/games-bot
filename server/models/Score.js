const { Schema, model } = require('mongoose');

const scoreSchema = Schema({
  userId: {
    type: String,
    required: true,
  },
  serverId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
  },
});

module.exports = model('Score', scoreSchema);
