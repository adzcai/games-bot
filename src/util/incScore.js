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

      newScore.save().catch(e => cb(e));
    } else {
      res.score += score;
      res.save().catch(e => cb(e));
    }
  });
};
