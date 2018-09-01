'use strict';

let commands;

/*
 * This function simply starts the game. It is called when a player types the prefix followed by
 * the name of the game.
 */

module.exports = async function (message, args, gameClass) {
	let server = global.servers[message.guild.id];

	// If the player is already in a game, see if they call any arguments
	let playerGameID = server.players[message.author.id][gameClass.type];
	let argsPassed = false;
	if (playerGameID) {
		let playerGame = server.games[playerGameID];
		commands = (require('./getCommands.js'))();
		for (let i = 0; i < args.length; i++) {
			if (commands[playerGame.command].options.hasOwnProperty(args[i])) {
				args[i].action.call(playerGame, message, args);
				argsPassed = true;
			}
		}
		if (argsPassed) return;
		return playerGame.channel.send(`You are already in a game! Type ${process.env.DEFAULT_PREFIX}${playerGame.type} view to resend the message.`).catch(global.logger.error);
	}

	let id = Math.random().toString(36).substr(2, 9);
	server.games[id] = new gameClass(id, message.channel);
	server.games[id].init(message, args);
};