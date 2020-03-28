const Score = require('../../server/models/Score');

module.exports = {
  desc: 'Check your current score.',
  run(message) {
    Score.findOne({
      userId: message.author.id,
      serverId: message.guild.id,
    }, (err, res) => {
      if (err) {
        debug(err);
        return message.reply('Sorry, an error occurred!');
      }

      return message.reply(res ? `You have \`${res.score}\` points!` : 'You have not gotten any points yet!');
    });
  },
};
