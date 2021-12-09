/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016-now Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
 import {
  WechatyBuilder,
  ScanStatus,
  log,
}                     from 'wechaty'
import qrcodeTerminal from 'qrcode-terminal'
import common from "../common.js"
import request from 'request'

function onScan (qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    console.log(
      `Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrcode
      )}`
    );
    qrcodeTerminal.generate(qrcode);
  }
}

function onLogin (user) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user) {
  log.info('StarterBot', '%s logout', user)
}


var APIKEY = "申请的天行API";

async function onMessage (msg) {
  // console.log(msg)
  log.info('StarterBot', msg.toString())
   // 判断消息来自自己，直接return
  if (msg.self()) return;
  // console.log(bot.Room)
  switch (msg.type()) {
    
    case 7:
      // console.log("获取到文本");
      if (msg.room()) {
        // console.log(msg.room())
        console.log(msg.room().id)
        // await room.say(res);
        if (msg.room().id === "@@518a14ed11ee6d9f68a86a9a8321cd43d25e30827ca2118bfb38155f413dea4a") {
          // 
          roomMessageReply(msg)
          return
        }
      }
  }

  async function roomMessageReply(msg) {
    const room = msg.room();
    const text = msg.text();
    var resdata = "";
    var member = msg.talker();
    if (await msg.mentionSelf()) {
      // 获取消息内容，拿到整个消息文本，去掉 @名字
      console.log(text)
      // 关键词判断
      if (/互动/.test(text)) {
        resdata = "互动测试";
        msg.room().say(resdata, member);
      }
      if (/天气/.test(text)) {
        const cities = common.cities
        const message = msg.text().split(" ");
        if (cities[message[2]]) {
            var w_id = cities[message[2]]
            request.post({
            url:'http://api.tianapi.com/tianqi/index',
                form:{
                key: APIKEY,
                city: w_id
            } 
            },function(err,response,body ){
                const res = JSON.parse(body)
                if (res.code === 200) {
                    let info = res.newslist[0]
                    resdata = `今日${info.week}。${info.area}${info.weather}，${info.wind} ${info.windsc}<br/>` +
                    `最低温度${info.lowest}，最高温度${info.highest}，当前温度${info.real}` +
                    `[太阳]${info.sunrise}升起，${info.sunset}落下<br/>` +
                    `[月亮]${info.moonrise}升起，${info.moondown}落下<br/>` +
                    `生活小贴士：${info.tips} <br/>`;
                }else {
                  resdata = "接口不知道发生什么了，没有数据返回啊！！";
                }
                msg.room().say(resdata, member);
                return;
            });
        }else {
          resdata = "某个大帅比太懒，还没把这个城市加上去QAQ！"
          msg.room().say(resdata, member);
        }
      }
      
      if (/彩虹屁/.test(text)) {
        request.post({
          url:'http://api.tianapi.com/caihongpi/index',
              form:{
              key: APIKEY,
              city: w_id
          } 
          },function(err,response,body ){
              const res = JSON.parse(body)
              if (res.code === 200) {
                  let info = res.newslist[0]
                  resdata = `${info.content}`;
              }else {
                resdata = "接口不知道发生什么了，没有数据返回啊！！";
              }
              msg.room().say(resdata, member);
              return;
        });
      }
   
      if (/舔狗/.test(text)) {
        request.post({
          url:'http://api.tianapi.com/tiangou/index',
              form:{
              key: APIKEY,
              city: w_id
          } 
          },function(err,response,body ){
              const res = JSON.parse(body)
              if (res.code === 200) {
                  let info = res.newslist[0]
                  resdata = `${info.content}`;
              }else {
                resdata = "接口不知道发生什么了，没有数据返回啊！！";
              }
              msg.room().say(resdata, member);
              return;
        });
      }
    }
  }
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-padlocal' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-padlocal`)
   *
   * You can use the following providers:
   *  - wechaty-puppet-wechat (no token required)
   *  - wechaty-puppet-padlocal (token required)
   *  - wechaty-puppet-service (token required, see: <https://wechaty.js.org/docs/puppet-services>)
   *  - etc. see: <https://github.com/wechaty/wechaty-puppet/wiki/Directory>
   */
  // puppet: 'wechaty-puppet-wechat',
})

function getTimeState() {
    // 获取当前时间
    let timeNow = new Date();
    // 获取当前小时
    let hours = timeNow.getHours();
    // 设置默认文字
    let state= ``;
    // 判断当前时间段
    if (hours >= 0 && hours <= 10) {
        state = `早上好！[太阳]`;
    } else if (hours > 10 && hours <= 14) {
        state= `中午好!`;
    } else if (hours > 14 && hours <= 18) {
        state= `下午好! `;
    } else if (hours > 18 && hours <= 24) {
        state= `晚上好 [月亮]`;
    }
    return state;
}


bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))