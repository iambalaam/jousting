import './index.css';
import { App } from './app';

export const socket = (window as any).io();
delete (window as any).io;

new App();