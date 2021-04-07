import * as fs from 'fs-extra'

import {MessageAndData} from '../utils';

export const commands = fs.readdirSync('./commands').map((filename) => filename.replace('.ts', ''));

export const args = [];

export const handler = async({say}: MessageAndData) => {
    say(`Here is a list of my commands: ${commands.join(', ')}`);
}

