import {MessageAndData} from '../utils';

export const args = [];

export const handler = async({say, userData}: MessageAndData) => {
    say(`${userData.username}, you got ${Math.random() > 0.5 ? 'tails': 'heads'}`);
}