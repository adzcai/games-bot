'use strict';

const SpyfallGame = require('../gameclasses/SpyfallGame.js');
const askForPlayers = require('../internal/askForPlayers.js');

module.exports = {
	run: playSpyfall,
	usage: (prefix) => `${prefix}spyfall [**-l**] [-v __edition__]`,
	desc: 'Play Spyfall with a group of friends!',
};

const options = {
	version: {
		aliases: ['v'],
		usage: 'Plays with the locations in Spyfall __edition__ (1, 2, or "both")',
		action: (ind, args) => {
			let version = args[ind + 1];
			if (!version) return undefined;
			if (['1', '2', 'both'].includes(version))
				return version;
			return undefined;
		}
	}
	// leave: {
	// 	aliases: ['l'],
	// 	usage: 'If the user is in a game, leaves it',
	// 	action: (message) => {
	// 		let server = global.servers[message.guild.id];
	// 	}
	// }
};

async function playSpyfall(message, args) {
	let server = global.servers[message.guild.id];
    
	if (typeof server.players[message.author.id].spyfall === 'undefined') {
		const filter = (r, user) => !(user.bot) && (r.emoji.name === '🤝') || ((r.emoji.name === '🕵') && (user.id === message.author.id));
		
		const onCollect = async (r, col) => {
			if (r.emoji.name === '🕵') {
				let id = Object.keys(server.games).length;
				server.games[id] = new SpyfallGame(id, message.channel, options.version(args)); // TODO
				await server.games[id].start(r.users.map(user => user.id)); // To check
				col.stop('game starting');
				return;
			}
		};

		const onEnd = (collected, reason) => {
			if (reason === 'game starting') return;
		};

		askForPlayers(message,
			`Let's play Spyfall! Tap 🤝 to join the game. ${message.member}, tap 🕵 whenever you're ready to start the game!`,
			filter,
			{time: 60 * 1000},
			onCollect,
			onEnd,
			['🤝', '🕵']
		);
	} else {
		for (let i = 0; i < args.length; i++) {
			if (options.hasOwnProperty(args[i])) {
				options[args[i]].action(message);
				return;
			}
		}
		message.channel.send('You are already in a game! Type .ttt -v to resend the grid.');
	}
}
