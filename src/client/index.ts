import './index.css';
import { App } from './app';

const socket = (window as any).io();
delete (window as any).io;

const waitForSocket = (cb: (s: any) => void) => {
    if (socket.id === undefined) {
        console.log('waiting for socket initialisation');
        setTimeout(() => { waitForSocket(cb); }, 10);
    } else {
        cb(socket);
    }
};

waitForSocket((s) => {
    new App(s).init();
});

export { socket };