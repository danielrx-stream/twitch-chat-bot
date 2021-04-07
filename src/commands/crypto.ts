import {MessageAndData} from '../utils';

export const args = [];

export const handler = async({say}: MessageAndData) => {
    say(`Ask me questions about crypto to answer on stream: https://forms.gle/SzcMaVRxJZz4VwU27`);
}