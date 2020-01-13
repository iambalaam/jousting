import { Renderer, cleanMain } from '.';
import * as React from 'jsx-dom';
import { socket } from '..';
import { Matchmaking } from './matchmaking';

export class CreatePlayer implements Renderer {
    cleanActions = [cleanMain];
    constructor(private updateRenderer: any) {
        const main = document.getElementsByTagName('main')[0];
        main.appendChild(this.renderInput());
    }

    submitForm = async (event: MouseEvent) => {
        event.preventDefault();
        const form = (event.target as any).form;
        const name = form.elements[0].value;
        const response = await fetch('/api/setPlayerName', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ playerId: socket.id, name })
        });
        if (response.ok) {
            this.updateRenderer(Matchmaking);
        } else {
            response.text().then(console.error);
        }
    };

    renderInput() {
        const form = (
            <form>
                <label>username: <input type="text" placeholder={socket.id} /></label>
                <button type="submit" onClick={this.submitForm}>continue</button>
            </form>
        );
        return form;
    }
}