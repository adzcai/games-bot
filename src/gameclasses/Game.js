const { RichEmbed, Collection } = require('discord.js');
const incScore = require('../util/incScore');

/*
 * This is the parent class for all games in the program.
 * Javascript does not support abstract classes, but this class should never
 * be instantiated directly.
 */
class Game {
  constructor(id, channel, command, name) {
    this.id = id;
    this.channel = channel;
    this.command = command;
    this.name = name;
    this.players = new Collection();
    this.status = 'beginning';
    this.winnerScore = 0;
  }

  run(message, args) {
    const { options } = bot.commands.get(this.command);
    args.forEach((arg, i) => {
      if (arg in options) { options[arg].action.call(this, message, i, args); }
    });
  }

  start() {
    this.status = 'running';
    this.channel.send('This game has not been implemented yet!');
  }

  async gatherPlayers(initialSender, cb) {
    const prmpt = await this.channel.send(`Tap the button to join the game! ${initialSender}, tap the flag whenever you're ready to begin.`);
    const collector = prmpt.createReactionCollector(
      (r, user) => (r.emoji.name === '🤝' && !user.bot) || (r.emoji.name === '🚩' && user.id === initialSender.id),
      { time: 5 * 60 * 1000 },
    );

    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === '🚩') collector.stop();
      else {
        const playerIds = reaction.users.filter(user => !user.bot).keyArray();
        if (!playerIds.includes(initialSender.id)) playerIds.push(initialSender.id);
        this.players.clear();
        playerIds.forEach((id) => {
          this.addPlayer(id, { isSpy: false, scratched: [] });
        });
        this.updateGameEmbed();
      }
    });

    collector.on('end', () => cb());

    bot.on('messageReactionRemove', (reaction, user) => {
      if (reaction.emoji.name === '🤝' && reaction.message.id === prmpt.id) this.players.delete(user.id);
      this.updateGameEmbed();
    });

    await prmpt.react('🤝');
    await prmpt.react('🚩');
  }

  get gameEmbed() {
    const embed = new RichEmbed()
      .setTitle(this.name)
      .setFooter(`Type "${process.env.DEFAULT_PREFIX || '.'}${this.command} help" to get help about this function.`)
      .setTimestamp();
    return embed;
  }

  updateGameEmbed() {
    this.gameEmbedMessage.edit({ embed: this.gameEmbed });
  }

  addPlayer(userId, otherProperties) {
    this.players.set(userId, Object.assign({
      id: userId,
      user: bot.users.get(userId),
      playing: true,
    }, otherProperties));
    return this.players.get(userId);
  }

  /**
   * Sends a prompt to the game's channel, with the given reactions as options.
   * @param {*} str the string to prompt the user with.
   * @param {*} reactions options that the user can click.
   * @param {*} id the id of the user that is expected to respond.
   */
  async prompt(str, reactions, id, filter, options) {
    const msg = await this.channel.send(str);
    await this.gameEmbedMessage.clearReactions();

    const [, collected] = await Promise.all([
      (async () => {
        // eslint-disable-next-line no-await-in-loop
        for (const r of reactions) await this.gameEmbedMessage.react(r);
      })(),
      (async () => this.gameEmbedMessage.awaitReactions(
        filter || ((r, user) => reactions.includes(r.emoji.name) && user.id === id),
        options || { maxUsers: 1, time: 60 * 1000 },
      ))(),
    ]);

    await msg.delete();

    if (collected.size < 1) {
      this.status = 'ended';
      this.end('Collector timed out.');
      return false;
    }

    await this.gameEmbedMessage.clearReactions();
    return collected;
  }

  /**
   * Marks the game for removal by the bot.
   * @param {*} message an optional message to add.
   * @param {object} options options to pass.
   * @param {string} options.winner the winner
   */
  end(message, options = {}) {
    this.status = 'ended';
    this.channel.send(`${message ? `${message}\n` : ''}${this.players.map(p => p.user).join(', ')}, your ${this.name} games have ended. Type ${process.env.DEFAULT_PREFIX || '.'}${this.command} to start a new one.`);
    if (options.winner && this.winnerScore) {
      incScore(options.winner, this.channel.guild.id, this.winnerScore);
    }
  }
}

// Static functions
const defaultOptions = {
  leave: {
    aliases: ['leave', 'l', 'quit', 'q'],
    usage: 'Leaves the game',
    action(message) {
      this.leaveGame(message.author.id);
    },
  },
  cancel: {
    aliases: ['c'],
    usage: 'If the user is in a game, cancels it',
    action() {
      this.end();
    },
  },
};

Game.defaultOptions = defaultOptions;

module.exports = Game;
