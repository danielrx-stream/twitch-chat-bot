import { MessageAndData } from '../utils';

export const args = [];

export const handler = async({userData, timeout}: MessageAndData) => {
    timeout(userData.username);
}