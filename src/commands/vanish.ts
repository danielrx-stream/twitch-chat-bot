import {MessageAndData} from '../utils';

export const args = [];

export const handler = async({timeout, userData}: MessageAndData) => {
    timeout(userData.username, 1, 'Used !vanish');
}
