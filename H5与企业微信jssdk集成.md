##H5与企业微信jssdk集成

一、公众号设置
----
注册企业，在应用与小程序栏目中，设置可信域名，配置公众号菜单。可信域名不得不说下，在最初开发时，认为设置并验证后，微信认证接口会实现跨域请求，其实并没有。所以全在H5端还得配合服务端完成票据获取等操作。


二、开发步骤
-----
+ 资源引入
1. 开发文档地址 https://work.weixin.qq.com/api/doc#90001/90144/90545
2. 在html引入  http://res.wx.qq.com/open/js/jweixin-1.4.0.js
3. 在html引入SHA1 库为初始SDK提供签名算法 https://www.npmjs.com/package/sha1
+ 初始流程基本流程(https://work.weixin.qq.com/api/doc#90001/90144/90547)
1. 获取accesstoken
接口地址  https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ID&corpsecret=SECRET , 获取到的token的有效时间为2小时
H5不能直接访问，需要服务端通过代理访问
```javascript
//author herbert QQ:464884492
 getAccessToken() {
        // 判断是否缓存有
        return new Promise((resolve, reject) => {
            var access_token = localStorage.getItem("accessToken");
            var expires = localStorage.getItem("expires_accessToken");
            if (expires > new Date().getTime() - 2000) {
                resolve(access_token);
                return;
            }
            let accessTokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + this.groupId + "&corpsecret=" + this.secretId;

            //  fetch(accessTokenUrl, { method: "GET" })
            fetch(this.porxyUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "GET",
                    url: accessTokenUrl
                })
            }).then(resp => {
                return resp.json()
            }).then(data => {
                if (data.errcode == 0) {
                    //保存本次获取的accessToken
                    localStorage.setItem("accessToken", data.access_token);
                    localStorage.setItem("expires_accessToken", new Date().getTime() + data.expires_in * 1000);
                    resolve(data.access_token);
                }
            }).catch(data => {
                reject();
            })
        });
    },
```
2. 获取ticket

使用上一步骤获取到的access_token获取ticket，接口地址https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=ACCESS_TOKEN
H5不能直接访问，需要服务端通过代理访问
```javascript
//author herbert QQ:464884492
 getTicket() {
        return new Promise((resolve, reject) => {
            var ticket = localStorage.getItem("ticket");
            var expires = localStorage.getItem("expires_ticket");
            if (expires > new Date().getTime() - 2000) {
                resolve(ticket);
                return;
            }
            let ticketUrl = "https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=" + localStorage.getItem("accessToken");

            //fetch(ticketUrl, { method: "GET" })
            fetch(this.porxyUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "GET",
                    url: ticketUrl
                })
            }).then(resp => {
                return resp.json()
            }).then(data => {
                if (data.errcode == 0) {
                    //保存本次获取的accessToken
                    localStorage.setItem("ticket", data.ticket);
                    localStorage.setItem("expires_ticket", new Date().getTime() + data.expires_in * 1000);
                    resolve(data.ticket);
                }
            }).catch(data => {
                reject();
            })
        });
    },
```
3. 生成签名
文档地址 https://work.weixin.qq.com/api/doc#90000/90136/90506
需要将参数构造如下格式JSAPITICKET&noncestr=NONCESTR&timestamp=TIMESTAMP&url=URL，然后做SHA1算法获取字符串哈希值。其中NONCESTR是一个随机字符串，URL不能包含#以及后边的部分
```javascript
//author herbert QQ:464884492
   getSignature(timestamp, ticket) {
        let url = window.location.href.split("#")[0];
        let jsapi_ticket = "jsapi_ticket=" + ticket + "&noncestr=" + timestamp + "&timestamp=" + timestamp.substr(0, 10) + "&url=" + url;
        this.printStatuInfo("签名原始信息:" + jsapi_ticket);
        let sha1Str = new jsSHA(decodeURIComponent(jsapi_ticket), "TEXT");
        return sha1Str.getHash("SHA-1", "HEX");
    }
```
4. 初始微信配置信息
根据前边几个步骤获取的参数，初始微信配置信息

```javascript
//author herbert QQ:464884492
 wx.config({
                beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: wxUtils.groupId, // 必填，企业微信的corpID
                timestamp: timestamp.substr(0, 10), // 必填，生成签名的时间戳
                nonceStr: timestamp, // 必填，生成签名的随机串
                signature: sig,// 必填，签名，见附录1
                jsApiList: ["scanQRCode"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
```

5. 调用api
初始完成后，需要立即调用api需要在 wx.ready函数中注册回调函数，如果是不立即调用可以忽略。以下为调用微信扫一扫功能
```javascript
//author herbert QQ:464884492
  wx.scanQRCode({
            desc: 'scanQRCode desc',
            needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                // 回调
                wxUtils.printStatuInfo("扫描信息：" + JSON.stringify(res));
                lblCostTime.innerText = "单次扫码总共花费:【" + (new Date().getTime() - timeStar) + "】ms";
            },
            error: function (res) {
                if (res.errMsg.indexOf('function_not_exist') > 0) {
                    alert('版本过低请升级')
                }
            }
        });
```

三、总结
----
H5集成微信JSSDK功能虽然简单，但是该有的步骤一个都不能少。在最初开发中遇到了以下几个问题：
 1. 获取token与ticket存在跨域问题，需要配置一个代理完成
 2. 有时生成的签名与官方有差别，官方提供了一个测试地址https://work.weixin.qq.com/api/jsapisign

demo地址：https://github.com/464884492/weixin/

