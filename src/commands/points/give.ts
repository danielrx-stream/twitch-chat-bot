import {getUserData, MessageAndData, redis} from '../../utils';

export const args = [{name: 'receiver', optional: false, description: 'User to give the points to'}, {name: 'points', optional: false, description: 'Amount of points to give'}];

const pointsName = 'PP point';

export const handler = async({args, say, userData, channel}: MessageAndData) => {
    if(args[0] === undefined) { return; };
    const [recv, _amount] = args;
    const amount = Number(_amount);
    if(userData.points < amount) {
        say(`You only have ${userData.points} ${pointsName}(s) ${userData.username}, you can't send ${amount}`);
        return;
    }
    userData.points -= amount;
    const recvId = await getUserData(recv.toLowerCase()).then((x) => x.user.twitch_id);
    await redis.hincrby(`users:${channel}:${recvId}`, 'points', amount);

    say(`${userData.username} gave ${amount} ${pointsName}(s) to ${recv}`);
}

