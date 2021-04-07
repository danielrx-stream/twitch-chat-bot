import {sha256} from 'js-sha256'
export class Emote {
    public type: 'BTTV' | 'FFZ' | 'Twitch';
    public url: string;
    public id: string;
    public name: string;
    public width!: number;
    public height!: number;
    public format!: 'PNG' | 'GIF';
    public hashOf: string;

    constructor(url: string, id: string, name: string, type: 'BTTV' | 'FFZ' | 'Twitch') {
        this.url = url;
        this.id = id;
        this.name = name;
        this.type = type;
        this.hashOf = sha256(`${type}-${id}`);
    }
}