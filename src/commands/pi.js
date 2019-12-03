const fs = require('fs');

const pidigits = fs.readFileSync('./public/assets/pidigits.txt').toString();

module.exports = {
  desc: 'Gets the digits of pi',
  options: {
    digits: {
      desc: 'The number of digits',
      noflag: true,
    },
  },
  run(message, args) {
    const numdigs = parseInt(args[0], 10) || 5;
    message.channel.send(numdigs === 1 ? '3' : pidigits.substring(0, numdigs + 1));
  },
};
