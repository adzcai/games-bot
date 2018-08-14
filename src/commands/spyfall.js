'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const internal = require('./../internal.js');

// User commands

module.exports = {
	run: (message, args) => playSpyfall(message, args),
	usage: (prefix) => `${prefix}spyfall [**-l**] [-v __edition__]`,
	desc: 'Play Spyfall with a group of friends!',
};

const options = {
	version: {
		aliases: ['v'],
		usage: 'Plays with the locations in Spyfall __edition__ (1, 2, or "both")'},
	leave: {
		aliases: ['l'],
		usage: 'If the user is in a game, leaves it'
	}
};

async function playSpyfall(message, args) {
	let server = global.servers[message.guild.id];
    
	if (typeof server.players[message.author.id].spyfall === 'undefined') {
		const filter = (r, user) => !(user.bot) && (r.emoji.name === '🤝') || ((r.emoji.name === '🕵') && (user.id === message.author.id))
		const onCollect = async (r, col) => {
			if (r.emoji.name === '🕵') {
				let id = Object.keys(server.games).length;
				server.games[id] = new SpyfallGame(id, message.channel, players, args.includes('-v') ? (['1', '2', 'both'].includes(args[(args.indexOf('-v') + 1)]) ? args[(args.indexOf('-v') + 1)] : undefined) : undefined);
				await server.games[id].start(players);
				col.stop('game starting');
				return;
			}
			Object.assign(players, Object.keys(r.users).map(id => id !== global.bot.user.id));
			joined.edit(`Players:\n${players.map(id => message.guild.members.get(id)).join('\n')}`);
		};
		
		const onEnd = (collected, reason) => {
			if (reason == 'game starting') return;
		};

		internal.askForPlayers(message,
			`Let's play Spyfall! Tap 🤝 to join the game. ${message.member}, tap 🕵 whenever you're ready to start the game!`,
			filter,
			{time: 60 * 1000},
			onCollect,
			onEnd,
			['🤝', '🕵']
		)
	} else {
		for (let i = 0; i < args.length; i++) {
			switch (args[i]) {
				case '--cancel':
				case '-c':
					internal.endGame(message);
					return;
					break;
				case '--view':
				case '-v':
					let gameID = server.players[message.author.id].tictactoe;
					let game = server.games[gameID];
					const msg = await message.guild.channels.get(game.channel).send({embed: game.boardEmbed()});
					game.boardMessage = msg;
					break;
			}
		}
		message.channel.send('You are already in a game! Type .ttt -v to resend the grid.');
	}
}
