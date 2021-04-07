import {MessageAndData} from '../utils';

import {emoteData, randomElement} from '../utils';

export const args = [];

export const handler = async({say, channel}: MessageAndData) => {
    const emote = await randomElement([...emoteData[channel]!.ffzEmoteNames!, ...emoteData[channel]!.bttvEmoteNames!]);
    say(emote);
}
