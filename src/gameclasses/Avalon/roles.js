const { Collection } = require('discord.js');

const evilSees = role => role.loyalty === 'evil' && role.name !== 'Oberon';

class Role {
  constructor(regex, loyalty, sees) {
    this.regex = regex;
    this.loyalty = loyalty;
    this.sees = sees || (loyalty === 'evil' ? evilSees : () => false);
  }
}

const roles = new Collection();

roles
  .set('Minion', new Role(/minion(?: of mordred)?/i, 'evil'))
  .set('Assassin', new Role(/assassin/i, 'evil'))
  .set('Morgana', new Role(/morgana/i, 'evil'))
  .set('Mordred', new Role(/mordred/i, 'evil'))
  .set('Oberon', new Role(/oberon/i, 'evil', () => false))

  .set('Servant', new Role(/(?:loyal )?servant(?: of arthur)?/i, 'good'))
  .set('Merlin', new Role(/merlin/i, 'good', role => role.loyalty === 'evil' && role.name !== 'Mordred'))
  .set('Percival', new Role(/percival/i, 'good', role => role.name === 'Merlin' || role.name === 'Morgana'));

const defaultRoles = {
  5: ['Percival', 'Merlin', 'Servant', 'Morgana', 'Assassin'],
};
const toAdd = ['Servant', 'Minion', 'Servant', 'Servant', 'Oberon']
for (let i = 6; i <= 10; i += 1)
  defaultRoles[i] = defaultRoles[i-1].concat(toAdd[i-6])

module.exports = { roles, defaultRoles };
