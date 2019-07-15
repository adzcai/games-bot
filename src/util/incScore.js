const Score = require('../../server/models/Score');

module.exports = (userId, serverId, score, cb) => {
  Score.findOne({
    userId,
    serverId,
  }, (err, res) => {
    if (err) {
      cb(err);
    } else if (!res) {
      const newScore = new Score({
        userId,
        serverId,
        score,
      });
      newScore.save().then(val => cb(null, val)).catch(e => cb(e));
    } else {
      res.score += score;
      res.save().then(val => cb(null, val)).catch(e => cb(e));
    }
  });
};
