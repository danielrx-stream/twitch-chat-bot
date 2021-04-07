import {MessageAndData} from '../utils';

import * as moment from 'moment';
import 'moment-precise-range-plugin';

import {ApiVersions} from 'twitch-js';

export const args = [];

export const handler = async({api, say, userData, channel}: MessageAndData) => {
    const data = await api.get('users/follows', {version: ApiVersions.Helix, search: {to_id: 124571223, from_id:  userData.userId}});
    if(data.data.length === 0) {
        say(`${userData.username} is not following ${channel}`);
        return;
    }
    const followData = data.data[0];
    const start = moment(followData.followedAt);
    const end = moment();
    say(`${userData.username} has been following ${channel} for ${(moment as any).preciseDiff(start, end)}`);
}

