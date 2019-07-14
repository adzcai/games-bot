const Score = require('../../server/models/Score');

module.exports = {
  desc: 'Please don\'t spam this TOO much.',
  aliases: ['pt'],
  run(message) {
    Score.findOneAndUpdate({
      userId: message.author.id,
      serverId: message.guild.id,
    }, { $inc: { score: 1 } }, { upsert: true }, (err) => {
      if (err) {
        logger.error(err);
        return message.reply('Sorry, an error occurred!').catch(logger.info);
      }

      return message.reply('You just gained `1` point!').catch(logger.info);
    });
  },
};
