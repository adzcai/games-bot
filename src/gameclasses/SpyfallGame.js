const { RichEmbed } = require('discord.js');
const Game = require('./Game.js');

const locations = [
  ['Airplane', 'Bank', 'Beach', 'Cathedral', 'Circus Tent', 'Corporate Party', 'Crusader Army', 'Casino', 'Day Spa', 'Embassy', 'Hospital', 'Hotel', 'Military Base', 'Movie Studio', 'Ocean Liner', 'Passenger Train', 'Pirate Ship', 'Polar Station', 'Police Station', 'Restaurant', 'School', 'Service Station', 'Space Station', 'Submarine', 'Supermarket', 'Theater', 'University', 'World War II Squad'],
  ['Race Track', 'Art Museum', 'Vineyard', 'Baseball Stadium', 'Library', 'Cat Show', 'Retirement Home', 'Jail', 'Construction Site', 'The United Nations', 'Candy Factory', 'Subway', 'Coal Mine', 'Cemetery', 'Rock Concert', 'Jazz Club', 'Wedding', 'Gas Station', 'Harbor Docks', 'Sightseeing Bus'],
];

const timeBenchmarks = [5, 10, 30, 60, 120];

const options = {
  version: {
    short: 'v',
    desc: 'Specify which version of the game you want to play: 1, 2, or 3.',
    action(m, ind, args) {
      this.version = parseInt(args[ind + 1], 10) || 1;
    },
  },
};

function milliToMinsSecs(milli) {
  return [(`0${Math.floor(milli / 1000 / 60)}`).slice(-2), (`0${Math.floor((milli / 1000) % 60)}`).slice(-2)];
}

class SpyfallGame extends Game {
  constructor(id, channel) {
    super(id, channel, 'spyfall', 'Spyfall');
  }

  async init(message, args) {
    await super.init(message, args);

    this.version = this.version || '1';
    this.gameTime = 8 * 60 * 1000;
    this.remaining = this.gameTime;
    if (this.version === '1') [this.locations] = locations;
    else if (this.version === '2') [, this.locations] = locations;
    else if (this.version === '3') this.locations = locations[0].concat(locations[1]);

    this.benchmarks = timeBenchmarks;
    // eslint-disable-next-line no-continue
    while (this.benchmarks[this.benchmarks.length - 1] > this.gameTime) this.benchmarks.pop();

    this.addPlayer(message.author.id, { isSpy: false, scratched: [] });
    const prmpt = await this.channel.send(`Tap the button to join the game! ${message.author}, tap the flag whenever you're ready to begin.`);
    const collector = prmpt.createReactionCollector(
      (r, user) => (r.emoji.name === '🤝' && !user.bot) || (r.emoji.name === '🚩' && user.id === message.author.id),
      { time: 5 * 60 * 1000 },
    );

    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === '🚩') collector.stop();
      else {
        const playerIds = reaction.users.filter(user => !user.bot).keyArray();
        if (!playerIds.includes(message.author.id)) playerIds.push(message.author.id);
        this.players.clear();
        playerIds.forEach((id) => {
          this.addPlayer(id, { isSpy: false, scratched: [] });
        });
        this.updateGameEmbed();
      }
    });

    collector.on('end', () => this.start());

    bot.on('messageReactionRemove', (reaction, user) => {
      if (reaction.emoji.name === '🤝' && reaction.message.id === prmpt.id) this.players.delete(user.id);
      this.updateGameEmbed();
    });

    await prmpt.react('🤝');
    await prmpt.react('🚩');
  }

  start() {
    this.spy = this.players.random();
    this.spy.isSpy = true;
    this.location = this.locations[Math.floor(Math.random() * this.locations.length)];

    this.players.forEach(async (player) => {
      player.message = await player.user.send({ embed: this.locationEmbed(player) });
      player.collector = player.user.dmChannel.createMessageCollector(
        m => (parseInt(m.content, 10) > 0) && (parseInt(m.content, 10) <= this.locations.length),
        { time: this.gameTime },
      );

      player.collector.on('collect', (msg) => {
        const toScratch = parseInt(msg, 10) - 1;
        if (player.scratched.includes(toScratch)) {
          player.scratched.splice(player.scratched.indexOf(toScratch), 1);
        } else player.scratched.push(toScratch);
        player.message.edit({ embed: this.locationEmbed(player) });
      });
    });

    this.startingTime = new Date().getTime();
    bot.setInterval(() => {
      this.remaining = this.gameTime - (new Date().getTime() - this.startingTime);
      const [mins, secs] = milliToMinsSecs(this.remaining);
      this.players.forEach(player => player.user.send(`${mins && `${mins} minutes and `}${secs && `${secs} seconds`} remaining!`));
      this.updateGameEmbed();
    }, 5000);
  }

  get gameEmbed() {
    const [mins, secs] = milliToMinsSecs(this.remaining);

    return (super.gameEmbed
      .setDescription(this.remaining <= 0 ? 'Time\'s up!' : `Time remaining: ${`${mins}:${secs}`}`)
      .addField('Players', `${this.players.map(p => `- ${p.user}`).join('\n') || 'none'}`)
      .setFooter(`Type .help spyfall to get help about the game. Game ID: ${this.id}`));
  }

  locationEmbed(player) {
    const embed = new RichEmbed()
      .setTitle(`You are ${player.isSpy ? '' : '**not** '}the spy!`);
    if (!player.isSpy) embed.addField('The location is:', this.location);
    embed
      .addField('Location Reference', this.locations.map((loc, ind) => {
        const strike = player.scratched.includes(ind) ? '~~' : '';
        return `${strike}[${ind + 1}] ${loc}${strike}`;
      }))
      .setFooter('To cross/un-cross out a location, type its number.');
    return embed;
  }
}

module.exports = {
  cmd: 'spyfall',
  desc: 'Play Spyfall with a group of friends!',
  options,
  gameClass: SpyfallGame,
};
