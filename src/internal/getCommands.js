'use strict';

const fs = require('fs');
const startGame = require('./startGame.js');
const defineAliases = require('./defineAliases.js');

/*
 * Loads each file in the commands folder into an object,
 * and then loads each file in the gameclasses folder into the
 * same object if it has a command
 */
module.exports = () => {
	let commands = {};
	let cmdData, cmdName, game;
	
	fs.readdirSync('src/commands').forEach(file => {
		cmdData = require(`../commands/${file}`);
		cmdName = file.slice(0, -3);
		
		commands[cmdName] = generateCommand(Object.assign(cmdData, {cmd: cmdName}));
	});

	fs.readdirSync('src/gameclasses').forEach(file => {
		game = require(`../gameclasses/${file}`);
		if (game.cmd) commands[game.cmd] = generateCommand(game, game.gameClass);
	});

	return defineAliases(commands);
};

function generateCommand (data, game) {
	let defaults = game ? {run: (message, args) => startGame(message, args, game)} : {};
	let cmdData = Object.assign(defaults, data);
	
	cmdData.usage = cmdData.cmd;
	if (cmdData.params)
		Object.getOwnPropertyNames(cmdData.params).forEach(param =>
			cmdData.usage += ` __${param}__`
		);
	if (cmdData.options)
		Object.getOwnPropertyNames(cmdData.options).forEach(opt =>
			cmdData.usage += ` [**${opt}** __${cmdData.options[opt]}__]`
		);

	return cmdData;
}