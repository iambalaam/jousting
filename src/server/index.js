const express = require('express');
const socketIO = require('socket.io');
const { resolve } = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');

const PORT = process.env.PORT || 3000;
const PGK_ROOT = resolve(__dirname, '../../');
const LIB_DIR = resolve(PGK_ROOT, 'dist', 'lib');

const gameEvents = ['player-state', 'hit'];
const proxyGameEvents = (socket1, socket2) => {
    for (const event of gameEvents) {
        socket1.on(event, (payload) => socket2.emit(event, payload));
        socket2.on(event, (payload) => socket1.emit(event, payload));
    }
}

const activePlayers = {};
io.on('connection', (socket) => {
    const { id } = socket;
    activePlayers[id] = { socket };
    console.debug(`Player joined: ${id}`);
    socket.broadcast.emit('players-changed', Object.keys(activePlayers));

    socket.on('disconnect', () => {
        delete activePlayers[id];
        console.debug(`Player left: ${id}`);
        socket.broadcast.emit('players-changed', Object.keys(activePlayers));
    });

    // matchmaking
    ['invite-request', 'invite-accept'].forEach((event) => {
        socket.on(event, (playerId) => {
            console.debug(`${event} from ${socket.id} to ${playerId}`);
            const player = activePlayers[playerId];
            if (player) {
                player.socket.emit(event, id);
                io.emit('players-changed', Object.keys(activePlayers));
            } else {
                // player does not exist
            }
        });
    });
});


app.use('/lib', express.static(LIB_DIR));

app.get('/api/players', (_req, res) => {
    res.send(Object.keys(activePlayers));
});

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on *:${PORT}`);
});