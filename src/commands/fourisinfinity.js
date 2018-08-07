'use strict';

// User commands

module.exports = {
	run: (message, args) => playFourIsInfinity(message, parseInt(args.join(' '))),
	usage: (prefix) => `${prefix}fourisinfinity __number__`,
	desc: 'Tells you what number __number__ is, according to the rules of the game. See if you can guess what it is! No hints.',
	aliases: ['4isinf']
};

function playFourIsInfinity(message, num) {
	if (!num)
		return message.channel.send('That is not a valid number- only the digits 0-9 are allowed.').catch(console.error);    
    
	if (num === 4) {
		return message.channel.send('And 4 is infinity!');
	} else {
		let digits = [];
		for (let i = 0; i < num.toString().length; i++)
			digits.push(parseInt(num.toString()[i]));
        
		let ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
		let teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
		let tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        
		let nextNum;
		if (num <= 9) {
			nextNum = ones[num];
		} else if (10 <= num && num <= 19) {
			nextNum = teens[digits[1]];
		} else if (20 <= num && num <= 99) {
			nextNum = tens[digits[0]];
			if (digits[1] !== 0) nextNum += ones[digits[1]];
		} else if (100 <= num && num <= 999) {
			if (digits[1] === 1)
				nextNum = ones[digits[0]] + 'hundred' + teens[digits[2]];
			else if (digits[1] === 0 && digits[2] === 0)
				nextNum = ones[digits[0]] + 'hundred';
			else
				nextNum = ones[digits[0]] + 'hundred' + tens[digits[1]] + ones[digits[2]];
		} else {
			return message.channel.send('No more than 3 digits, please').catch(console.error);
		}
        
		message.channel.send(`${num} is ${nextNum.length}`);
		playFourIsInfinity(message, nextNum.length);
	}
}