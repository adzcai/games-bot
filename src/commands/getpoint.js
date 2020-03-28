const incScore = require('../util/incScore');

module.exports = {
  desc: 'Please don\'t spam this TOO much.',
  aliases: ['pt'],
  run(message) {
    incScore(message.author.id, message.guild.id, 1, (err) => {
      message.reply('You just gained `1` point!');
    });
  },
};
