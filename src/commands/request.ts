import {MessageAndData} from '../utils';

export const args = [];

export const handler = async({say}: MessageAndData) => {
    say(`Use https://bsaber.com/songs to find a song, click the twitch icon to get the song request command then use it like "!bsr 2144"`);
}