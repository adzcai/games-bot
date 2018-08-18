'use strict';

module.exports = Board;

function Board(width, height) {
	this.width = width;
	this.height = height;
	this._contents = Array(width * height).fill(' ');
}

Object.defineProperty(Board, 'contents', { get: () => this.contents.slice() });

Board.prototype.emptyCells = function () {
	return this.contents.map((val, ind) => (val === ' ') ? ind : undefined).filter(val => typeof val !== 'undefined');
};

Board.prototype.isTerminal = function () {
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

Board.prototype.grid = function () {
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