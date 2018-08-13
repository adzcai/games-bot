'use strict';

const fs = require('fs');

module.exports = {
	endGame,
	getCommands,
	clone,
	shuffle,
	askForPlayers
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

function askForPlayers(message, invitationMessage, collectorOptions, callback, emoji = '🤝') {
	let msg = await message.channel.send(invitationMessage);
	await msg.react(emoji);

	let playersEmbed = new RichEmbed().setTitle('Players').setDescription(message.member);
	let playerIDs = [];
	let playersMsg = await message.channel.send({embed: playersEmbed});

	const collector = msg.createReactionCollector((r, user) => (r.emoji.name === emoji) && user.id !== global.bot.id, collectorOptions);
	collector.on('collect', r => {
		playerIDs = r.users.filter(userID => userID !== global.bot.user.id);
		playersEmbed.setDescription(playerIDs.map(id => message.guild.members.get(id)).join('\n'));
		playersMsg.edit({embed: playersEmbed});
	});
	collector.on('end', callback)
}
