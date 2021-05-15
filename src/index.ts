import {client as tmiClient} from 'tmi.js';
import {getUserStreamData, MessageAndData, redis, emoteData, getBTTV, getFFZ, twitchLink, getUserId} from './utils';

import {Api} from 'twitch-js'

const token = process.env.TWITCH_TOKEN;
const clientId = process.env.TWITCH_CLIENT_ID;

import {commands} from './commands/functions';
import { Message } from './classes/message';
import { Emote } from './classes/emote';

import * as fs from 'fs-extra';

const api = new Api({token, clientId});

const client = tmiClient({
    identity: { username: 'danielrx_bot', password: `oauth:${process.env.BOT_OAUTH}`},
    channels: ['danielrx_'],
    options: {debug: false},
    connection: {reconnect: true}
});

const moduleNames = {showemote: 'show-emote', randomemote: 'random-emote', givepoints: 'give-points', endstream: 'end-stream', coinflip: 'coin-flip'} as any;

const cmdPrefix = '!';

const onMessageHandler = async(target: string, context: any, msg: string, self: boolean) => {
    const ts = context['tmi-sent-ts'];
    const isSub = context.subscriber;
    const userColour = context.color;
    const userId = context['user-id'];
    const sender = context.username;
    const channel = target.replace('#', '');
    const channelId = await getUserId(channel);
    const isMod = context.mod || sender === channel;
    const say = (message: string) => client.say(target, message);
    const timeout = (user: string, length = 1, reason = '') => client.timeout(target, user, length, reason);
    const dataDir = `/home/daniel/twitch/bot/data`;
    if(self) { return; } // Ignore messages from the bot
    // console.time(`Replied to message from ${sender}`);

    const userData = await getUserStreamData(userId, channel);
    const emotes = Object.entries((context.emotes || {}) as {[key: string]: string[]}).map(([k, v]: [string, string[]]) => {
        const [start, end] = v[0]!.split('-').map(Number);
        const emoteName = msg.slice(start, end! + 1);
        return new Emote(twitchLink(k), k, emoteName, 'Twitch');
    });
    msg.split(' ').forEach((word) => {
        const {ffzEmoteNames, bttvEmoteNames, bttvEmoteIds, ffzEmoteLinks, ffzEmoteIds, bttvEmoteLinks} = emoteData[channel]!
        if(ffzEmoteNames.includes(word)) {
            const i = ffzEmoteNames.indexOf(word);
            emotes.push(new Emote(ffzEmoteLinks[i]!, ffzEmoteIds[i]!, word, 'FFZ'));
            return;
        }
        if(bttvEmoteNames.includes(word)) {
            const i = bttvEmoteNames.indexOf(word);
            emotes.push(new Emote(bttvEmoteLinks[i]!, bttvEmoteIds[i]!, word, 'BTTV'));
            return;
        }
    });
    if(msg.startsWith(cmdPrefix)) {
        const [_commandName, ...args] = msg.trim().slice(1).split(' ') as [typeof commands[number], ...string[]];
        const commandName = _commandName.toLowerCase();
        const name = commandName in moduleNames ? moduleNames[commandName] : commandName;


        const x: MessageAndData =  {userData, say, timeout, args, client, emotes, ts, channel, dataDir, message: new Message(msg), api, channelId};
        if(commandName === '') {

        }
        else if(!commands.includes(name)) {
            say(`Sorry but ${commandName} isn't a valid command`);
        } else {
            let success = true;
            let moduleObj;
            const stats = await fs.lstat(`./commands/${name}`).catch(() => ({isDirectory: () => false}));
            const folder = stats.isDirectory();
            if(folder) {
                moduleObj = require(`./commands/${name}/${args[0]}`);
                x.args = x.args.slice(1);
            } else {
                moduleObj = require(`./commands/${name}`);
            }
            if(moduleObj.config) {
                if(moduleObj.config.modOnly) {
                    if(!(userData.isMod || userData.username === channel)) {
                        success = false;
                        say(`You need to be a mod to run that command!`);
                    }
                }
            }
            if(moduleObj.args) {
                for(let i = 0; i < moduleObj.args.length && success; i++) {
                    if(moduleObj.args[i].optional) { continue; }
                    if(args[i] === undefined) {
                        const helpString = `${cmdPrefix}${commandName} ${moduleObj.args.reduce((str: string, arg: any) => str + ' ' + (arg.optional ? `{${arg.name}}` : arg.name), '')}`;
                        say(`You missed the ${moduleObj.args[i].name} param, the command should look like: ${helpString}`);
                        success = false;
                    }
                }
            }
            if(success) {
                await moduleObj.handler(x);
            }
        }
    } else {
        if(msg.includes('modCheck')) {
            const subject = msg.replace(/ modCheck .*/, '');
            say(`Sorry ${sender} but I can't find any ${subject}`);

        }
        if(userData.afk) {
            say(`${sender} is no longer afk!`);
            userData.afk = false;
        }
    }
    if(true || BigInt(ts) > BigInt(userData.lastReward) + (BigInt(120) * BigInt(1000))) {
        userData.lastReward = ts;
        await redis.hincrby(`users:${channel}:${userData.userId}`, 'points', 1);
    }
    userData.userColour = userColour;
    userData.isMod = isMod;
    userData.isSub = isSub;
    userData.username = sender;
    delete (userData as any).messages;
    await redis.hset(`users:${channel}:${userId}`, userData as any);
    await redis.rpush(`messages:${channel}:${userId}`, JSON.stringify({msg, ts}));
}

const onConnectedHandler = async(addr: string, port: number) => {  console.log(`* Connected to ${addr}:${port}`); }
const onJoinHandler = async(channel: string, name: string, self: boolean) => {
    const channelName = channel.replace('#', '');
    if(self) {
        emoteData[channelName] = {bttvEmoteIds: [], bttvEmoteNames: [], ffzEmoteLinks: [], ffzEmoteNames: [], ffzEmoteIds: [], bttvEmoteLinks: []}
        await getBTTV(channelName);
        await getFFZ(channelName);
        await redis.del(`chatters:${channelName}`);
    }
    await redis.sadd(`chatters:${channelName}`, name);
}

const onPartHandler = async(channel: string, name: string, _self: boolean) => {
    const channelName = channel.replace('#', '');
    await redis.srem(`chatters:${channelName}`, name);
}

client.on('message', onMessageHandler);
client.on('join', onJoinHandler);
client.on('part', onPartHandler);
client.on('connected', onConnectedHandler);
client.connect();
