'use strict';

/*
 * This is the parent class for all games in the program.
 * Javascript does not support abstract classes, but this class should never
 * be instantiated directly.
 */

const defineAliases = require('../internal/defineAliases.js');

module.exports = Game;

/*
 * All of the actions are called with the game as the object
 */
const defaultOptions = {
	leave: {
		aliases: ['leave', 'l', 'quit', 'q'],
		usage: 'Leaves the game',
		action: function (message) {
			this.leaveGame(message.author.id);
		}
	},
	cancel: {
		aliases: ['c'],
		afterInit: true,
		usage: 'If the user is in a game, cancels it',
		action: function () {
			this.end();
		}
	},
	view: {
		aliases: ['v'],
		afterInit: true,
		usage: 'Resends the game board',
		action: async function () {
			const msg = await this.channel.send({embed: this.boardEmbed()}).catch(global.logger.error);
			this.boardMessage = msg;
		}
	}
};

const defaultSettings = {
	options: defineAliases(defaultOptions),
	awaitPlayers: false,
	numPlayersRange: [2, 4],
	aliases: []
};

function Game(id, channel, type, settings) {
	this.id = id;
	this.channel = channel;
	this.type = type;
	this.players = {};

	this.settings = Object.assign({}, defaultSettings, settings);

	this.usage = `${process.env.DEFAULT_PREFIX}${type} [**${Object.keys(this.settings.options).join('**] [**')}**]`;
	this.description = settings.description || `Plays ${this.type}`;
	this.status = 'beginning';
}

Game.prototype.init = function (message, args) {
	for (let i = 0; i < args.length; i++)
		if (Object.keys(this.settings.options).includes(args[i]))
			if (!this.settings.options[args[i].afterInit])
				this.settings.options[args[i]].action.call(this.settings, i, args);
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
	global.servers[this.channel.guild.id].players[userID].push(this.id);
};

Game.prototype.sendCollectorEndedMessage = function (reason) {
	this.channel.send(`Collector ended. ${reason ? `Reason: ${reason}. ` : ''}Type "${process.env.DEFAULT_PREFIX}${this.type} cancel" to cancel this game \
	 and then type ${process.env.DEFAULT_PREFIX}${this.type} to start a new one.`).catch(global.logger.error);
};

Game.prototype.resetReactions = async function (msg=this.boardMessage, emojis=Object.keys(this.reactions)) {
	await msg.clearReactions().catch(global.logger.error);
	for (let emoji of emojis)
		await msg.react(emoji);
};

Game.prototype.areReactionsReset = function (msg=this.boardMessage, reactions = Object.keys(this.reactions)) {
	const reactedEmojis = msg.reactions.map(re => re.emoji.name);
	return (reactions.every(emoji => reactedEmojis.includes(emoji)));
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