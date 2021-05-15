import {MessageAndData} from '../utils';

export const args = [];

export const handler = async({say}: MessageAndData) => {
    say(`If you have a suggestion for the bot please add it to the github issues: https://github.com/danielrx-stream/discord-bot/issues/new`);
}