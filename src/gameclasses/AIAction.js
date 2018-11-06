'use strict';

const BoardGameState = require('./BoardGameState.js');

module.exports = AIAction;

function AIAction (pos) {
  this.movePosition = pos;
  this.minimaxVal = 0;
}

/*
 * Applies a move to a given state and returns the new state
 */
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

/*
 * These are used to sort actions by their minimax values
 */
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

/*
 * Basically, if the next player is human we want to minimize the value,
 * and if it is the AI we want to maximize the value.
 */
AIAction.minimaxValue = function (state, humanPlayerSymbol) {
  const term = state.board.isTerminal();
  if (term) {
    state.result = term ? term : 'running';
    return state.score(humanPlayerSymbol);
  }

  let stateScore = (state.currentPlayerSymbol === humanPlayerSymbol) ? -1000 : 1000;
  let availablePositions = state.board.emptyCells();
  let availableNextStates = availablePositions.map(pos => (new AIAction(pos)).applyTo(state, (humanPlayerSymbol === 'X') ? 'O' : 'X'));

  availableNextStates.forEach(nextState => {
    let nextScore = AIAction.minimaxValue(nextState, humanPlayerSymbol);
    if (state.currentPlayerSymbol === humanPlayerSymbol) {
      if (nextScore > stateScore)
        stateScore = nextScore;
    } else {
      if (nextScore < stateScore)
        stateScore = nextScore;
    }
  });

  return stateScore;
};