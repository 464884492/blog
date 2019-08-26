###cocos creator 事件
在做一个消除类游戏时，需要对点击的方块做出响应。代码很简单，可背后的原理还多着呢。
#### 1. 普通节点注册click事件
在cc中如果需要相应click事件，需要为该节点添加一个Button组件。或使用类似效果的事件比如 
1. cc.Node.EventType.MOUSE_DOWN 
2. cc.Node.EventType.TOUCH_END

```javascript
//author herbert qq:464884492
//注册按钮click事件
btn.node.on("click", event=>{cc.log("button click")});
//注册MOUSE_DOWN 
btn.node.on(cc.Node.EventType.MOUSE_DOWN,event=>{cc.log("button MOUSE_DOWN")});
//注册TOUCH_END
btn.node.on(cc.Node.EventType.TOUCH_END,event=>{cc.log("button TOUCH_END")})
```
####2. 应该减少事件注册量
是否没有问题了？在写juqery时，有事件委托（delegate）的概念。啥意思呢，就是在节点的父级注册事件，来响应子节点的事件源。为啥可以实现，主要归功于js事件的两大机制
1.  事件冒泡，事件响应从子节点往上冒泡到顶层节点
2.  事件捕获，事件响应冲顶层节点依次传递到最末级节点

所以问题来了，消除类游戏都是通过预制资源生成不同样式的方块。若在每一方块上都注册事件，势必导致内存上涨（虽然现在内存很大了）。看看cc文档，事件机制完全是一样的（最终都是JS），然而我想在我的Canvas上注册一个**click**事件，问题出现了。

####3.问题来了
问题就是我在Canvas上注册了click事件，点击button时，Canvas 上居然没有收到我的click事件。由此我查看cc源码，写了一堆测试代码，最终得出以下结

1. **click**事件确实Button组件特殊存
2. **click**事件不会向上或向下传递
3. **node.emit**触发事件不会向上或向下传递
4. **node.dispatchEvent**支持事件向上或向下传递
5. 使用**node.dispatchEvent**参数必须是 **cc.Event.EventCustom**对象

####4.click事件特殊在哪里
cc.Button 组件中的click事件，其实是cc的自定义事件，[源码为证](https://github.com/cocos-creator/engine/blob/8bf4522a6d43b53258219983aabd728909ce24ca/cocos2d/core/components/CCButton.js)
```javascript
//author:herbert wx:464884492
...
 this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this);
...
_onTouchEnded (event) {
 if (!this.interactable || !this.enabledInHierarchy) return;
 if (this._pressed) {
 cc.Component.EventHandler.emitEvents(this.clickEvents, event);
 this.node.emit('click', this);//触发事件
 }
 this._pressed = false;
 this._updateState();
 event.stopPropagation(); //停止冒泡
},
...
```
所以，之所Button能响应click事件，是因为组件注册了TOUCH_END事件，并在响应该事件函数中发射一个click事件。
#### 5. javascript 自定义事件
参考mdn文档，js自定事件方式如下
```javascript
// author:herbert wx:464884492
<script text="javascript">
let cusEvent = new Event("custom", {
    bubbles: true //允许冒泡
});
document.body.addEventListener("custom", e => {
    console.log("自定义事件");
    console.log(" Body event by custom");
});

let btn = document.querySelector("#btn");
btn.addEventListener("custom", e => {
    console.log("自定义事件");
    console.log("Button event by custom");
})
btn.dispatchEvent(cusEvent);
</script>
```

#### 5.了解下cc.node.emit
cc.node.emit 最终调用的是CallbacksInvoker.prototype.invoke 方法，从源码来看，是从对应的缓存对象中找到注册的回调方法，依次调用回调函数。
```javascript
//author herbert wx:464884492
CallbacksInvoker.prototype.invoke = function (key, p1, p2, p3, p4, p5) {
var list = this._callbackTable[key];
if (list) {
var rootInvoker = !list.isInvoking;
list.isInvoking = true;
var callbacks = list.callbacks;
var targets = list.targets;
for (var i = 0, len = callbacks.length; i < len; ++i) {
    var callbmhtack = callbacks[i];
    if (callback) {
        var target = targets[i];
        if (target) {
            callback.call(target, p1, p2, p3, p4, p5);
        }
        else {
            callback(p1, p2, p3, p4, p5);
        }
    }
}
if (rootInvoker) {
    list.isInvoking = false;
    if (list.containCanceled) {
        list.purgeCanceled();
    }
}}};
```
所以click自然不会往上或往下传递。
####6.dispatchEvent，事件冒泡
 dispatchEvent 利用自定义事件的 bubbles 属性，实现冒泡。至于为啥使用 `btn.node.dispatchEvent(new cc.Event.EventMouse(cc.Node.EventType.MOUSE_DOWN, true))`没有触发事件是因为cc在底层，将事件类型统一改成了 `cc.Event.MOUSE`，源码为证
```javascript
author:herbert wx:464884492
 ...
 var EventMouse = function (eventType, bubbles) {
 cc.Event.call(this, cc.Event.MOUSE, bubbles);
 ...
};
```

 场景

 ![ 场景布局](https://raw.githubusercontent.com/464884492/blog/master/demo/ccevent/scene.png)
 
 运行效果
 
![测试结果](https://raw.githubusercontent.com/464884492/blog/master/demo/ccevent/prevevent.png)

#### 7.总结
做开发，不管是开发游戏还是其他应用程序。思路基本是一样的。再简单的事，多想想，再发散一下，你会收获更多。
需要进cocos游戏开发群的朋友，请添加我微信回复**cocos**
![微信群](https://raw.githubusercontent.com/464884492/blog/master/images/group.jpg)
欢迎感兴趣的朋友关注我的订阅号“小院不小”，或点击下方二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中。如需本文demo请在订阅号中回复**ccevent**
![订阅号](https://raw.githubusercontent.com/464884492/blog/master/images/dyh.jpg)
