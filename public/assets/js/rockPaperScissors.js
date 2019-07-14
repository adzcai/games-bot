$(() => {
  let selected;
  $('#playRPS').submit((e) => {
    e.preventDefault();
    selected = $('input[name="rpsChoices"]:checked');
    const val = selected.val();

    if (!val) {
      $('#prompt').text('Please choose one of the above options!');
    } else {
      $('#prompt').text(`You chose ${selected.attr('id')}. Waiting for another player...`);
      $('input[name="rpsChoices"]').prop('checked', false); // Uncheck the radios
      // eslint-disable-next-line no-undef
      socket.emit('rpsJoin', tag, val);
    }
    return false;
  });
  socket.on('rpsJoin', (username, val, result) => {
    $('#prompt').text(`You chose ${selected.attr('id')}`);
    // eslint-disable-next-line no-undef
    $('#result').append(`<div class="alert alert-secondary">You played against ${username} <img class="rounded d-inline-block align-top" src="${avatarURL}" width="30" height="30">. They chose ${val}.</div>`, `<div class="alert">${result}</div>`);
  });
});
