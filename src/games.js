'use strict';

// User commands

module.exports.commands = {
	greenglassdoors: {
		run: (message, args) => playGreenGlassDoors(message, args.join(' ')),
		usage: (prefix) => `${prefix}greenglassdoors __item__`,
		desc: 'Tells if you can bring __item__ through the green glass doors.',
		aliases: (prefix) => `${prefix}ggg`
	},
	get ggg() {
		return this.greenglassdoors;
	},
	fourisinfinity: {
		run: (message, args) => playFourIsInfinity(message, args.join(' ')),
		usage: (prefix) => `${prefix}fourisinfinity __number__`,
		desc: 'Tells you what number __number__ is, according to the rules of the game. See if you can guess what it is! No hints.'
	}
};

function playGreenGlassDoors(message, phrase) {
	if (!/[\sa-z]+/i.test(phrase))
		return message.channel.send('You need to choose something to bring!').catch(console.error);
    
	for (let i = 1; i < phrase.length; i++)
		if (phrase.charAt(i).toLowerCase() === phrase.charAt(i-1).toLowerCase())
			return message.channel.send(`Yes, you can bring ${phrase} through the Green Glass Doors.`).catch(console.error);
    
	message.channel.send(`No, you cannot bring ${phrase} through the Green Glass Doors.`);
}

function playFourIsInfinity(message, number) {
	let num = parseInt(number);
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