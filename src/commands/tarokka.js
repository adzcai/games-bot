const { Collection } = require('discord.js');
const tarokka = require('../util/tarokka.json');
const capitalize = require('../util/capitalize');

class Card {
  constructor(name, suit, num) {
    this.name = name;
    this.suit = suit;
    if (suit === 'High') {
      this.strahdsEnemy = {
        description: tarokka['Strahd\'s Enemy'].description[name],
        info: tarokka['Strahd\'s Enemy'].enemy[name],
      };
      this.strahdsLocationInTheCastle = {
        description: tarokka['Strahd\'s Location in the Castle'].description[num],
        info: tarokka['Strahd\'s Location in the Castle'].location[num],
      };
    } else {
      this.num = ((num + 1) % 10).toString() || 'Master';
      this.description = tarokka['Treasure Location'].description[suit][num];
      this.info = tarokka['Treasure Location'].location[suit][num];
    }
  }

  repr(show, category) {
    if (this.suit === 'High') return `${this.name}\n- ${this[category].description}${show ? `\n- ${this[category].info}` : ''}`;
    return `${this.num} of ${this.suit} — ${this.name}\n- ${this.description}${show ? `\n- ${this.info}` : ''}`;
  }
}

const PROMPTS = [
  'This card tells of history. Knowledge of the ancient will help you better understand your enemy.',
  'This card tells of a powerful force for good and protection, a holy symbol of great hope.',
  'This is a card of power and strength. It tells of a weapon of vengeance: a sword of sunlight.',
  'This card sheds light on one who will help you greatly in the battle against darkness.',
  'Your enemy is a creature of darkness, whose powers are beyond mortality. This card will lead you to him!',
];

const cards = {
  Swords: ['Avenger', 'Paladin', 'Soldier', 'Mercenary', 'Myrmidon', 'Berserker', 'Hooded One', 'Dictator', 'Torturer', 'Warrior'],
  Stars: ['Transmuter', 'Diviner', 'Enchanter', 'Abjurer', 'Elementalist', 'Evoker', 'Illusionist', 'Necromancer', 'Conjurer', 'Wizard'],
  Coins: ['Swashbucker', 'Philanthropist', 'Trader', 'Merchant', 'Guild Member', 'Beggar', 'Thief', 'Tax Collector', 'Miser', 'Rogue'],
  Glyphs: ['Monk', 'Missionary', 'Healer', 'Shepherd', 'Druid', 'Anarchist', 'Charlatan', 'Bishop', 'Traitor', 'Priest'],
  High: ['Artifact', 'Beast', 'Broken One', 'Darklord', 'Donjon', 'Seer', 'Ghost', 'Executioner', 'Horseman', 'Innocent', 'Marionette', 'Mists', 'Raven', 'Tempter'],
};

const commonDeck = new Collection();

Object.keys(cards).forEach((suit) => {
  cards[suit].forEach((name, i) => {
    commonDeck.set(name, new Card(name, suit, i));
  });
});

const iToCategory = (i) => {
  if (i === 3) return 'strahdsEnemy';
  if (i === 4) return 'strahdsLocationInTheCastle';
  return '';
};

module.exports = {
  desc: 'Generates a tarokka deck for Curse of Strahd.',
  run(message, args) {
    if (args.length === 0) {
      const [high, common] = commonDeck.partition(card => card.suit === 'High');
      const generated = common.random(3).concat(high.random(2));
      const msg = generated.map((card, i) => `\`\`\`diff\n[${i + 1}] ${PROMPTS[i]}\n+ ${card.repr(false, iToCategory(i))}\`\`\``).join('\n');
      message.channel.send(msg);
    } else if (args.length === 1) {
      const generated = commonDeck.filter(card => card.suit === capitalize(args[0]));
      const str = generated.map(card => card.name).join(', ');
      message.channel.send(str);
    } else if (args.length === 2) {
      const [num, suit] = args;
      const card = commonDeck.find(c => capitalize(num) === c.num && c.suit === capitalize(suit));
      message.channel.send(`\`\`\`${card.repr(false)}\`\`\``);
    } else {
      message.channel.send('Please type `.help tarokka` for more information!');
    }
  },
};
