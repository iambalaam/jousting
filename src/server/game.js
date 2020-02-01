const gameEvents = ['player-state', 'hit'];

const joinGame = (...sockets) => {
    const gameNamespace = '/game/new';
    console.log(`${sockets} in ${gameNamespace}`);
    for (const socket of sockets) {
        socket.join(gameNamespace, () => {
            gameEvents.forEach((event) => {
                socket.on(event, (payload) => {
                    console.log(`${socket.id} sent ${event}`);
                    socket.broadcast.to(gameNamespace).emit(event, payload);
                    // socket.broadcast.emit(event, payload);
                });
            });
        });
    }
};

module.exports = { joinGame };