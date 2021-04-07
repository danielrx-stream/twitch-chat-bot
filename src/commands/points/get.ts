import {MessageAndData, getUserStreamData, getUserId, redis} from '../../utils';

const pointsName = 'PP point';

export const args = [{name: 'user', optional: true, description: 'User to get the points of'}];

export const handler = async({userData, say, args, channel, db}: MessageAndData) => {
    const [user] = args;
    if(user && user !== userData.username) {
        const userId = await getUserId(user);
        const data = await getUserStreamData(userId, channel);
        // ! ----
        const keys = await redis.keys(`users:${channel}:*`);
        const details = await Promise.all(keys.map(async(key) => ({points: await redis.hget(key, 'points'), key})));
        details.sort((a, b) => Number(b.points) - Number(a.points));
        const position = details.findIndex((v) => v.key === `users:${channel}:${userId}`);
        say(`${userData.username}, ${data.username} has ${data.points} ${pointsName}(s) and is ${position + 1}/${details.length} on the leaderboard`);
    } else {
        const keys = await redis.keys(`users:${channel}:*`);
        const details = await Promise.all(keys.map(async(key) => ({points: await redis.hget(key, 'points'), key})));
        details.sort((a, b) => Number(b.points) - Number(a.points));
        const position = details.findIndex((v) => v.key === `users:${channel}:${userData.userId}`);
        say(`${userData.username}, you have ${userData.points} ${pointsName}(s) and are ${position + 1}/${details.length} on the leaderboard`);
    }
}