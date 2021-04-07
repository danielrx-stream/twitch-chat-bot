import {MessageAndData} from '../utils';


export const args = [{name: 'emote', optional: false, description: 'The emote to make a pyramid of'}, {name: 'width', optional: false, description: 'The width of the pyramid to draw'}];

export const config = {modOnly: true};

const maxWidth = 10;

export const handler = async({args, say}: MessageAndData) => {
    const [emote, width] = args;
    const w = Number(width!);
    if(w > maxWidth) { return say(`Sorry but you can't make a pyramid wider than ${maxWidth}`) }
    for(let i = 0; i <= w; i++) {
        say(Array(i).fill(emote).join(' '));
    }
    for(let i = w - 1; i > 0; i--) {
        say(Array(i).fill(emote).join(' '));
    }
}