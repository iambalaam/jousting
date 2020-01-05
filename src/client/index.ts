import './index.css';
import { App } from './app';

declare const window: Window & { io: () => any; };
export const socket = window.io();

new App();