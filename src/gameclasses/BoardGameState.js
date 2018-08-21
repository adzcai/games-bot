'use strict';

module.exports = BoardGameState;

function BoardGameState(width, height) {
	if (typeof width === 'number') {
		this.currentPlayerSymbol = 'X';
		this.width = width;
		this.height = height;
		this._contents = Array(width * height).fill(' ');
		this.result = 'running';
		this.aiMovesCount = 0;
	} else {
		let oldState = JSON.parse(JSON.stringify(width));
		this.currentPlayerSymbol = oldState.currentPlayerSymbol;
		this.width = oldState.width;
		this.height = oldState.height;
		this._contents = oldState.contents;
		this.result = oldState.result;
		this.aiMovesCount = oldState.aiMovesCount;
	}
}

BoardGameState.prototype.score = function (humanPlayerSymbol) {
	if (this.result === `${humanPlayerSymbol}-won`)
		return 10 - this.aiMovesCount;
	if (this.result === `${(humanPlayerSymbol === 'O') ? 'X' : 'O'}-won`)
		return -10 + this.aiMovesCount;
	return 0;
};

Object.defineProperty(BoardGameState.prototype, 'contents', {
	get: function () {
		return this._contents.slice();
	}
});

BoardGameState.prototype.emptyCells = function () {
	return this._contents.map((val, ind) => (val === ' ') ? ind : undefined).filter(val => typeof val !== 'undefined');
};

BoardGameState.prototype.isTerminal = function () {
	let lines = [0, 3, 6].map(i => [i, i+1, i+2])
		.concat([0, 1, 2].map(i => [i, i+3, i+6]))
		.concat([[0, 4, 8], [2, 4, 6]])
		.map(line => line.map(i => this.contents[i]));

	let result = (this.emptyCells().length === 0) ? 'draw' : false;
	lines.forEach(line => {
		if (!line.includes(' '))
			if (line[0] === line[1] && line[1] === line[2])
				result = `${line[0]}-won`;
	});
	
	return result;
};

BoardGameState.prototype.grid = function () {
	let result = '';
	let numbers = ['zero', 'one', 'two', 'three'];
	
	for (let row = 0; row < this.height; row++) {
		result += `:${numbers[this.height - row]}:`;
		for (let col = 0; col < this.width; col++)
			result += this.emptyCells().includes(row * this.width + col) ? ':black_large_square:' : (this.contents[row * this.width + col] === 'X' ? ':regional_indicator_x:' : ':regional_indicator_o:');
		result += '\n';
	}

	result += ':black_large_square:';
	let a = 'a'.charCodeAt(0);
	for (let col = 0; col < 3; col++)
		result += `:regional_indicator_${String.fromCharCode(a + col)}:`;
	return result;
};