const incScore = require('../util/incScore');

const reactions = {
  '🇷': 0,
  '🇵': 1,
  '🇸': 2,
};

const words = ['Rock', 'Paper', 'Scissors'];

const results = [
  // Rock Paper Scissors
  [0, 1, -1], // Rock
  [-1, 0, 1], // Paper
  [1, -1, 0], // Scissors
];

module.exports = {
  aliases: ['rps'],
  desc: 'Plays rock paper scissors',
  async run(message) {
    if (message.mentions.members.size < 1) {
      message.channel.send('Please ping someone to challenge them!');
      return;
    }
    message.channel.send('Wait for a DM to tell me your choice!').catch(logger.error);
    const players = [message.author, message.mentions.users.first()];

    Promise.all(players.map(async (player) => {
      if (player.id === bot.user.id) {
        return Object.values(reactions)[Math.floor(Math.random() * 3)];
      }

      const msg = await player.send('Would you like to show 🇷ock, 🇵aper, or 🇸cissors?').catch(logger.error);
      // eslint-disable-next-line no-await-in-loop
      for (const r of Object.keys(reactions)) await msg.react(r);

      const collected = await msg.awaitReactions((r, user) => ['🇷', '🇵', '🇸'].includes(r.emoji.name) && user.id === player.id, { maxUsers: 1, time: 60 * 1000 }).catch(logger.error);
      if (collected.size < 1) {
        return message.channel.send('The collector timed out. Please play again!').catch(logger.error);
      }

      player.send(`You chose ${collected.first().emoji.name}.`);
      return reactions[collected.first().emoji.name];
    })).then((val) => {
      let result = '';
      [0, 1].forEach((ind) => {
        result += `${players[ind]} chose ${words[val[ind]]}\n`;
      });
      const p1won = results[val[1]][val[0]];
      if (!p1won) {
        result += 'It was a draw. GG!';
      } else {
        const winner = p1won === 1 ? players[0] : players[1];
        const loser = p1won === 1 ? players[1] : players[0];
        result += `${winner} won. GG! \`+5\` points!\nToo bad, ${loser}: you lose \`3\` points. :(`;
        incScore(winner.id, message.guild.id, 5);
        incScore(loser.id, message.guild.id, -3);
      }

      return message.channel.send(result).catch(logger.error);
    });
  },
};
