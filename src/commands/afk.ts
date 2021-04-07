import {MessageAndData} from '../utils';

export const args = [{name: 'reason', optional: true, description: 'Reason for going AFK'}];

export const config = {modOnly: false};

export const handler = async({args, say, userData}: MessageAndData) => {
    userData.afk = true;
    userData.afkReason = args.join(' ') || '';
    say(`${userData.username} is now afk${userData.afkReason ? `: ${userData.afkReason}` : ''}`);
}