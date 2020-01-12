import { socket } from ".";

export type DebugPingCallback = (ping: number) => void;
export const initDebugPing = (updatePing: DebugPingCallback) => {
    socket.on('debug-pong', (time: number) => {
        updatePing((Date.now() - time) / 2);
        socket.emit('debug-ping', Date.now());
    });
    socket.emit('debug-ping', Date.now());
};
export const cleanDebugPing = () => {
    socket.off('debug-pong');
};
