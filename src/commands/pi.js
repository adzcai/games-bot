const fs = require('fs');

module.exports = {
  desc: 'Gets the digits of pi',
  options: {
    digits: {
      desc: 'The number of digits',
      noflag: true,
    },
  },
  run: (message, args) => {
    fs.readFile('../../res/pidigits.txt', (err, data) => {
      if (err) throw err;
      const numdigs = parseInt(args[0]) || 5;
      message.channel.send(data.substring(0, numdigs)).catch(logger.error);
    });
  },
};
