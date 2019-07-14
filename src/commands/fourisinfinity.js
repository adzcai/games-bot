

const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

module.exports = {
  aliases: ['4isinf'],
  desc: 'Tells you what a number is *actually* equal to, according to the rules of the game. See if you can guess what it is! No hints.',
  options: {
    number: {
      desc: 'The number to use to try and guess the pattern',
      required: true,
    },
  },
  run(message, num) {
    if (!((parseInt(num, 10) >= 0) && (parseInt(num, 10) <= 999))) {
      return message.channel.send('That is not a valid number. Please enter a number from 0 to 999.').catch(logger.error);
    }

    if (num === 4) {
      return message.channel.send('And 4 is infinity!').catch(logger.error);
    }
    const digits = `${num}`.split('').map(d => parseInt(d, 10));

    let nextNum;
    if (num <= 9) {
      nextNum = ones[num];
    } else if (num >= 10 && num <= 19) {
      nextNum = teens[digits[1]];
    } else if (num >= 20 && num <= 99) {
      nextNum = tens[digits[0]];
      if (digits[1] !== 0) nextNum += ones[digits[1]];
    } else if (num >= 100 && num <= 999) {
      if (digits[1] === 1) nextNum = `${ones[digits[0]]}hundred${teens[digits[2]]}`;
      else if (digits[1] === 0 && digits[2] === 0) nextNum = `${ones[digits[0]]}hundred`;
      else nextNum = `${ones[digits[0]]}hundred${tens[digits[1]]}${ones[digits[2]]}`;
    }

    message.channel.send(`${num} is ${nextNum.length}`).catch(logger.error);
    return this.run(message, nextNum.length);
  },
};
