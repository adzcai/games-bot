'use strict';

const CoupGame = require('./../gameclasses/CoupGame.js');
const endGame = require('../internal/endGame.js');
const defineAliases = require('../internal/defineAliases.js');
const askForPlayers = require('../internal/askForPlayers.js');

module.exports = {
	desc: 'Plays the board game Coup',
	usage: (prefix) => `${prefix}coup`,
	run: playCoup
};

const options = {
	cancel: {
		aliases: ['c'],
		afterInit: true,
		usage: 'If the user is in a game, cancels it',
		action: (message) => {
			let gameID = global.servers[message.guild.id].players[message.author.id].coup;
			endGame(message.channel, gameID, 'coup');
		}
	},
	view: {
		aliases: ['v'],
		afterInit: true,
		usage: 'Resends the game board',
		action: async (message) => {
			let server = global.servers[message.guild.id];
			let gameID = server.players[message.author.id].tictactoe;
			let game = server.games[gameID];

			const msg = await message.guild.channels.get(game.channel).send({embed: game.boardEmbed()});
			game.boardMessage = msg;
		}
	}
};

defineAliases(options);

async function playCoup (message, args) {
	let server = global.servers[message.guild.id];
	
	if (typeof server.players[message.author.id].coup === 'undefined') {
		const onCollect = () => {};
		const onEnd = async (collected, reason) => {
			if (collected.size < 2) throw new Error(`Collector ended without collecting, or not enough players joined. Reason: ${reason}`);
			let id = Object.keys(server.games).length;
			server.games[id] = new CoupGame(id, message.channel);
			global.logger.info(collected.users);
			await server.games[id].start(collected.users);
		};
		askForPlayers(message,
			'Let\'s play Coup! Tap 🤝 in the next minute if you want to join the game.',
			(r, user) => r.emoji.name === '🤝' && user.id !== global.bot.id,
			{time: 60 * 1000, maxUsers: 6},
			onCollect,
			onEnd,
			['🤝']
		);
	} else {
		for (let i = 0; i < args.length; i++) {
			if (options.hasOwnProperty(args[i])) {
				args[i].action(message);
				return;
			}
		}
		message.channel.send('You are already in a game! Type .coup -v to resend the grid.');
	}
}