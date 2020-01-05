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

let unmatchedSocket;
io.on('connection', (socket) => {
    if (unmatchedSocket) {
        // Join game
        unmatchedSocket.emit('initialise', 'blue');
        socket.emit('initialise', 'orange');
        proxyGameEvents(unmatchedSocket, socket);
        unmatchedSocket = undefined;
    } else {
        // Wait for game
        unmatchedSocket = socket;

        // If disconnect before match is made
        socket.on('disconnect', () => {
            if (unmatchedSocket === socket) {
                unmatchedSocket = undefined;
            }
        })
    }
});

app.use('/lib', express.static(LIB_DIR));

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on *:${PORT}`);
});