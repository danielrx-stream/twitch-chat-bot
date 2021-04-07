import axios from 'axios';
import {Client} from 'tmi.js';
import {Api} from 'twitch-js'

import * as ioredis from 'ioredis';
import { Message } from './classes/message';
import { Emote } from './classes/emote';

export const redis = new ioredis({host: 'danielserver', port: 6666});

const data = <T>(x: {data: T}) => x.data;

const get = axios.create({baseURL: 'https://api.frankerfacez.com/v1'});
const get2 = axios.create({baseURL: 'https://api.betterttv.net/3'});

export const getUserData = (channel: string) => get(`/user/${channel}`).then(data);
export const getRoomData = (twitch_id: string) =>  get(`/room/id/${twitch_id}`).then(data);
export const getSetData = (set: string) => get(`/set/${set}`).then(data);

export const randomElement = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

export const getUserId = async(channel: string) => {
    const user = channel.toLowerCase();
    const [userId] = await redis.hmget('users:global', user);
    if(userId !== null) { return userId; }
    const data = await getUserData(user);
    redis.hmset(`users:global`, user, data.user.twitch_id);
    return data.user.twitch_id;
}

export type MessageAndData = {
    args: string[],
    say: (msg: string) => void,
    timeout: (user: string, length?: number, reason?: string) => void,
    userData: UserStreamData,
    channel: string, // Target without the #
    channelId: number,
    emotes: Array<Emote>
    client: Client,
    ts: string,
    dataDir: string,
    message: Message,
    api: Api
}

export type UserStreamData = {
    lastReward: string,
    username: string,
    messages: ({msg: string, ts: string})[],
    isSub: boolean,
    isMod: boolean,
    userColour: string,
    points: number,
    afk: boolean,
    afkReason: string,
    userId: string
};



export const getUserStreamData = async(userId: string, channel: string) => {
    let userData: UserStreamData = {userId, username: '', messages: [], isSub: false, isMod: false, userColour: '#FFFFFF', points: 0, lastReward: '0', afk: false, afkReason: ''};
    const data = await redis.hgetall(`users:${channel}:${userId}`) as any;
    if(JSON.stringify(data) !== '{}') {
        data.afk = data.afk === 'true';
        const messages = await redis.lrange(`messages:${channel}:${userId}`, 0, -1).then((x) => x.map((y) => JSON.parse(y)))
        userData = {...userData, ...data, messages};
    }
    return userData;
}

type EmoteData = {
    bttvEmoteNames: string[],
    bttvEmoteIds: string[],
    bttvEmoteLinks: string[],
    ffzEmoteNames: string[],
    ffzEmoteIds: string[],
    ffzEmoteLinks: string[]
};

export const emoteData: {[key: string]: EmoteData} = {} as any;

export const getBTTV = async(channel: string) => {
    const userData = await getUserData(channel);
    const emotes = await get2(`/cached/users/twitch/${userData.user.twitch_id}`).then(data).then((e) => [...e.sharedEmotes, ...e.channelEmotes]);
    const globalEmotes = await get2(`/cached/emotes/global`).then(data);
    emoteData[channel]!.bttvEmoteNames = [...emotes, ...globalEmotes].map((emote: any) => emote.code);
    emoteData[channel]!.bttvEmoteIds = [...emotes, ...globalEmotes].map((emote: any) => emote.id);
    emoteData[channel]!.bttvEmoteLinks = [...emotes, ...globalEmotes].map((emote: any) => bttvLink(emote.id));
}

export const getFFZ = async(channel: string) => {
    if((emoteData[channel]!.ffzEmoteNames || []).length === 0) {
        const userData = await getUserData(channel);
        const roomData = await getRoomData(userData.user.twitch_id);
        const setData = await getSetData(roomData.room.set);

        const emotes = await get(`/set/global`).then(data).then((x) => x.sets[x.default_sets[0]]);
        emoteData[channel]!.ffzEmoteNames = [...setData.set.emoticons, ...emotes.emoticons].map((emote: any) => emote.name);
        emoteData[channel]!.ffzEmoteLinks = [...setData.set.emoticons, ...emotes.emoticons].map((emote: any) => (emote.urls[4] || emote.urls[2] || emote.urls[1]).replace('//cdn', 'https://cdn'));
        emoteData[channel]!.ffzEmoteIds = emoteData[channel]!.ffzEmoteLinks.map((link) => link.replace('https://cdn.frankerfacez.com/emote/', '').replace(/\/.*/, ''));
    }
}

export const randomInt = (max: number) => { return Math.floor(Math.random() * max) + 1; }


export const bttvLink = (emoteId: string) => `https://cdn.betterttv.net/emote/${emoteId}/3x`;
export const twitchLink = (emoteId: string) => `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/3.0`;

export const getEmote = (emoteName: string, emotes: Emote[]) => {
    const emote = emotes.find((e) => e.name === emoteName)!;
    return {emoteLink: emote.url, hashOf: emote.hashOf};
}