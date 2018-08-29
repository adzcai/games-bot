'use strict';

const fs = require('fs');
const startGame = require('./startGame.js');
const defineAliases = require('./defineAliases.js');

/*
 * Loads each file in the commands folder into an object,
 * and then loads each file in the gameclasses folder into the
 * same object if it has a type
 */
module.exports = () => {
	let commands = {};
	let command, cmdName, game;
	
	fs.readdirSync('src/commands').forEach(file => {
		command = require(`../commands/${file}`);
		cmdName = file.slice(0, -3);
		
		commands[cmdName] = command;
	});

	fs.readdirSync('src/gameclasses').forEach(file => {
		game = require(`../gameclasses/${file}`);
		if (game.type) {
			commands[game.type] = {
				run: (message, args) => startGame(message, args, game),
				help: game.help,
				aliases: game.aliases
			};
		}
	});

	return defineAliases(commands);
};