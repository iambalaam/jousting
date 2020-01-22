import { Vector } from './renderers';

export interface PlayerState {
    color: string,
    team: string,
    grounded: boolean,
    isJumping: boolean,
    sliding: boolean,
    position: Vector,
    velocity: Vector,
}

const defaultPlayerOpts = {
    grounded: false,
    isJumping: false,
    sliding: false,
    velocity: { x: 0, y: 0 }
};

export type createPlayerOpts = {
    team: string,
    position: Vector;
} & Partial<PlayerState>;

export const createPlayer = (playerOpts: createPlayerOpts): PlayerState => {
    // clone objects
    const position = { ...playerOpts.position };
    const velocity = playerOpts.velocity ? { ...playerOpts.velocity } : { ...defaultPlayerOpts.velocity };

    return {
        ...defaultPlayerOpts,
        ...playerOpts,
        position,
        velocity,
        color: playerOpts.color || playerOpts.team,
    };
};