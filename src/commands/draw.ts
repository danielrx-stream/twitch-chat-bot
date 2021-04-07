import { MessageAndData, getEmote, redis } from '../utils';

import * as glob from 'glob';

import {exec} from 'shelljs';

let interval: NodeJS.Timeout | undefined;

export const handler = async({userData, args, say, emotes, dataDir, channel}: MessageAndData) => {
    console.log('🚀 ~ file: draw.ts ~ line 123 ~ handler ~ emotes', emotes);
    const [shape, ...rest] = args;
    const ts = Date.now();
    let fileType;
    let shapeToAdd;
    switch(shape) {
        case 'emote': {
            const [x, y, emote] = rest as [string, string, string];
            console.log('🚀 ~ file: draw.ts ~ line 17 ~ handler ~ x, y, emote', x, y, emote);
            const {emoteLink, hashOf} = getEmote(emote, emotes);
            let files = glob.sync(`${dataDir}/${hashOf}.*`);
            if(files.length === 0) {
                const tempName = Math.floor(Math.random() * 10000).toString();
                await exec(`curl ${emoteLink} -o ${tempName}`, {silent: false});
                const fileData = (await exec(`file -b ${tempName}`)).stdout;
                fileType = fileData.split(' ')[0] === 'GIF' ? 'gif' : 'png';
                await exec(`mv ${tempName} ${dataDir}/${hashOf}.${fileType}`);
            }

            files = glob.sync(`${dataDir}/${hashOf}.*`);
            fileType = fileType || files[0]!.split('/').slice(-1)[0]!.split('.').slice(-1)[0];
            shapeToAdd = {x, y, emoteHash: hashOf, fileType};
            break;
        }

        case 'text': {
            if(userData.username !== channel && !userData.isMod) {
                say(`${userData.username}, you can't add text to the screen`);
                break;
            }
            const [x, y, ...text] = rest;
            shapeToAdd = {x, y, text};
            break;
        }

        case 'quad': {
            if(rest.length === 0) {
                say(`${userData.username}, to draw a quad: x1, y1, x2, y2, x3, y3, x4, y4`);
                break;
            }
            const [x1, y1, x2, y2, x3, y3, x4, y4] = rest;
            shapeToAdd = {x1, y1, x2, y2, x3, y3, x4, y4};
            break;
        }
        case 'line': {
            if(rest.length === 0) {
                say(`${userData.username}, to draw a line: x1, y1, x2, y2, thickness, opacity`);
                break;
            }
            const [x1, y1, x2, y2, thickness, opacity] = rest as [string, string, string, string, string, string];
            if(+thickness > 20) {
                say(`${userData.username}, ${thickness} is too thick for a line`);
                break;
            }
            shapeToAdd = {x1, y1, x2, y2, thickness: thickness || 1, opacity: opacity || 1};
            break;
        }
        case 'triangle': {
            const [x1, y1, x2, y2, x3, y3] = rest;
            shapeToAdd = {x1, y1, x2, y2, x3, y3};
            break;
        }
        case 'ellipse': {
            const [x, y, w, h] = rest as [string, string, string, string];
            if(+h > 100) {
                say(`${userData.username}, ${h} is too big for a ellipse`);
                break;
            }
            if(+w > 100) {
                say(`${userData.username}, ${w} is too big for a ellipse`);
                break;
            }
            shapeToAdd = {x, y, w, h};
            break;
        }
        case 'circle': {
            const [x, y, w] = rest as [string, string, string];
            if(+w > 100) {
                say(`${userData.username}, ${w} is too big for a circle`);
                break;
            }
            shapeToAdd = {x, y, w, h: w};
            break;
        }
        case 'square': {
            const [x, y, w] = rest;
            shapeToAdd = {x, y, w, h: w};
            break;
        }
        case 'rect': {
            const [x, y, w, h] = rest;
            shapeToAdd = {x, y, w, h};
            break;
        }
        default: {
            say(`${userData.username}, ${shape} is not a valid shape`);
            break;
        }
    }
    if(interval === undefined) {
        interval = setInterval(async() => {
            while(true) {
                const earliestShape = await redis.lindex(`shapes:${channel}`, 0).then((x) => JSON.parse(x));
                if(earliestShape === null) { return; }
                if(earliestShape.ts + 10000 < Date.now()) {
                    await redis.lpop(`shapes:${channel}`);
                } else {
                    return;
                }
            }
        }, 100);
    }
    await redis.rpush(`shapes:${channel}`, JSON.stringify({...shapeToAdd, type: shape, ts}));
}