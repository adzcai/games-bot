'use strict';

/*
 * This is the parent class for all games in the program.
 * Javascript does not support abstract classes, but this class should never
 * be instantiated directly.
 */

module.exports = Game;

const commands = require('../internal/getCommands.js')();

// All of the actions are called with the game as the object. Parameters: (message, index, args)
function Game(id, channel, command) {
	this.id = id;
	this.channel = channel;
	this.command = command;
	this.players = {};
	this.status = 'beginning';
}

Game.prototype.init = function (message, args) {
	this.status = 'running';
	let i, len = args.length;
	for (i = 0; i < len; i++)
		if (Object.keys(commands[this.command].options).includes(args[i]))
			commands[this.command].options[args[i]].action.call(this, message, i, args);
};

Game.prototype.addPlayer = function (userID, otherProperties) {
	this.players[userID] = {
		id: userID,
		game: this,
		user: global.bot.users.get(userID),
		playing: true,
		leaveGame: function () {
			this.game.channel.send(`${this.user} has left the game!`);
		
			// Deletes this game from the player's list of games. Remember, this still references the game
			let gamesList = global.servers[this.game.channel.guild.id].players[this.id];
			gamesList.splice(gamesList.indexOf(this.id), 1);

			this.playing = false;
			// This later gets garbage collected by the game
		}
	};
	Object.assign(this.players[userID], otherProperties);

	// Adds this game's ID to the player's list of games
	global.servers[this.channel.guild.id].players[userID][this.command] = this.id;
};

/*
 * Sends a prompt to the game's channel, with the given reactions as options.
 */
Game.prototype.prompt = async function (str, reactions, id) {
	let msg = await this.channel.send(str).catch(global.logger.error);
	for (let r of reactions) await msg.react(r);

	const collected = await msg.awaitReactions((r, user) => reactions.includes(r.emoji.name) && user.id === id, {maxUsers: 1, time: 60 * 1000});
	if (collected.size < 1) {
		this.status = 'ended';
		return this.sendCollectorEndedMessage('timed out').catch(global.logger.error);
	}
	return collected;
};

Game.prototype.sendCollectorEndedMessage = function (reason) {
	this.channel.send(`Collector ended. ${reason ? `Reason: ${reason}. ` : ''}Your game has been cancelled. Type "${process.env.DEFAULT_PREFIX}${this.type} cancel" to cancel this game \
	 and then type ${process.env.DEFAULT_PREFIX}${this.type} to start a new one.`).catch(global.logger.error);
};

/*
 * Deletes the game and removes it from its players' lists.
 */
Game.prototype.end = async function () {
	this.players.forEach(player => player.leaveGame());
	this.status = 'ended';
	await this.channel.send(`${Object.values(this.players).map(p => p.user).join(', ')}, your ${this.type} games have ended.`).catch(global.logger.error);
	// delete global.servers[this.channel.guild.id].games[this.id];
};

// Static functions
// const defaultOptions = {
// 	leave: {
// 		aliases: ['leave', 'l', 'quit', 'q'],
// 		usage: 'Leaves the game',
// 		action: function (message) {
// 			this.leaveGame(message.author.id);
// 		}
// 	},
// 	cancel: {
// 		aliases: ['c'],
// 		usage: 'If the user is in a game, cancels it',
// 		action: function () {
// 			this.end();
// 		}
// 	},
// 	view: {
// 		aliases: ['v'],
// 		usage: 'Resends the game board',
// 		action: async function () {
// 			const msg = await this.channel.send({embed: this.boardEmbed()}).catch(global.logger.error);
// 			this.boardMessage = msg;
// 		}
// 	}
// };
