##WebWorker与WebSocket实现前端消息总线

  Web Worker让JS有了多线程的能力，可以将复杂耗时的操作都交付给Worker线程处理。WebSocket让web端与服务端维持一个有效的长连接，实现服务端主动推送数据。将二者一结合，业务系统信息流转通知功能完全就可以剥离出来。

架构图
----
![Alt text](https://github.com/464884492/blog/blob/master/images/msgbus1.png)

JS Worker
----
Worker工作在一个专用的作用域`DedicatedWorkerGlobalScope`,在这个作用域中，不能直接操作DOM节点，不能使用`Window`对象的默认方法和属性。不过对于网络的访问是完全没有问题的。[具体能使用那些对象和方法请点击这里查看](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

从上图中可明显的看出，Worker在当前架构中实现一个桥梁的左右，上连接socket端中的数据，下负责分发socket中的数据。此处我们先了解下Worker本身的功能实现。
1. 主线程与Worker线程通过方法`postMessage`相互传递信息
2. 主线程与Worker线程通过事件`onmessage`接收相互传递的消息
3. Worker中引入第三方js使用方法`importScripts([url,])`
4. 主线程调用`worker.terminate()`结束线程
5. Worker线程通过调用`this.close()`结束自身线程

新建一个`webworker.js`文件，并在其中编写如下代码

```javascript
//author:herbert qq:464884492
onmessage = function (event) {
    if (event.data.code) {
        var code = event.data.code.toLowerCase();
        switch (code) {
            case "init":
                var userId = event.data.loggedUserId;
                var sessionId = event.data.sessionid;
                if (!sessionId) {
                    this.close();
                    return;
                }
                postMessage({ code: "codeone", msg: "你好，组件1" });
                postMessage({ code: "codetwo", msg: "你好，组件2" });
                break;
            default:
                break;
        }
    }
}
```
> 注意:在 onmessage 前不能加**var**否则在**IE**下会接收不了消息。IE真是让人充满挫败感的浏览器

新建一个index.html页面，在script块中编写以下代码，实现与webworker.js通讯
```javascript
//author:herbert qq:464884492
var work = new Worker('webworker.js')
    , textone = document.querySelector("#textone")
    , textTwo = document.querySelector("#texttwo")
      textAll = document.querySelector("#textAll");

work.onmessage = function (event) {
    var data = event.data;
    if (!!data.code) {
        switch (data.code) {
            case "close":
                work.terminate();
            case "codeone":
                textone.value = textone.value + JSON.stringify(data) + "\r\n";
                textAll.value = textAll.value + JSON.stringify(data) + "\r\n";
                break;
            case "codetwo":
                textTwo.value = textTwo.value + JSON.stringify(data) + "\r\n";
                textAll.value = textAll.value + JSON.stringify(data) + "\r\n";
                break;
            default:
                textAll.value = textAll.value + JSON.stringify(data) + "\r\n";
        }
    }
};
work.postMessage({
    code: "init",
    loggedUserId: 'demo',
    sessionid: 'demo'
});
```

JS WebSocket
----

WebSocket和Http一样都是基于Tcp协议。不同是WebSocket实现了服务端与客户端的全双工通讯。在Websocket未出现之前，要是实现一个信息推送的功能，通过http来实现唯一方案就是轮训，轮训分长短，各有弊端。现在WebSocket一出现，一切都好办了。

接下来我们开始建立一个WebSocket连接
>  **方法中的root表示当前作用域，在主线程是root=window，在WebWorker线程root=DedicatedWorkerGlobalScope**
```javascript
    //author:herbert qq:464884492
    var root = this,socket =null;
    function connect(wsurl) {
        if ('WebSocket' in root) {
            socket = new WebSocket(wsurl);
        } else if ('MozWebSocket' in root) {
            socket = new MozWebSocket(wsurl);
        } else {
            alert("您的浏览器版本过低，将不能接收系统消息");
        }
    }
```
wsurl格式为` ws:\\` 或者 `wss:\\`,后者表示SSL加密传输。实际地址如：  `ws://localhost:8090/demo/demowebsocket`
接下来，我们需要为socket处理事件，负责接收服务端推送的消息
```javascript
   //author:herbert qq:464884492
   function onOpen() {
        postMessage({ code: "openConnect" });
    }
    function onClose() {
        postMessage({ code: "closewsconnect" });
    }
    function onMessaage(event) {
        postMessage(JSON.parse(event.data));
    }
    function onError(event) {
        socket = null;
        if (event.target.readyState == 3) {
            //断线重连
            setTimeout(function () {
                connect(event.target.url);
                initMessageEvent();
            }, 1000);
        }
    }
    function sendMessage(msg) {
        if (socket == null) return;
        socket.send(msg);
    }
 function initMessageEvent() {
        socket.onopen = onOpen; //socket连接成功处理事件
        socket.onclose = onClose; //socket连接关闭处理事件
        socket.onmessage = onMessaage; //socket接收到新消息
        socket.onerror = onError; //soket错误处理事件
    }
```

JAVA WebSocket
----
Tomcat7x已经实现了标准WebScoket接口，在项目中只需要编写一个普通的实体bean配置注解就可以实现一个标准的WebSocket Api。开发中主要使用一些注解
+ @ServerEndpoint 设置WebSocket连接地址，以及url参数
  如: @ServerEndpoint(value = "/demowebsocket/{userId}/{sessionId}"),其中{userId}、{sessionId} 为`pathParam`可以在onOpen函数中通过函数参数 @PathParam 获取
+ @PathParam 获取URL地址上对应的注解参数
+ @OnOpen 建立连接注解
+ @OnClose  关闭连接注解
+ @OnMessage 接收消息注解
+ @OnError 错误注解

被注解约束的函数都可以任意选择需要的参数，可选择的参数有 Session、EndpointConfig 以及 @PathParam, 服务端Bean代码如下
```java
//author:herbert qq:464884492
@ServerEndpoint(value = "/demowebsocket/{userId}/{sessionId}")
public class DemoWebSokcet {
	private static final Set<DemoWebSokcet> connections = new CopyOnWriteArraySet<DemoWebSokcet>();
	private Session session;
	public DemoWebSokcet() {
	}

	@OnOpen
	public void openConnection(Session session, EndpointConfig conf,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		this.session = session;
		connections.add(this);
		JSONObject jo = new JSONObject();
		jo.put("code", "newuser");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", "server：新连接用户");
		sendMessage(jo);

		// 测试 代码
		JSONObject jo1 = new JSONObject();
		jo1.put("code", "codeone");
		jo1.put("userid", userId);
		jo1.put("sessionid", sessionId);
		jo1.put("msg", "Server：组件1你好");
		sendMessage(jo1);

		JSONObject jo2 = new JSONObject();
		jo2.put("code", "codetwo");
		jo2.put("userid", userId);
		jo2.put("sessionid", sessionId);
		jo2.put("msg", "server：组件2你好");
		sendMessage(jo2);
	}

	@OnClose
	public void closeConnection(@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		connections.remove(this);
		JSONObject jo = new JSONObject();
		jo.put("code", "connectionClose");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", "server:连接关闭");
		sendMessage(jo);
	}

	// 处理文本消息
	@OnMessage
	public void handleTextMsg(Session session, String message,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		System.out.println("userId=>" + userId + " sessionId=>" + sessionId);
		// 原样转发客户端消息
		sendMessage(JSONObject.parseObject(message));
	}

	// 处理二进制消息
	@OnMessage
	public void handleBinaryMsg(Session session, ByteBuffer msg,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {

	}

	// 处理pong消息
	@OnMessage
	public void handlePongMsg(Session session, PongMessage msg,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		JSONObject jo = new JSONObject();
		jo.put("code", "pong");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", msg.getApplicationData().toString());
		sendMessage(jo);
	}

	@OnError
	public void onError(Throwable t, @PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) throws Throwable {
		JSONObject jo = new JSONObject();
		jo.put("code", "servererror");
		jo.put("userid", userId);
		jo.put("sessionid", userId);
		jo.put("msg", t.getMessage());
		sendMessage(jo);
	}

	private static void sendMessage(JSONObject msg) {
		for (DemoWebSokcet client : connections) {
			try {
				synchronized (client) {
					client.session.getBasicRemote()
							.sendText(msg.toJSONString());
				}
			} catch (IOException e) {
				JSONObject jo = new JSONObject();
				jo.put("code", "servererror");
				jo.put("userid",
						client.session.getPathParameters().get("userid"));
				jo.put("sessionid",
						client.session.getPathParameters().get("sessionid"));
				connections.remove(client);
				try {
					client.session.close();
				} catch (IOException e1) {
				}

				jo.put("msg", "server：发送消息出现异常，连接已关闭" + e.getMessage());
				sendMessage(jo);
			}
		}
	}
}
```
在测试代码编写过程中，通过pom方式引入javax.websocket-api,启动后始终出现 `Error during WebSocket handshake: Unexpected response code: 404`连接错误，后来通过直接件tomcat/bin下对应的tomcat实现的jar复制到webapp对应的bin文件夹下解决问题。

Demo预览
---
![Alt text](https://github.com/464884492/blog/blob/master/images/msgbus2.png)

总结
----
篇幅比较长，读到这里也不容易！WebWorker和WebSocket我也是第一次将二者结合起来。柑橘现在javascript功能真的是越来越丰富了。[demo地址](https://github.com/464884492/blog/tree/master/demo/msgbus)，还有一点感悟，对于开发中的新知识点，首先你得学会怎么用，其次在通过阅读源码，以及理论知识让你使用的更顺利，甚至改变它。