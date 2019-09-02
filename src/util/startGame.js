/**
 * This function simply starts the game. It is called when a player types the prefix followed by
 * the name of the game.
 * @param {*} message the message that the user sent
 * @param {Array} args the arguments passed after the initial command
 * @param {Game} GameClass the game class to be starting, e.g. `TicTacToeGame`
 */
async function startGame(message, args, GameClass) {
  const game = bot.games.find(
    g => g.players.has(message.author.id) && g.command === GameClass.command,
  );

  // If the player is already in a game, see if they call any arguments
  if (game) {
    const argsPassed = args
      .filter(arg => arg in bot.commands.get(game.command).options)
      .some((arg) => {
        arg.action.call(game, message, args);
        return true;
      });
    if (!argsPassed) {
      game.channel.send(`You are already in a game! Type ${process.env.DEFAULT_PREFIX}${game.command} view to resend the message.`);
    }
    return;
  }

  const id = Math.random().toString(36).slice(2, 10);
  bot.games.set(id, new GameClass(id, message.channel));
  bot.games.get(id).init(message, args);
}

module.exports = startGame;
