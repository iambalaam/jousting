import { Renderer, cleanMain } from '.';
import * as React from 'jsx-dom';
import { socket } from '..';
import { Matchmaking } from './matchmaking';
import { setUsername } from '../app';

export class CreatePlayer implements Renderer {
    dirty = false;
    cleanActions = [cleanMain];
    constructor(private updateRenderer: (rendererConstructor: any, _opts: any) => void, _opts: any) {
        const main = document.getElementsByTagName('main')[0];
        main.appendChild(this.renderInput());
    }

    onChange = () => {
        this.dirty = true;
    };

    submitForm = async (event: MouseEvent) => {
        event.preventDefault();
        const form = (event.target as any).form;
        const name = form.elements[0].value;
        const response = await setUsername(socket.id, name);
        if (response.ok) {
            this.updateRenderer(Matchmaking, {});
            this.dirty && window.localStorage.setItem('username', name);
        } else {
            response.text().then(console.error);
        }
    };

    renderInput() {
        const form = (
            <form>
                <label>username: <input type="text" value={socket.id} onChange={this.onChange} /></label>
                <button type="submit" onClick={this.submitForm}>continue</button>
            </form>
        );
        return form;
    }
}