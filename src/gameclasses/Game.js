

/*
 * This is the parent class for all games in the program.
 * Javascript does not support abstract classes, but this class should never
 * be instantiated directly.
 */

// All of the actions are called with the game as the object. Parameters: (message, index, args)
class Game {
  constructor(id, channel, command) {
    this.id = id;
    this.channel = channel;
    this.command = command;
    this.players = {};
    this.status = 'beginning';
  }

  init(message, args) {
    this.status = 'running';
    const opts = Object.getOwnPropertyNames(bot.commands.get(this.command).options);
    for (let i = 0; i < args.length; i += 1) {
      if (opts.includes(args[i])) {
        bot.commands.get(this.command).options[args[i]].action.call(this, message, i, args);
      }
    }
  }

  addPlayer(userID, otherProperties) {
    this.players[userID] = {
      id: userID,
      game: this,
      user: bot.users.get(userID),
      playing: true,
      leaveGame() {
        this.game.channel.send(`${this.user} has left the game!`);

        // Deletes this game from the player's list of games. Remember, this still references the
        // game
        const gamesList = servers[this.game.channel.guild.id].players[this.id];
        gamesList.splice(gamesList.indexOf(this.id), 1);

        this.playing = false;
      // This later gets destroyed by the interval initiated in bot.js
      },
    };
    Object.assign(this.players[userID], otherProperties);

    // Adds this game's ID to the player's list of games
    servers[this.channel.guild.id].players[userID][this.command] = this.id;
    return this.players[userID];
  }

  /*
 * Sends a prompt to the game's channel, with the given reactions as options.
 */
  async prompt(str, reactions, id) {
    const msg = await this.channel.send(str).catch(logger.error);
    for (const r of reactions) await msg.react(r);

    const collected = await msg.awaitReactions((r, user) => reactions.includes(r.emoji.name) && user.id === id, { maxUsers: 1, time: 60 * 1000 });
    if (collected.size < 1) {
      this.status = 'ended';
      return this.sendCollectorEndedMessage('timed out').catch(logger.error);
    }
    return collected;
  }

  sendCollectorEndedMessage(reason) {
    this.channel.send(`Collector ended. ${reason ? `Reason: ${reason}. ` : ''}Your game has been cancelled. Type "${process.env.DEFAULT_PREFIX}${this.type} cancel" to cancel this game \
     and then type ${process.env.DEFAULT_PREFIX}${this.type} to start a new one.`).catch(logger.error);
  }

  /*
 * Deletes the game and removes it from its players' lists.
 */
  async end() {
    this.players.forEach(player => player.leaveGame());
    this.status = 'ended';
    await this.channel.send(`${Object.values(this.players).map(p => p.user).join(', ')}, your ${this.type} games have ended.`).catch(logger.error);
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
//             const msg = await this.channel.send({embed: this.boardEmbed()}).catch(logger.error);
//             this.boardMessage = msg;
//         }
//     }
// };

module.exports = Game;
