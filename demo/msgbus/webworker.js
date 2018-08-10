// 1:启动webSocket
var root = this;
var wsMethod = (function () {
    var socket = null;

    function connect(wsurl) {
        if ('WebSocket' in root) {
            socket = new WebSocket(wsurl);
        } else if ('MozWebSocket' in root) {
            socket = new MozWebSocket(wsurl);
        } else {
            alert("您的浏览器版本过低，将不能接收系统消息");
        }
    }
    function onOpen() {
        postMessage({ code: "openConnect" });
    }
    function onClose() {
        postMessage({ code: "closewsconnect" });
    }
    function onMessaage(event) {
        debugger;
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
        socket.onopen = onOpen;
        socket.onclose = onClose;
        socket.onmessage = onMessaage;
        socket.onerror = onError;
    }
    return {
        initWsConnect: function (url, userId, sessionId) {
            connect(url + "/" + userId + "/" + sessionId);
            initMessageEvent();
        },
        sendMessage: sendMessage
    }
})();

onmessage = function (event) {
    if (event.data.code) {
        var code = event.data.code.toLowerCase();
        switch (code) {
            case "init":
                var userId = event.data.loggedUserId;
                var sessionId = event.data.sessionid;
                postMessage({ code: "initws", msg: "正在连接websocket" });
                postMessage({ code: "codeone", msg: "Webwork:你好，组件1" });
                postMessage({ code: "codetwo", msg: "Webwork:你好，组件2" });
                var url = "ws://localhost:8090/demo/demowebsocket";
                wsMethod.initWsConnect(url, userId, sessionId);
                break;
            case "sendmsg":
                wsMethod.sendMessage(JSON.stringify(event.data.data));
                break;
            default:
                break;
        }
    }
}

work.onmessage = function (event) {
    var data = event.data;
    if (!!data.code) {
        if (data.code == "close") {
            work.terminate();
        }
    }
};
work.postMessage({
    code: "init",
    loggedUserId: 'demo',
    sessionid: 'demo'
});