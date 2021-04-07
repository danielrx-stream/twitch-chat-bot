import {getEmote, getUserId, MessageAndData, redis} from '../utils';
import * as glob from 'glob';

export const args = [{name: 'emote', optional: false, description: 'Avatar to give'}, {name: 'receiver', optional: true, description: 'User to give the avatar to'}, ];

export const config = {modOnly: true};

export const handler = async({args, userData, emotes, channel, dataDir}: MessageAndData) => {
    const emote = args[0]!;
    const user = args[1]! || userData.username;
    const userId = await getUserId(user);
    const {hashOf} = getEmote(emote, emotes);
    const files = glob.sync(`${dataDir}/${hashOf}.*`);
    const fileType = files[0]!.split('/').slice(-1)[0]!.split('.').slice(-1)[0];
    await redis.rpush(`avatars:${channel}:${userId}`, `${hashOf}.${fileType}`);
}

