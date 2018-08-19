/* globals io Board */
{
  const socket = io();

  const canvas = $('#main-canvas').get(0);
  const ctx = canvas.getContext('2d');

  // Game data
  let selfId = null;
  let board = null;
  let playing = false;

  function showInfoModal(title, content) {
    $('#modal-info-title').html(title);
    $('#modal-info-content').html(content);
    $('#modal-info').modal('show');
  }

  /** Try starting a new game. */
  function play() {
    const opponentId = $('#opponent-id').val();

    if (opponentId === '') {
      return;
    }

    if (Number.isNaN(opponentId) || (opponentId.includes('.') || opponentId.length !== 6)) {
      showInfoModal('Invalid PIN', 'You must enter a 6 digit number PIN.');
      return;
    }

    socket.emit('play', { opponentId });
  }

  function loop() {
    if (playing) {
      requestAnimationFrame(loop);
    }

    ctx.clearRect(0, 0, canvas.innerWidth, canvas.innerHeight);
    board.draw(ctx);
  }

  // PIN form listeners

  $('#play-btn').click(play);
  $('#opponent-id').keypress((event) => {
    // Enter behaves like the play button
    if (event.key === 'Enter') {
      play();
    } else if (event.key === ' ' || Number.isNaN(event.key)) { // TODO: change to regex
      event.preventDefault();
    }
  });

  // Socket.IO listeners

  socket.on('self_id', (data) => {
    selfId = data.id;
    $('#self-id').html(selfId);
  });
  socket.on('start_game', (data) => {
    board = new Board(data.table, data.eptX, data.eptY, data.goal);

    $('#pin-wrapper').css('display', 'none');
    $('#game-wrapper').css('display', 'table');
    $('#opponent-id').val('');

    $('#main-canvas').click((event) => {
      if (playing) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        board.click(socket, x, y);
      }
    });

    // The goal is only drawn once, because it's on its own canvas.
    const ctxGoal = $('#goal-canvas').get(0).getContext('2d');
    Board.drawGoal(ctxGoal, data.goal);

    playing = true;

    requestAnimationFrame(loop);
  });
  socket.on('game_end', (data) => {
    playing = false;

    if (data.win) {
      showInfoModal('You win!', 'Congratulations! You completed the pattern faster than your opponent.');
    } else {
      showInfoModal('You lose!', 'Your opponent completed the pattern before you did.<br>Good luck next time.');
    }

    setTimeout(() => {
      $('#game-wrapper').css('display', 'none');
      $('#pin-wrapper').css('display', 'inline');
    }, 2000);
  });
  socket.on('opponent_disconnect', () => {
    $('#game-wrapper').css('display', 'none');
    $('#pin-wrapper').css('display', 'inline');
    showInfoModal('Opponent disconnected', 'Your opponent has disconnected from the game.');
  });
  socket.on('already_playing', () => showInfoModal('Error', 'That player is already in a game.'));
  socket.on('not_self', () => showInfoModal('Invalid PIN', 'You can\'t play against yourself!'));
  socket.on('not_exist_pin', () => showInfoModal('Not existing PIN', 'There is no player with that PIN.'));
}
