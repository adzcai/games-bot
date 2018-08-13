'use strict';

const TicTacToeGame = require('./../TicTacToeGame.js');
const internal = require('./../internal.js');

module.exports = {
	usage: (prefix) => `${prefix}tictactoe [**-s**] [**-d** __difficulty__] [**-g** __playernum__] [-c]`,
	desc: 'Plays Tic Tac Toe!',
	aliases: ['ttt'],
	run: playTicTacToe
};

const options = {
	singleplayer: {
		aliases: ['s'],
		usage: 'Starts a singleplayer game.',
		action: () => this.multiplayer = false
	},
	difficulty: {
		aliases: ['d'],
		usage: 'Sets the difficulty to __difficulty__. Assumes **-s**.',
		action: (args, ind) => {
			let diff = args[ind+1];
			if ((/^e(?:asy)|1$/i).test(diff))
				diff = 1;
			else if ((/^m(?:edium)|2$/i).test(diff))
				diff = 2;
			else if ((/^h(?:ard)|3$/i).test(diff))
				diff = 3;
			this.difficulty = difficulty;
		}
	},
	go: {
		aliases: ['g'],
		usage: 'Begins the game with you as the __playernum__th player.',
		action: (args, ind) => {
			let goFirst = args[ind+1];
			if ((/^t(?:rue)|y(?:es)|1$/).test(goFirst))
				this.p1GoesFirst = true;
			else if ((/^f(?:alse)|n(?:o)|2$/).test(goFirst))
				this.p1GoesFirst = false;
		}
	},
	cancel: {
		aliases: ['c'],
		usage: 'If the user is in a game, cancels it',
		action: () => {
		}
	}
};

Object.values(options).forEach(opt => {
	console.log(opt)
	if (opt.aliases)
		opt.aliases.forEach(alias => Object.defineProperty(options, alias, { get: () => opt }));
});

async function playTicTacToe(message, args) {
	let server = global.servers[message.guild.id];
	
	if (typeof server.players[message.author.id].tictactoe === 'undefined') {
		let id = Object.keys(server.games).length;
		let settings = {players: [message.author.id]};

		if (message.mentions.members.size > 0) {
			let challenged = message.mentions.members.first();
			if (challenged.id === global.bot.user.id || challenged.id === message.author.id) {
				settings.players.push(global.bot.user.id);
				settings.multiplayer = false;
			} else {
				let msg = await message.channel.send(`${challenged}, you have been challenged to play Tic Tac Toe! Tap 👍 to accept.`);
				await msg.react('👍');
				const collected = await msg.awaitReactions(r => r.emoji.name === '👍' && r.users.get(challenged.id), {maxUsers: 1, time: 60 * 1000});
				if (collected.size < 1)
					return message.channel.send('Timed out. Type "cancel" to cancel this game and then type .ttt to start a new one.').catch(console.error);
				settings.players.push(challenged.id);
				settings.multiplayer = true;
			}
		} else if (args.length > 0) { // ['d', '1', etc.]
			for (let i = 0; i < args.length; i++)
				if (Object.keys(options).includes(args[i]))
					options[args[i]].action.call(settings, args, i);
		}

		server.games[id] = new TicTacToeGame(id, message.channel);
		await server.games[id].start(settings);
	} else {
		for (let i = 0; i < args.length; i++) {
			/* eslint-disable indent, no-case-declarations, no-fallthrough */
			switch (args[i]) {
				case '--cancel':
				case '-c':
					internal.endGame(message);
					break;
				case '--view':
				case '-v':
					let gameID = server.players[message.author.id].tictactoe;
					let game = server.games[gameID];
					const msg = await message.guild.channels.get(game.channel).send({embed: game.boardEmbed()});
					game.boardMessage = msg;
					break;
			}
			/* eslint-enable indent, no-case-declarations, no-fallthrough */
		}
		message.channel.send('You are already in a game! Type .ttt -v to resend the grid.');
	}
}	
