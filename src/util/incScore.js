const Score = require('../../server/models/Score');

module.exports = (userId, serverId, score) => {
  Score.findOne({
    userId,
    serverId,
  }, (err, res) => {
    if (err) {
      logger.error(err);
      return;
    }

    if (!res) {
      const newScore = new Score({
        userId,
        serverId,
        score,
      });

      newScore.save().catch(logger.error);
    } else {
      res.score += score;
      res.save().catch(logger.error);
    }
  });
};
