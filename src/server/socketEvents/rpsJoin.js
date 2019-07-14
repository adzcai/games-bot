let waiting;

const P1 = 'You win! :)';
const P2 = 'You lose! :(';
const TIE = 'It was a tie';

const results = [
  // Rock Paper Scissors
  [TIE, P1, P2], // Rock
  [P2, TIE, P1], // Paper
  [P1, P2, TIE], // Scissors
];

const names = ['rock', 'paper', 'scissors'];

module.exports = (socket, username, val) => {
  if (waiting && waiting.id !== socket.id) {
    // Send result to the waiting user
    socket.broadcast.to(waiting.id).emit('rpsJoin', username, names[val], results[val][waiting.val]);
    socket.emit('rpsJoin', username, names[waiting.val], results[waiting.val][val]);
    waiting = null;
  } else {
    waiting = { username, val, id: socket.id };
  }
};
