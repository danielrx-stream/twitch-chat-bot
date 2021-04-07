const server = require('http').createServer();

import * as ioredis from 'ioredis';

import { Server } from 'socket.io';
const io = new Server(server,   {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
  }
});

const redis = new ioredis({host: 'danielserver', port: 6666});


server.listen(3456);

let channel: string | undefined;

io.on('connection', (socket) => {
    setInterval(() => {
        if(channel !== undefined) {
            redis.lrange(`shapes:${channel}`, 0, -1).then((x) => x.map((y) => JSON.parse(y))).then((shapes) => {
                socket.send({shapes});
            })
        }
    }, 100)

    setInterval(() => {
        if(channel !== undefined) {
            redis.smembers(`chatters:${channel}`).then(async(chatters) => {
                Promise.all(chatters.map(async(chatter) => {
                    const userId = await redis.hmget('users:global', chatter);
                    return {chatter, avatars: await redis.lrange(`avatars:${channel}:${userId}`, 0, -1)};
                })).then((avatars) => socket.send({avatars}));
                socket.send({chatters});
            })
        }
    }, 1000);

    socket.on('message', <T extends {channel?: string}>(data: T) => {
        if(data.channel) { channel = data.channel; }
    })
})