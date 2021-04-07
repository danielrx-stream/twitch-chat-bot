import {MessageAndData, randomInt} from '../utils';

export const handler = async({args, say}: MessageAndData) => {
    const sides = Number(args[0] || '6');
    const result = randomInt(sides);
    await say(`You rolled a ${result} on a d${sides}`);
}

