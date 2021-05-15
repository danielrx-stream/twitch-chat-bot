import {Api, ApiVersions} from 'twitch-js'
import {client as tmiClient} from 'tmi.js';

import * as ioredis from 'ioredis';

export const redis = new ioredis({host: 'danielserver', port: 6666});

const token = process.env.TWITCH_TOKEN;
const clientId = process.env.TWITCH_CLIENT_ID;

const to_id = 124571223;
const countToGet = 100;

const client = tmiClient({
  identity: { username: 'danielrx_bot', password: `oauth:${process.env.BOT_OAUTH}`},
  channels: ['danielrx_'],
  options: {debug: false}
});


client.connect();
let connected = false;

const onJoinHandler = async(_channel: string, _name: string, _self: boolean) => { connected = true; }
client.on('join', onJoinHandler);

export const run = async () => {
   const api = new Api({token, clientId});
  //  const chat = new Chat({username: 'DanielRX_', token});

  const getVips = async() => {
    if(!connected) { return; }
    const oldVips = await redis.smembers(`vips:${to_id}`);
    if(oldVips.length > 0) {
      await redis.srem(`vips:${to_id}`, ...(oldVips || ['']));
    }
    const vips = await client.vips('#DanielRX_');
    await redis.sadd(`vips:${to_id}`, vips);
  }

  const getMods = async() => {
    if(!connected) { return; }
    const oldMods = await redis.smembers(`mods:${to_id}`);
    if(oldMods.length > 0) {
      await redis.srem(`mods:${to_id}`, ...(oldMods || ['']));
    }
    const mods = await client.mods('#DanielRX_');
    await redis.sadd(`mods:${to_id}`, mods);
  }

  const getFollowCount = async() => {
    let data = await api.get('users/follows', {version: ApiVersions.Helix, search: {to_id, first: countToGet}});
    let count = data.data.length;
    while(data.data.length === countToGet && data.pagination && data.pagination.cursor) {
        data = await api.get('users/follows', {version: ApiVersions.Helix, search: {to_id, first: countToGet, after: data.pagination.cursor}});
        count += data.data.length;
    }
    // console.log(`You have ${count} followers`);
    await redis.hset(`streamData:${to_id}`, 'followers', count);
  }

  const getSubCount = async() => {
    let data = await api.get('subscriptions', {version: ApiVersions.Helix, search: {broadcaster_id: to_id, first: countToGet}});
    let allData = [...data.data];
    let count = data.data.length;
    while(data.data.length === countToGet && data.pagination && data.pagination.cursor) {
        data = await api.get('subscriptions', {version: ApiVersions.Helix, search: {broadcaster_id: to_id, first: countToGet, after: data.pagination.cursor}});
        count += data.data.length;
        allData = [...allData, ...data.data]
    }
    /*
    allData = allData.map(removeTrash);
    const gifts = allData.filter((x) => 'gifterName' in x);
    const nonGifts = allData.filter((x) => !('gifterName' in x));
    const gifters = gifts.map((x) => x.gifterName);
    const collectGifts = (x: any[]) => {
      const d: {[key: string]: any[]} = {};
      gifters.forEach((gifter) => {
        const g = x.filter((y) => y.gifterName === gifter);
        if(g.length > 0) {
          d[gifter] = g.map((x) => x.userName);
        }
      })
      return d;
    }
    const removeTrash = ({tier, userName, gifterName, isGift}: any) => {
      if(isGift === false) { return {tier, userName}; }
      return {tier, userName, gifterName};
    }
    const getUsername =  ({userName}: any) => userName;

    const giftsT1 = collectGifts(gifts.filter((x) => x.tier === "1000").map(getUsername));
    const giftsT2 = collectGifts(gifts.filter((x) => x.tier === "2000").map(getUsername));
    const giftsT3 = collectGifts(gifts.filter((x) => x.tier === "3000").map(getUsername));
    const t1 = nonGifts.filter((x) => x.tier === "1000").map(getUsername);
    const t2 = nonGifts.filter((x) => x.tier === "2000").map(getUsername);
    const t3 = nonGifts.filter((x) => x.tier === "3000").map(getUsername);
    await redis.hset(`streamData:${to_id}`, 'subsRaw', JSON.stringify({giftsT1, giftsT2, giftsT3, t1, t2, t3}));
    */
    // console.log(`You have ${count} subs`);
    await redis.hset(`streamData:${to_id}`, 'subs', count - 1);
  }


    const getCheerData = async() => {
      let allData: any[] = [];
      let data = await api.get('bits/leaderboard', {version: ApiVersions.Helix, search: {broadcaster_id: to_id, count: countToGet}});
      allData = [...allData, ...data.data];

      while(data.data.length === countToGet && data.pagination && data.pagination.cursor) {
          data = await api.get('bits/leaderboard', {version: ApiVersions.Helix, search: {broadcaster_id: to_id, count: countToGet, after: data.pagination.cursor}});
          allData = [...allData, ...data.data];
      }
      // redis.lpush(`streamData:${to_id}:cheers`, ...allData.map((x) => JSON.stringify(x)));
      await redis.hset(`streamData:${to_id}`, 'cheers', allData.reduce((prev, curr) => prev + curr.score, 0));
    }
  await getVips();
  await getMods();
  await getCheerData();
  await getSubCount();
  await getFollowCount();

  return {getFollowCount, getSubCount, getCheerData, getVips, getMods};
};
run();
setInterval(run, 60 * 1000);
