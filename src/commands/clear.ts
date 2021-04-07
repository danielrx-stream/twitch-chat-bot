import {MessageAndData, redis} from '../utils';

export const args = [];

export const handler = async({channel}: MessageAndData) => {
    let len = await redis.llen(`shapes:${channel}`);
    while(len > 0) {
        await redis.lpop(`shapes:${channel}`);
        len = await redis.llen(`shapes:${channel}`);
    }
}