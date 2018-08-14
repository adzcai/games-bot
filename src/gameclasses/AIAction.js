'use strict';

const BoardGameState = require('./BoardGameState.js');

module.exports = AIAction;

function AIAction (pos) {
	this.movePosition = pos;
	this.minimaxVal = 0;
}

AIAction.prototype.applyTo = function (state, botSymbol) {
	let next = new BoardGameState(state);
	let temp = next.board.contents.slice();
	temp[this.movePosition] = state.currentPlayerSymbol;
	next.board.contents = temp;

	if (next.currentPlayerSymbol === botSymbol)
		next.aiMovesCount++;
	next.currentPlayerSymbol = (next.currentPlayerSymbol === 'X') ? 'O' : 'X';

	return next;
};

AIAction.ASCENDING = (firstAction, secondAction) => {
	if (firstAction.minimaxVal < secondAction.minimaxVal) return -1;
	else if (firstAction.minimaxVal > secondAction.minimaxVal) return 1;
	else return 0;
};

AIAction.DESCENDING = (firstAction, secondAction) => {
	if (firstAction.minimaxVal > secondAction.minimaxVal) return -1;
	else if (firstAction.minimaxVal < secondAction.minimaxVal) return 1;
	else return 0;
};