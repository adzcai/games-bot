'use strict';

module.exports = BoardGameState;

const Board = require('./Board.js');

function BoardGameState(width, height) {
	if (typeof width === 'number') {
		this.currentPlayerSymbol = 'X';
		this.board = new Board(width, height);
		this.result = 'running';
		this.aiMovesCount = 0;
	} else {
		let oldState = JSON.parse(JSON.stringify(width));
		this.currentPlayerSymbol = oldState.currentPlayerSymbol;
		this.board = oldState.board;
		this.result = oldState.result;
		this.aiMovesCount = oldState.aiMovesCount;
	}
}
