'use strict';

const RichEmbed = require('discord.js').RichEmbed;
const CoupGame = require('./../CoupGame.js');
const internal = require('./../internal.js');

module.exports = {
	run: (message, args) => playCoup(message, args),
	help: 'Plays the board game Coup',
	usage: (prefix) => `${prefix}coup`
};

async function playCoup (message, args) {
	let server = global.servers[message.guild.id];
	
	if (typeof server.players[message.author.id].coup === 'undefined') {
		let id = Object.keys(server.games).length;

		internal.askForPlayers(message, `Let's play Coup! Tap 🤝 in the next minute if you want to join the game.`, {time: 60 * 1000, maxUsers: 6}, async (collected, reason) => {
			if (collected.size < 1) throw new Error(`Collector ended without collecting. Reason: ${reason}`);
			server.games[id] = new CoupGame(id, message.channel);
			await server.games[id].start(collected.users);
		});
	} else {
		for (let i = 0; i < args.length; i++) {
			/* eslint-disable indent, no-case-declarations, no-fallthrough */
			switch (args[i]) {
				case '--cancel':
				case '-c':
					internal.endGame(message);
					return;
				case '--view':
				case '-v':
					let gameID = server.players[message.author.id].coup;
					let game = server.games[gameID];
					const msg = await message.guild.channels.get(game.channel).send({embed: game.boardEmbed()});
					game.boardMessage = msg;
					return;
			}
			/* eslint-enable indent, no-case-declarations, no-fallthrough */
		}
		message.channel.send('You are already in a game! Type .coup -v to resend the grid.');
	}
}