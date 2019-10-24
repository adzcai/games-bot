const { Collection } = require('discord.js');
const Game = require('../Game.js');
const { roles, defaultRoles } = require('./roles');

const NUM_EVILS = {
  5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 4
}

const NUM_PLAYERS_ON_QUEST = {
  5: ['2', '3', '2', '3', '3'],
  6: ['2', '3', '4', '3', '4'],
  7: ['2', '3', '3', '4*', '4'],
  8: ['3', '4', '4', '5*', '5'],
  9: ['3', '4', '4', '5*', '5'],
  10: ['3', '4', '4', '5*', '5'],
};

const options = {
  addrole: {
    desc: 'Add a role to the game.',
    noflag: true,
    action(m, i, args) {
      const roleName = roles.findKey(r => r.regex.test(args[i+1]));
      if (this.status !== 'beginning') this.channel.send('That is not a valid command!');
      else if (!roleName) this.channel.send('That is not a valid role!');
      else {
        console.log(roleName);
        this.roles.set(roleName, roles.get(roleName));
        console.log(this.roles)
        this.updateGameEmbed();
      }
    }
  },
  removerole: {
    desc: 'Remove a role from the game.',
    noflag: true,
    action(m, ind, args) {
      const foundKey = this.roles.findKey(r => r.regex.test(args[i+1]));
      if (foundKey) {
        this.roles.delete(foundKey);
        this.updateGameEmbed();
        return;
      }
      this.channel.send('That is not a valid role!')
    }
  },
  view: {
    aliases: ['v'],
    usage: 'Resends the game board',
    action: async function () {
      try {
        await this.gameEmbedMessage.delete();
        const msg = await this.channel.send(this.gameEmbed);
        this.gameEmbedMessage = msg;
      } catch (err) {
        console.log(err)
      }
    }
  }
};

class AvalonGame extends Game {
  constructor(id, message) {
    super(id, message.channel, 'avalon', 'Avalon');
    this.roles = new Collection();
    this.addPlayer(message.author.id);
    this.gatherPlayers(message.author);
  }

  async gatherPlayers(initialSender) {
    this.gameEmbedMessage = await this.channel.send(this.gameEmbed);
    const prmpt = await this.channel.send(`Tap the button to join the game! ${initialSender}, tap the flag whenever you're ready to begin.`);
    const collector = prmpt.createReactionCollector(
      (r, user) => (r.emoji.name === '🤝' && !user.bot) || (r.emoji.name === '🚩' && user.id === initialSender.id),
      { time: 5 * 60 * 1000 },
    );

    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === '🚩') {
        if (this.players.size < 5 || this.players.size > 10) {
          this.channel.send('You need between 5 and 10 people to start!');
        } else if (this.roles.size !== this.players.size) {
          this.channel.send('You need the same amount of roles as players! Use .avalon addrole/removerole <role>');
        } else collector.stop();
      } else {
        reaction.users
          .filter(user => !user.bot && !this.players.has(user.id))
          .forEach(player => this.addPlayer(player.id));
        this.updateGameEmbed();
      }
    });

    collector.on('end', () => this.start());

    bot.on('messageReactionRemove', (reaction, user) => {
      if (reaction.emoji.name === '🤝' && reaction.message.id === prmpt.id) this.players.delete(user.id);
      this.updateGameEmbed();
    });

    await prmpt.react('🤝');
    await prmpt.react('🚩');
  }

  start() {
    // this.players.forEach((player) => {
    //   this.roles
    // });
  }

  get gameEmbed() {
    return (super.gameEmbed
      .addField('Players', this.players.size > 0 ? this.players.map(p => `- ${p.user}`).join('\n') : 'none')
      .addField('Roles', this.roles.keyArray().map(r => `- ${r}`).join('\n') || 'none')
    );
  }
}

AvalonGame.command = 'avalon';

module.exports = {
  cmd: 'avalon',
  desc: 'Play Avalon: The Resistance!',
  options,
  gameClass: AvalonGame,
};
