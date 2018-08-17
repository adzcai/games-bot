'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const SpyfallGame = require('../gameclasses/SpyfallGame.js');
const defineAliases = require('../internal/defineAliases.js');

module.exports = {
	run: playSpyfall,
	usage: (prefix) => `${prefix}spyfall [**-l**] [-v __edition__]`,
	desc: 'Play Spyfall with a group of friends!',
};

function getVersion (args) {
	for (let i = 0; i < args.length; i++) {
		if (['version', 'v'].includes(args[i])) {
			let version = args[i + 1];
			if (!version) return undefined;
			if (['1', '2', 'both'].includes(version))
				return version;
			return undefined;
		}
	}
}

let options = {
	leave: {
		aliases: ['l', 'quit', 'q'],
		run: (message) => {
			let server = global.servers[message.guild.id];
			let game = server.games[server.players[message.author.id].spyfall];
			game.leaveGame(message.author.id);
		}
	}
};

defineAliases(options);

async function playSpyfall(message, args) {
	let server = global.servers[message.guild.id];
    
	if (typeof server.players[message.author.id].spyfall === 'undefined') {
		let msg = await message.channel.send('Let\'s play Spyfall! Tap 🤝 to join the game.Tap 🕵 whenever you\'re ready to start the game!');
		await msg.react('🤝');
		await msg.react('🕵');
		let playersEmbed = new RichEmbed().setTitle('Players');
		let playersMsg = await message.channel.send({embed: playersEmbed});
		let playerIDs = [];

		const collector = msg.createReactionCollector((r, user) => !(user.bot) && (r.emoji.name === '🤝') || (r.emoji.name === '🕵'), {time: 60 * 1000});

		collector.on('collect', (r, c) => {
			if (r.emoji.name === '🕵') {
				let id = Object.keys(server.games).length;
				server.games[id] = new SpyfallGame(id, message.channel, getVersion(args));
				server.games[id].start(playerIDs);
				c.stop('game starting');
				return;
			}
			playerIDs = r.users.keyArray().filter(id => !global.bot.users.get(id).bot);
			playersEmbed.setDescription(playerIDs.map(id => message.guild.members.get(id)).join('\n'));
			playersMsg.edit({embed: playersEmbed});
		});

		collector.on('end', (collected, reason) => {
			if (reason === 'game starting') return;
			message.channel.send('The collection timed out or there was an error').catch(console.error);
		});
	} else {
		for (let arg of args)
			if (options.hasOwnProperty(arg))
				return options[arg].action(message);
		message.channel.send('You are already in a game!').catch(console.error);
	}
}
