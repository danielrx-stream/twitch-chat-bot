import {Channel} from './channel';
import {Emote} from './emote';
import {User} from './user';

export class Message {
    public raw: string;
    public emotes!: Emote[];
    public sender!: User;
    public timestamp!: string;
    public channel!: Channel;

    constructor(raw: string) {
        this.raw = raw;
    }
}