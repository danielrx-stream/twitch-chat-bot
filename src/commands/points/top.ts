import {MessageAndData, redis} from '../../utils';

const pointsName = 'PP point';

export const args = [];
export const handler = async({channel, say}: MessageAndData) => {
    const keys = await redis.keys(`users:${channel}:*`);
    const details = await Promise.all(keys.map(async(key) => ({points: await redis.hget(key, 'points'), key})));
    details.sort((a, b) => Number(b.points) - Number(a.points));
    const {key: userId, points} = details[0]!;
    const user = await redis.hget(userId!, 'username');
    say(`The user with the most ${pointsName}s is ${user} with ${points}!`);
}