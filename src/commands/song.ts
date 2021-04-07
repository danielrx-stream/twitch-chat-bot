import {MessageAndData} from '../utils';
import axios from 'axios';

export const args = [];

export const handler = async(data: MessageAndData) => {
    axios('http://127.0.0.1:8081/spotify.json').then((data2) => {
        const {url, title, artist} = data2.data;
        data.say(`${title} - ${artist}: ${url}`);
    })
}