import {MessageAndData, randomInt} from '../utils';
import * as draw from './draw';

export const args = [{name: 'emote', optional: false, description: 'Emote to display'}];

export const handler = async(data: MessageAndData) => {
    // const [emote, count] = data.args;
    const [emote] = data.args;
    await draw.handler({...data, args: ['emote', '' + randomInt(1920), '' + randomInt(1080), emote!]})
    // if(data.userData.isMod.toString() === 'true' || (data.userData.username === data.channel)) {
    //     for(let i = 1; i < Number(count!); i++) {
    //         draw.handler({...data, args: ['emote', '' + randomInt(1920), '' + randomInt(1080), emote!]})
    //     }
    // }
}