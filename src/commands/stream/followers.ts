import {MessageAndData} from '../../utils';

import {ApiVersions} from 'twitch-js';

export const args = [];

const countToGet = 100;

export const handler = async({api, say, channel, channelId}: MessageAndData) => {
    let data = await api.get('users/follows', {version: ApiVersions.Helix, search: {to_id: channelId, first: countToGet}});
    let count = data.data.length;
    while(data.data.length === countToGet && data.pagination && data.pagination.cursor) {
        data = await api.get('users/follows', {version: ApiVersions.Helix, search: {to_id: channelId, first: countToGet, after: data.pagination.cursor}});
        count += data.data.length;
    }
    say(`${channel} has ${count} followers`);
}

