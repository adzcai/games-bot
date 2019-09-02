const Game = require('./Game.js');
const BoardGameState = require('./BoardGameState.js');
const AIAction = require('./AIAction.js');

const options = {
  singleplayer: {
    short: 's',
    desc: 'Starts a singleplayer game.',
    action() {
      this.multiplayer = false;
    },
    flag: true,
  },
  difficulty: {
    short: 'd',
    desc: 'Sets the difficulty to __difficulty__. Assumes **-s**.',
    action(m, ind, args) {
      const diff = args[ind + 1];
      [/^e(?:asy)|1$/i, /^m(?:edium)|2$/i, /^h(?:ard)|3$/i].forEach((re, i) => {
        if (re.test(diff)) this.difficulty = i + 1;
      });
    },
  },
  go: {
    short: 'g',
    desc: 'Begins the game with you as the __playernum__th player.',
    action(m, ind, args) {
      const goFirst = args[ind + 1];
      if ((/^t(?:rue)|y(?:es)|1$/).test(goFirst)) this.p1GoesFirst = true;
      else if ((/^f(?:alse)|n(?:o)|2$/).test(goFirst)) this.p1GoesFirst = false;
    },
  },
};

function switchSymbol(sym) {
  return (sym === 'X') ? 'O' : 'X';
}

class TicTacToeGame extends Game {
  constructor(id, channel) {
    super(id, channel, 'tictactoe', 'Tic Tac Toe');
    this.numPlayersRange = [2, 2];
    this.reactions = {
      '🇦': 0, '🇧': 1, '🇨': 2, '1⃣': 2, '2⃣': 1, '3⃣': 0,
    };
    this.currentState = new BoardGameState(3, 3);
    this.pind = 0;
    this.winnerScore = 100;
    this.multiplayer = true;
  }

  /**
   * Starts the game, called from startGame.js when the user starts a message with the game's init
   * command
   */
  // eslint-disable-next-line consistent-return
  async init(message, args) {
    await super.init(message, args);

    this.humanPlayer = this.addPlayer(message.author.id, { symbol: 'X' });

    if (this.singleplayer) {
      this.addPlayer(bot.user.id, { symbol: 'O' });
      if (typeof this.difficulty === 'undefined') {
        const collected = await this.prompt('Don\'t worry, I don\'t have friends either. Do you want me to go 🇪asy, 🇲edium, or 🇭ard?', ['🇪', '🇲', '🇭'], this.humanPlayer.id);
        if (!collected) return;
        this.difficulty = { '🇪': 1, '🇲': 2, '🇭': 3 }[collected.first().emoji.name];
      }
    } else {
      if (message.mentions.users.size < 1) {
        this.status = 'ended';
        this.channel.send('Please mention someone to challenge to Tic Tac Toe, or type .ttt s to play singleplayer.');
        return;
      }

      const challengedMember = message.mentions.members.first();
      if (challengedMember.user.bot || challengedMember.id === message.author.id) {
        this.addPlayer(bot.user.id, { symbol: 'O' });
        this.multiplayer = false;
      } else {
        await this.prompt(`${challengedMember}, you have been challenged to play Tic Tac Toe! Tap 👍 to accept.`, ['👍'], challengedMember.id);
        if (this.status !== 'ended') {
          this.addPlayer(challengedMember.id, { symbol: 'O' });
          this.multiplayer = true;
        }
      }
    }

    if (typeof this.p1GoesFirst === 'undefined') {
      const collected = await this.prompt('Do you want to go first or second?', ['1⃣', '2⃣'], this.humanPlayer.id);
      if (!collected) return;
      if (!collected.has('1⃣')) this.switchPlayer();
    }

    this.currentState.currentPlayerSymbol = this.currentPlayer.symbol;
    this.updateGameEmbed();

    // If it's the bot's turn, we get it to move, otherwise we prompt the user for their first move
    if (this.singleplayer
      && this.currentState.currentPlayerSymbol !== this.humanPlayer.symbol) this.aiMove();
    this.move();
  }

  areReactionsReset(msg = this.gameEmbedMessage, reactions = Object.keys(this.reactions)) {
    const reactedEmojis = msg.reactions.map(re => re.emoji.name);
    return (reactions.every(emoji => reactedEmojis.includes(emoji)));
  }

  get singleplayer() {
    return !this.multiplayer;
  }

  async move() {
    const { id } = this.currentPlayer;

    let row = '';
    let col = '';

    const filter = (r, user) => {
      if (this.status !== 'running' || user.id !== id) return false;
      if (['1⃣', '2⃣', '3⃣'].includes(r.emoji.name)) row = r.emoji.name;
      if (['🇦', '🇧', '🇨'].includes(r.emoji.name)) col = r.emoji.name;
      return row && col;
    };

    const collected = await this.prompt(`${this.currentPlayer.user}, your turn! React with the coordinates of the square you want to move in, e.x. "🇧2⃣".`, Object.keys(this.reactions), id, filter);

    if (!collected) {
      this.status = 'ended';
      return this.channel.send('The collector timed out. Please play again!');
    }

    row = this.reactions[row];
    col = this.reactions[col];

    const ind = row * 3 + col;
    if (this.currentState.contents[ind] !== ' ') {
      this.channel.send('```diff\n- THAT IS NOT A VALID MOVE!\n```').then(msg => msg.delete(5 * 1000));
      // We prompt the user again
      return this.move();
    }

    const next = new BoardGameState(this.currentState);
    next.insert(ind, this.currentState.currentPlayerSymbol);
    next.currentPlayerSymbol = switchSymbol(next.currentPlayerSymbol);
    return this.advanceTo(next);
  }

  switchPlayer() {
    this.p1 = !this.p1;
  }

  get currentPlayer() {
    return this.players.get(this.players.keyArray()[Number(this.pind)]);
  }

  get gameEmbed() {
    return (super.gameEmbed
      .addField('Players', `${this.players.map(p => `${p.user} (${p.symbol})`).join(' vs ') || 'none'}`)
      .addField('Difficulty', [null, 'easy', 'medium', 'hard'][this.difficulty])
      .addField('Grid', this.currentState.grid())
    );
  }

  advanceTo(state) {
    this.currentState = state;
    this.updateGameEmbed();
    const term = this.currentState.isTerminal();
    this.currentState.result = term || 'running';
    this.switchPlayer();
    if (/(?:X|O)-won|draw/i.test(this.currentState.result)) {
      this.status = 'ended';
      this.channel.send(`${this.currentPlayer.user} won! GG. \`+100\` points!`);
      this.gameEmbedMessage.clearReactions();
      this.end('', { winner: this.currentPlayer.user.id });
    }

    if (this.singleplayer && this.currentState.currentPlayerSymbol !== this.humanPlayer.symbol) {
      this.aiMove();
    } else this.move();
  }

  aiMove() {
    if (this.status !== 'running') return;
    const available = this.currentState.emptyCells();
    let action;
    const turn = this.currentState.currentPlayerSymbol === 'X';

    if (this.difficulty === 1) {
      const randomCell = available[Math.floor(Math.random() * available.length)];
      action = new AIAction(randomCell);
    } else {
      const availableActions = available.map((pos) => {
        const availableAction = new AIAction(pos);
        const nextState = availableAction.applyTo(
          this.currentState,
          switchSymbol(this.humanPlayer.symbol),
        );
        availableAction.minimaxVal = AIAction.minimaxValue(nextState, this.humanPlayer.symbol);
        return availableAction;
      });

      availableActions.sort((turn === this.humanPlayer.symbol)
        ? AIAction.DESCENDING
        : AIAction.ASCENDING);
      if (
        this.difficulty === 3
        || (this.difficulty === 2 && (Math.random() < 0.4 || availableActions.length < 2))
      ) {
        [action] = availableActions;
      } else {
        [, action] = availableActions;
      }
    }

    const next = action.applyTo(this.currentState, switchSymbol(this.humanPlayer.symbol));
    this.advanceTo(next);
  }

  score(state) {
    if (state.result === `${this.humanPlayer.symbol}-won`) return 10 - state.aiMovesCount;
    if (state.result === `${switchSymbol(this.humanPlayer.symbol)}-won`) return -10 + state.aiMovesCount;
    return 0;
  }
}

module.exports = {
  cmd: 'tictactoe',
  aliases: ['ttt'],
  desc: 'Plays Tic Tac Toe! Type .help tictactoe for more info.',
  options,
  gameClass: TicTacToeGame,
};
