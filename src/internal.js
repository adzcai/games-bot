'use strict';

const fs = require('fs');

module.exports = {
	endGame,
	getCommands,
	clone,
	shuffle,
	askForPlayers,
	defineAliases
};

function endGame (message, gameType) {
	let server = global.servers[message.guild.id];
	if (typeof server.players[message.author.id][gameType] !== 'number')
		throw new Error('You are not currently in a game to cancel');

	let id = server.players[message.author.id][gameType];
	let players = [];
	server.games[id].players.forEach(player => {
		players.push(player);
		delete server.players[player][gameType]
	});

	delete server.games[id];
	return message.channel.send(`${players.map(id => message.guild.members.get(id)).join(', ')}, your games have been cancelled.`).catch(console.error);
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

async function askForPlayers(message, invitationMessage, filter, collectorOptions, onCollect, onEnd, reactions = []) {
	let msg = await message.channel.send(invitationMessage);
	for (let i = 0; i < reactions.length; i++)
		await msg.react(reactions[i]);

	let playersEmbed = new RichEmbed().setTitle('Players').setDescription(message.member);
	let playerIDs = [];
	let playersMsg = await message.channel.send({embed: playersEmbed});

	const collector = msg.createReactionCollector(filter, collectorOptions);
	collector.on('collect', (r, c) => {
		playerIDs = r.users.filter(userID => userID !== global.bot.user.id);
		playersEmbed.setDescription(playerIDs.map(id => message.guild.members.get(id)).join('\n'));
		playersMsg.edit({embed: playersEmbed});
		onCollect(r, c);
	});
	collector.on('end', onEnd);
}

function defineAliases(obj) {
	Object.values(obj).forEach(val => {
		if (val.aliases)
			val.aliases.forEach(alias => Object.defineProperty(obj, alias, { get: () => val }));
	});
}
