/**
 * This function simply starts the game. It is called when a player types the prefix followed by
 * the name of the game.
 * @param {Message} message the message that the user sent
 * @param {Array} args the arguments passed after the initial command
 * @param {Game} GameClass the game class to be starting, e.g. `TicTacToeGame`
 */
async function startGame(message, args, GameClass) {
  let game = bot.games.find(
    // The author is in a game with the same game type
    g => g.players.has(message.author.id) && g.command === GameClass.command,
  );

  // If the player is not currently in a game
  if (!game) {
    // Generate a random id
    const id = Math.random().toString(36).slice(2, 10);
    game = new GameClass(id, message);
    bot.games.set(id, game);
  }

  game.run(message, args);
}

module.exports = startGame;
