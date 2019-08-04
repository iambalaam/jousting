const express = require('express');
const socketIO = require('socket.io');
const { resolve } = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIO(server);
const { html } = require('./html');

const PORT = process.env.PORT || 3000;
const PGK_ROOT = resolve(__dirname, '../../');
const LIB_DIR = resolve(PGK_ROOT, 'lib');

io.on('connection', function (socket) {
    socket.on('player-state', (state) => {
        socket.broadcast.emit('player-state', state);
    });
});

app.use('/lib', express.static(LIB_DIR));

app.get('*', (_req, res) => {
    res.send(html());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on *:${PORT}`);
});