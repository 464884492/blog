##Fetch超时设置和终止请求
###1.基本使用
<P>Fetch 是一个新的端获取资源的接口，用于替换笨重繁琐XMLHttpRequest.它有了Request 和 Response 以及Headers对象的概念，与后端语言请求资源更接近。</p>
+ 一个简单的GET请求
  ```javascript
  fetch('https://www.baidu.com')
          .then(resp=>resp.text())  //  转换成文本对象
          .then(resp=>console.log(resp))  // 输出请求内容
          .catch(error => console.error(error));
  ```     
+ 一个简单的POST请求 
  ```javascript
  fetch('https://www.easy-mock.com/mock/5ca59ba44ba86c23d507bd40/example/getUser',{method:"post"})
          .then(resp=>resp.json())  //转换成Json对象
          .then(resp=>console.log(resp)) //输出Json内容
          .catch(error => console.error(error));
  ```
  更多Fetch相关详细，可查看MDN文档 https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
###2.超时设置
<p>在使用XMLHttpRequest可以设置请求超时时间，可是转用Fetch后，超时时间设置不见了,在网络不可靠的情况下，超时设置往往很有用 </p>
<p>ES6以后Promise 出现解决地狱回调等不优雅的代码风格。个人理解这个更像是一个生产者和消费者的关系，查看 Promise文档，有以下两个方法 </p>
1. Promise.race([promise1,promise2]) 传入多个Promise对象，等待最快对象完成
2. Promise.all([promise1,promise2]) 传入多个Promise 对象，等待所有对象完成
<p>有了以上知识后,结合函数setTimeout就可以实现超时设置</p>
```javascript
//ahutor:herbert qq:464884492
let timeoutPromise = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("我是 timeoutPromise，已经完成了");
        }, timeout);
    });
}
let requestPromise = (url) => {
    return fetch(url);
};
Promise.race([timeoutPromise(1000), requestPromise("https://www.baidu.com")])
    .then(resp => {
        console.log(resp);
    })
    .catch(error => {
        console.log(error);
    });
```
###3.取消请求
<p>将上边的代码拷贝的浏览器控制台并将network设置为Slow3G。运行就会发现，虽然我们在控制台看到了超时信息，但切换到netwok页签中发现请求依然正常进行中，并返回了正确的内容。这并不是我想要的结果，我希望超时时间到了，请求也应该终止。</p>
<p>fetch请求成功后，默认返回一个Response对象，那么我们如何在代码中构造一个这样的对象呢?</p>
```javascript
  timeoutResp=new Response("timeout", { status: 504, statusText: "timeout " })
  successResp=new Response("ok", { status: 200, statusText: "ok " })
```
<p>AbortController 用于手动终止一个或多个DOM请求，通过该对象的AbortSignal注入的Fetch的请求中。所以需要完美实现timeout功能加上这个就对了</p>
```javascript
//ahutor:herbert qq:464884492
let controller = new AbortController();
let signal = controller.signal;

let timeoutPromise = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
            controller.abort();
        }, timeout);
    });
}
let requestPromise = (url) => {
    return fetch(url, {
        signal: signal
    });
};
Promise.race([timeoutPromise(1000), requestPromise("https://www.baidu.com")])
    .then(resp => {
        console.log(resp);
    })
    .catch(error => {
        console.log(error);
    });
```
###4.总结
<p>第一次在项目中使用fetch，在面向API编程的过程中，发现fetch没有超时的设置。第一时间查看了MDN文档以及向搜索引擎找寻实现功能的灵感(copy+c)。有些朋友在settimeout中通过 reject(new Error('网络超时'))实现。其实这样只是让前端感知当前请求超时了，并没有真正终止本次请求。所以必须借助AbortSignal信号对象。此功能目前还处于试验阶段，使用需谨慎。</p>
<p>demo地址 https://github.com/464884492/blog/blob/master/demo/fetch/fetchdemo.js</p>