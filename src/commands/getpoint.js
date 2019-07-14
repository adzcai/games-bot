const Score = require('../../server/models/Score');

module.exports = {
  desc: 'Please don\'t spam this TOO much.',
  aliases: ['pt'],
  run(message) {
    Score.findOne({
      userId: message.author.id,
      serverId: message.guild.id,
    }, (err, res) => {
      if (err) {
        console.error(err);
        return message.reply('Sorry, an error occurred!').catch(logger.info);
      }

      if (!res) {
        const newScore = new Score({
          userId: message.author.id,
          serverId: message.guild.id,
          score: 1,
        });

        newScore.save().catch(logger.error);
      } else {
        res.score += 1;
        res.save().catch(logger.error);
      }

      return message.reply('You just gained `1` point!').catch(logger.info);
    });
  },
};
