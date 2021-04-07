import {MessageAndData} from '../utils';

const viewerBannableUsers = ['voratius'];

export const handler = async({userData, say, timeout, args}: MessageAndData) => {
    const user = args[0] || 'voratius';
    if(viewerBannableUsers.includes(user) || user === userData.username || userData.isMod) {
        timeout(user);
    } else {
        say(`Sorry but you can't timeout ${user} as a viewer`);
    }
}