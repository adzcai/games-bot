// We add the active class to the header link corresponding to the page we're on
$(`#navbarSupportedContent ul .nav-item a[href="${window.location.pathname}"]`).addClass('active');
$(() => {
  $('#sendCmd').submit((e) => {
    e.preventDefault();
    const msg = $('#cmd').val();
    socket.emit('chat message', msg);
    $('#messages').append(`<button class="dropdown-item text-left bg-light rounded" type="button">${msg}</button>`);
    $('#cmd').val('');
    return false;
  });
  socket.on('chat message', (msg) => {
    $('#messages').append(`<button class="dropdown-item text-right text-white bg-dark rounded" type="button">${msg}</button>`);
  });
});
