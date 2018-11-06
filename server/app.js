const path = require('path');
const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const Game = require('./game');
const { randomNumberRange } = require('./util');

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

const port = process.env.PORT || 3000;

// Setup express
app.use(express.static(path.join(__dirname, '../', 'client')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'client', 'index.html'));
});

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));

const sockets = new Map(); // <number, Socket> (playerId, socket)
const players = new Map(); // <number, Game>   (playerId, game)
const games = new Set(); //   <Game>

/**
 * Create a new random player id (6 digit number).
 *
 * @returns {number} A new player id.
 */
function newRandomId() {
  let id;

  do {
    id = randomNumberRange(100000, 999999);
  } while (sockets.has(id));

  return id;
}

io.on('connection', (socket) => {
  const id = newRandomId();

  socket.id = id;
  sockets.set(id, socket);
  socket.emit('self_id', { id });

  /** The player wants to start a new game. */
  socket.on('play', (data) => {
    if (data.opponentId === undefined || Number.isNaN(data.opponentId)) {
      return;
    }

    const opponentId = Number(data.opponentId);

    if (opponentId === id) {
      socket.emit('not_self');
    } else if (sockets.has(opponentId)) {
      if (players.has(opponentId)) {
        socket.emit('already_playing');
      } else {
        const game = new Game(id, opponentId);
        games.add(game);
        players.set(id, game);
        players.set(opponentId, game);

        const gameData = game.getInitData();
        socket.emit('start_game', gameData);
        sockets.get(opponentId).emit('start_game', gameData);
      }
    } else {
      socket.emit('not_exist_id');
    }
  });

  /** The player clicks on a tile that can be moved. */
  socket.on('move_tile', (data) => {
    if (data.x !== undefined && data.y !== undefined) {
      if (players.has(id)) {
        players.get(id).move(id, data.x, data.y);
      }
    }
  });

  /** The player has won the game. */
  socket.on('test_win', () => {
    if (!players.has(id)) {
      return;
    }

    const game = players.get(id);
    const winData = game.getWinner();

    // Check if one of the players has won
    if (winData !== -1) {
      const opponentId = game.id1 === id ? game.id2 : game.id1;

      if (winData === id) {
        socket.emit('game_end', { win: true });
        sockets.get(opponentId).emit('game_end', { win: false });
      } else {
        socket.emit('game_end', { win: false });
        sockets.get(opponentId).emit('game_end', { win: true });
      }

      // Clear the game from the data objects
      games.delete(game);
      players.delete(id);
      players.delete(opponentId);
    }
  });

  socket.on('disconnect', () => {
    if (players.has(id)) {
      const game = players.get(id);

      let opponentId = game.id1;
      if (game.id1 === id) {
        opponentId = game.id2;
      }

      sockets.get(opponentId).emit('opponent_disconnected');

      games.delete(game);
      players.delete(id);
      players.delete(opponentId);
    }

    sockets.delete(id);
  });
});
