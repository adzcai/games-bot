'use strict';

const { RichEmbed } = require('discord.js');
const Game = require('./Game.js');
const BoardGameState = require('./BoardGameState.js');
const AIAction = require('./AIAction.js');

module.exports = TicTacToeGame;

const options = {
	singleplayer: {
		aliases: ['s'],
		usage: 'Starts a singleplayer game.',
		action: function () {
			this.multiplayer = false;
		}
	},
	difficulty: {
		aliases: ['d'],
		usage: 'Sets the difficulty to __difficulty__. Assumes **-s**.',
		action: function (ind, args) {
			let diff = args[ind+1];
			[/^e(?:asy)|1$/i, /^m(?:edium)|2$/i, /^h(?:ard)|3$/i].forEach((re, i) => {
				if (re.test(diff)) this.difficulty = i+1;
			});
		}
	},
	go: {
		aliases: ['g'],
		usage: 'Begins the game with you as the __playernum__th player.',
		action: function (ind, args) {
			let goFirst = args[ind+1];
			if ((/^t(?:rue)|y(?:es)|1$/).test(goFirst))
				this.p1GoesFirst = true;
			else if ((/^f(?:alse)|n(?:o)|2$/).test(goFirst))
				this.p1GoesFirst = false;
		}
	}
};

function TicTacToeGame (id, channel) {
	Game.call(this, id, channel, 'tictactoe', { options: options, aliases: ['ttt'], numPlayersRange: [2, 2] });
	this.reactions = {'🇦': 0, '🇧': 1, '🇨': 2, '1⃣': 2, '2⃣': 1, '3⃣': 0};
	this.currentState = new BoardGameState(3, 3);
}
TicTacToeGame.prototype = Object.create(Game.prototype);
TicTacToeGame.prototype.constructor = TicTacToeGame;

/*
 * The super call checks through the args given
 */
TicTacToeGame.prototype.init = async function (message, args) {
	Object.getPrototypeOf(TicTacToeGame.prototype).init.call(this, message, args);
	
	if (message.mentions.users.size > 0) {
		let challengedMember = message.mentions.members.first();
		if (challengedMember.user.bot || challengedMember.id === message.author.id) {
			this.addPlayer(global.bot.user.id, {symbol: 'X'});
			this.multiplayer = false;
		} else {
			let msg = await message.channel.send(`${challengedMember}, you have been challenged to play Tic Tac Toe! Tap 👍 to accept.`);
			await msg.react('👍');
			const collected = await msg.awaitReactions((r, user) => r.emoji.name === '👍' && user.id === challengedMember.id, {maxUsers: 1, time: 60 * 1000});
			if (collected.size < 1) {
				this.status = 'ended';
				return this.sendCollectorEndedMessage('timed out').catch(global.logger.error);
			}
			this.addPlayer(challengedMember.id, {symbol: 'X'});
			this.multiplayer = true;
			this.start();
		}
	} else {
		this.channel.send('Please mention someone to challenge to Tic Tac Toe, or type .ttt s to play singleplayer.').catch(global.logger.error);
	}
};

TicTacToeGame.prototype.start = async function () {
	this.currentPlayer = Object.assign({}, this.players[Object.keys(this.players)[0]]);

	global.servers[this.channel.guild.id].players[this.currentPlayer.id].tictactoe = this.id;
	
	if (!this.multiplayer) await this.setDifficulty();
	await this.setP1GoesFirst();
	this.startPlaying();
};

TicTacToeGame.prototype.promptDifficulty = async function () {
	const difficulties = {'🇪': 1, '🇲': 2, '🇭': 3};
	const msg = await this.channel.send('Don\'t worry, I don\'t have friends either. Do you want me to go 🇪asy, 🇲edium, or 🇭ard?');
	for (let emoji of ['🇪', '🇲', '🇭']) await msg.react(emoji);
	const collected = await msg.awaitReactions((r, user) => (r.emoji.name === '🇪' || r.emoji.name === '🇲' || r.emoji.name === '🇭') && (user.id === this.currentPlayer.id), {maxUsers: 1, time: 60 * 1000});
	if (collected.size < 1) throw this.sendCollectorEndedMessage();
	return difficulties[collected.first().emoji.name];
};

TicTacToeGame.prototype.setDifficulty = async function (difficulty) {
	if (this.multiplayer) return 'You can only set the difficulty in a singleplayer game';

	if (typeof difficulty === 'undefined')
		difficulty = await this.promptDifficulty();
	
	if (![1, 2, 3].includes(difficulty)) throw 'That is not a valid difficulty setting.';

	this.difficulty = difficulty;
	this.channel.send(`On difficulty ${this.difficulty}.`).catch(global.logger.error);
};

TicTacToeGame.prototype.promptP1GoesFirst = async function () {
	const msg = await this.channel.send('Do you want to go first or second?');
	await msg.react('1⃣');
	await msg.react('2⃣');
	let collected = await msg.awaitReactions((r, user) => ['1⃣', '2⃣'].includes(r.emoji.name) && (user.id === this.currentPlayer.id), {maxUsers: 1, time: 60 * 1000});
	if (collected.size < 1) throw this.sendCollectorEndedMessage();
	return collected.has('1⃣');
};

TicTacToeGame.prototype.setP1GoesFirst = async function (p1GoesFirst) {
	if (typeof p1GoesFirst === 'undefined') p1GoesFirst = await this.promptP1GoesFirst();
	if (!p1GoesFirst) {
		this.currentPlayer.symbol = 'O';
		this.humanPlayerSymbol = 'O';
		this.switchPlayer();
		this.currentPlayer.symbol = 'X';
	}
	this.currentState.currentPlayerSymbol = this.currentPlayer.symbol;
	this.channel.send(`${this.currentPlayer.user}, your turn! React with the coordinates of the square you want to move in, e.x. "🇧2⃣".`);
};

TicTacToeGame.prototype.startPlaying = async function () {
	this.status = 'running';
	this.boardMessage = await this.channel.send({embed: this.boardEmbed()});

	if (!this.multiplayer && !(this.currentState.currentPlayerSymbol === this.humanPlayerSymbol)) this.aiMove();
	await this.resetReactions();

	this.resetCollector();
};

TicTacToeGame.prototype.resetCollector = function () {
	let reactionFilter = (r, emoji) => r.message.reactions.get(emoji).users.has(this.currentPlayer.id);
	this.collector = this.boardMessage.createReactionCollector(r => {
		if (this.status !== 'running') return;
		if (this.currentPlayer.id === global.bot.user.id) return;
		if (!this.areReactionsReset(r.message)) return;
		const rowSelected = ['1⃣', '2⃣', '3⃣'].some(row => reactionFilter(r, row));
		const colSelected = ['🇦', '🇧', '🇨'].some(col => reactionFilter(r, col));
		return rowSelected && colSelected;
	}, {time: 5 * 60 * 1000});

	this.collector.on('collect', r => {
		let row = this.reactions[['1⃣', '2⃣', '3⃣'].filter(row => reactionFilter(r, row))[0]];
		let col = this.reactions[['🇦', '🇧', '🇨'].filter(col => reactionFilter(r, col))[0]];

		let ind = row * 3 + col;
		if (this.currentState.board.contents[ind] !== ' ') return this.channel.send('That is not a valid move!').catch(global.logger.error);
		let next = new BoardGameState(this.currentState);
		next.board.contents[ind] = this.currentState.currentPlayerSymbol;
		next.currentPlayerSymbol = switchSymbol(next.currentPlayerSymbol);
		this.advanceTo(next);

		if (!this.multiplayer && !(this.currentState.currentPlayerSymbol === this.humanPlayerSymbol))
			this.aiMove();

		this.resetReactions();
	});

	this.collector.on('end', (collected, reason) => {
		if (reason === 'game over') return;
		this.sendCollectorEndedMessage(reason);
	});
};

TicTacToeGame.prototype.switchPlayer = function () {
	let playerIDs = Object.keys(this.players);
	playerIDs.splice(playerIDs.indexOf(this.currentPlayer.id), 1);
	this.currentPlayer = Object.assign({}, this.players[playerIDs[0]]);
};

TicTacToeGame.prototype.boardEmbed = function () {
	const embed = new RichEmbed()
		.setTimestamp()
		.setTitle('Tic Tac Toe')
		.addField('Players', `${Object.values(this.players).map(p => `${p.user} (${p.symbol})`).join(' vs ')}`)
		.addField('Grid', this.grid())
		.setFooter('Type ".ttt help" to get help about this function.');
	return embed;
};

TicTacToeGame.prototype.grid = function () {
	let result = '';
	let numbers = ['zero', 'one', 'two', 'three'];
	
	for (let row = 0; row < 3; row++) {
		result += `:${numbers[3 - row]}:`;
		for (let col = 0; col < 3; col++)
			result += this.currentState.board.emptyCells().includes(row * 3 + col) ? ':black_large_square:' : (this.currentState.board.contents[row * 3 + col] === 'X' ? ':regional_indicator_x:' : ':regional_indicator_o:');
		result += '\n';
	}

	result += ':black_large_square:';
	let a = 'a'.charCodeAt(0);
	for (let col = 0; col < 3; col++)
		result += `:regional_indicator_${String.fromCharCode(a + col)}:`;
	return result;
};

TicTacToeGame.prototype.advanceTo = function (state) {
	this.currentState = state;
	this.boardMessage.edit({embed: this.boardEmbed()});
	const term = this.currentState.isTerminal();
	this.currentState.result = term ? term : 'running';
	this.switchPlayer();
	if (/(?:X|O)-won|draw/i.test(this.currentState.result)) {
		this.status = 'ended';
		this.channel.send(`${this.currentPlayer} won! GG`).catch(global.logger.error);
		this.collector.stop('game over');
		this.boardMessage.clearReactions();
		this.end();
	}
};

TicTacToeGame.prototype.aiMove = function () {
	if (this.status !== 'running') return;
	const available = this.currentState.board.emptyCells();
	let action;
	const turn = this.currentState.currentPlayerSymbol === 'X';

	if (this.difficulty === 1) {
		let randomCell = available[Math.floor(Math.random() * available.length)];
		action = new AIAction(randomCell);
	} else {
		let availableActions = available.map(pos => {
			let availableAction = new AIAction(pos);
			let nextState = availableAction.applyTo(this.currentState, switchSymbol(this.humanPlayerSymbol));
			availableAction.minimaxVal = AIAction.minimaxValue(nextState, this.humanPlayerSymbol);
			return availableAction;
		});

		availableActions.sort((turn === this.humanPlayerSymbol) ? AIAction.DESCENDING : AIAction.ASCENDING);

		action = (this.difficulty === 2 ?
			((Math.random() * 100 <= 40) ?
				availableActions[0] :
				((availableActions.length >= 2) ? availableActions[1] : availableActions[0])) :
			availableActions[0]);
	}

	let next = action.applyTo(this.currentState, switchSymbol(this.humanPlayerSymbol));
	this.advanceTo(next);
};

TicTacToeGame.prototype.score = function (state) {
	if (state.result === `${this.humanPlayerSymbol}-won`)
		return 10 - state.aiMovesCount;
	if (state.result === `${switchSymbol(this.humanPlayerSymbol)}-won`)
		return -10 + state.aiMovesCount;
	return 0;
};

function switchSymbol(sym) {
	return (sym === 'X') ? 'O' : 'X';
}