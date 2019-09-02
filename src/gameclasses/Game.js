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

  async init(message, args) {
    this.status = 'running';
    this.gameEmbedMessage = await this.channel.send(this.gameEmbed);
    const opts = Object.getOwnPropertyNames(bot.commands.get(this.command).options);
    for (let i = 0; i < args.length; i += 1) {
      if (opts.includes(args[i])) {
        bot.commands.get(this.command).options[args[i]].action.call(this, message, i, args);
      }
    }
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

    this.updateGameEmbed();
    // Adds this game's ID to the player's list of games
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
// const defaultOptions = {
//     leave: {
//         aliases: ['leave', 'l', 'quit', 'q'],
//         usage: 'Leaves the game',
//         action: function (message) {
//             this.leaveGame(message.author.id);
//         }
//     },
//     cancel: {
//         aliases: ['c'],
//         usage: 'If the user is in a game, cancels it',
//         action: function () {
//             this.end();
//         }
//     },
//     view: {
//         aliases: ['v'],
//         usage: 'Resends the game board',
//         action: async function () {
//             const msg = await this.channel.send({embed: this.boardEmbed()});
//             this.boardMessage = msg;
//         }
//     }
// };

module.exports = Game;
