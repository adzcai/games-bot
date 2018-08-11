'use strict';

const fs = require('fs');

module.exports = {
	endGame,
	getCommands,
	clone,
	shuffle
};

function endGame (message) {
	let server = global.servers[message.guild.id];
	if (typeof server.players[message.author.id].tictactoe !== 'number')
		throw new Error('You are not currently in a game to cancel');

	let id = server.players[message.author.id];
	server.games[id].players.forEach(player => delete server.players[player].tictactoe);
	delete server.games[id];
	return message.channel.send('Game cancelled');
}

function getCommands () {
	let commands = {};
	fs.readdirSync('src/commands').forEach(file => {
		let command = require(`./commands/${file}`);
		let cmdName = file.slice(0, -3);
		
		commands[cmdName] = command;
		if (command.aliases)
			command.aliases.forEach(alias => Object.defineProperty(commands, alias, { get: () => command }));
	});
	return commands;
}

function clone (obj) {
	let newObj = {};
	for (let i in obj) {
		if (obj[i] != null &&  typeof obj[i] == 'object')
			newObj[i] = clone(obj[i]);
		else
			newObj[i] = obj[i];
	}
	return newObj;
}

function shuffle (list) {
	let arr = list.slice();
	let j, x, i;
	for (i = arr.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = arr[i];
		arr[i] = arr[j];
		arr[j] = x;
	}
	return arr;
}