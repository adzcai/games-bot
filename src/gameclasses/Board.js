'use strict';

module.exports = Board;

function Board(width, height) {
	this.width = width;
	this.height = height;
	this.contents = Array(width * height).fill(' ');
}

Board.emptyCells = function (board) {
	return board.contents.map((val, ind) => (val === ' ') ? ind : undefined).filter(val => typeof val !== 'undefined');
};

Board.isTerminal = function (board) {
	let lines = [0, 3, 6].map(i => [i, i+1, i+2])
		.concat([0, 1, 2].map(i => [i, i+3, i+6]))
		.concat([[0, 4, 8], [2, 4, 6]])
		.map(line => line.map(i => board.contents[i]));

	let result = (Board.emptyCells(board).length === 0) ? 'draw' : false;
	lines.forEach(line => {
		if (!line.includes(' '))
			if (line[0] === line[1] && line[1] === line[2])
				result = `${line[0]}-won`;
	});
	
	return result;
};