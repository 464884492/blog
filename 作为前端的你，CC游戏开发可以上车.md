作为前端的你，CC游戏开发可以上车
====
1. 初来乍到
--
<p>打开 Cocos Creator 点击新建空白项目，在默认布局的左下区域，一个黄黄assets文件夹映入眼帘。作为前端的你对这个文件是不是再熟悉不过了。是的，和你想象的一样，开发游戏中所有资源，脚本都会放置到该文件。</p>
2. 初步探索
--
<p>项目建立好以后，对各区域的功能大致了解下，作为前端的你，主要还是要迅速的掌握cc提供的各种NB的功能。所以，还得赶紧打开 [官网](https://docs.cocos.com/creator/manual/zh/) 快速浏览一遍。官网也写得很好，提供中文和英文，对于英文能力不好的伙伴来说，简直是不能太好了。是不是找到了当初学习Vue的感觉。作为前端的你，整天写了一堆业务控制，处理各种布局，各种兼容，对奇怪的css优先级搞得云里雾里的。所以是时候换一个更有意思开发场景，给自己做个游戏解闷多好</p>
<p>cc是一个跨平台框架，一端编译多端发布。想想前端的 mpvue taro uni-app，无不是解决此类问题，再加上gulp,webpack,再来一堆node_modules,啥less sass  stylus.各种环境配置那是相当的复杂。所以业界流传，前端已经进入深水区，真的一点不假。 然而cc依然可以让你舒适的写JS或者TS ,并且没有繁杂的配置，一键搞定打包发布。</p>
3. 小试牛刀
--
<p>上边说了一大堆，其实并没有什么鸟用。在官网首页中，给开发者提供了个完整坑爹的游戏《摘星星》，如果打包到微信小游戏，需要横屏，不太友好。本着举一反三的求学态度，我利用此场景，换了一个游戏玩法。开发了自己第一款小游戏《坦克侠》，当然也很坑爹</p>
<p>游戏开发主要是确定游戏规则，我新改编的玩法就是在星空中随机生成不同数量的星星，并一直往下掉落，我的主角坦克必须在星星掉落前接住。丢失一颗星星生命减一，生命为0游戏结束。当然我们主角每收集一颗星星，根据当前的难度会添加一定的分数。累计到一定的分数，又可以给主角添加一点生命值</p>
<p>在官网  [下载初始项目](https://github.com/cocos-creator/tutorial-first-game/releases/download/v2.0/start_project.zip) 下载一个基础项目，该项目中只有一些项目基本图片和声音。接下来，我们需要建立场景，制作预制资源，添加控制脚本，编译发布微信小游戏，[快速开始](https://docs.cocos.com/creator/manual/zh/getting-started/quick-start.html) </p>

<p>制作一个游戏场景，与官网不同的是，我将Canvas的Size属性，在属性检查器中设置为 288 x 512 ，并且勾选了 Fit Height以及 Fit Width 用以适应同的手机屏幕。然后拖动背景图片到层级管理器中，并在场景编辑器中设置背景Size属性，使其等于Canvas的Size属性。然后依次在层级管理器中新建三个Label控件，依次拖动到背景图片左上角和右上角，用以记录生命值，当前分数，以及最高分数。接着在场景中间添加一个Label控件和一个Button按钮用于显示游戏结束和开始游戏。在场景底部拖动放置我们的主角坦克。所以最新场景的效果应该是如下显示的那样</p>
![小程序码](https://raw.githubusercontent.com/464884492/blog/master/images/ccgame.png)   ![场景预览](https://raw.githubusercontent.com/464884492/blog/master/images/ccgame_sence.png)    ![微信群](https://raw.githubusercontent.com/464884492/blog/master/images/ccgame_group.png)
 4. 一顿操作猛如虎
--
<p>游戏场景设计，看似酷炫，无非就是拖拖拖。依稀找到了当年C#开发winform的感觉，随便搞整一下，一个界面就出来了。所以导致很多人开发winform，webform很简单，很傻瓜，其实不是的。重要的还是后边的业务逻辑，解决方案，这些都是超越语言之上的东西。所以cc的场景编辑，就不多说了，直接分析我们游戏实现逻辑。开始之前我们先初始一下typescript开发环境，操作如下图</p>
<center>![typescript|center](https://raw.githubusercontent.com/464884492/blog/master/images/ccgame_ts.png)</center>
依次点击安装vs code 扩展插件，添加 Typescript项目配置。接下来就要编写脚本了，所有还是有必要了解下cc脚本的生命周期
1. onLoad  **首次**激活时触发，一般做一些初始化操作。对比Vue我觉得最合适的应该是beforeMount回调
2. start      **首次**激活时触发，一般初始化一些中间状态的数据，改方法在onLoad之后，在第一次update之前，对比Vue自然应该是mounted回调
3. update  该回调会**频繁**调用，每一帧调用一次。对比Vue应该是beforeUpdate回调,虽然他们性质不一样
4. lateUpdate 该回调会**频繁**调用，也是每帧调用一次，对比Vue应该updated回调
5. onDestroy  根据**条件**调用，当组件调用了自身的 destroy()方法，会触发此回调 
6. onEnable 根据**条件**调用， enabled 属性从 false 变为 true 或 active 属性从 false 变为 true 触发此回调
7. onDisable 根据**条件**调用， enabled 属性从 true 变为 false 或active 属性从 true 变为 false触发此回调
4.1 让主角动起来
--
<p>做过前端的你一定知道，要想拖动一个DIV，一定是在Body中监听鼠标的移动事件。在移动端一定是监听触摸移动事件。是的，在cc里边做游戏，希望一个组件动起来依然是这么操作的，那么cc里边是如何注册事件的呢？两个方式，一个在场景编辑器下角的属性中添加脚本里边的方法，另外一种就是直接在脚本里边添加。当然我推荐第二种。虽然IDE会帮我们生成很多代码，如果不自己写一遍，就永远不晓得数据流向。就像当年开发winform时，很多人拖动一个按钮控件，然后双击控件，IDE就自动帮你注册好了一个用户点击事件。殊不知，IDE是在xx.design.cs中通过代码替你注册好的。所以既然刚开始学，一定要了解清楚它的原理。</p>

*  cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this) 注册一个系统事件 ，支持按键事件和重力感应事件
*  this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this) 在某个节点注册一个Node 支持的事件类型

<p>所以，主角移动无非实在TouchMove时改自己的X/Y</p>
```javascript
 // author:herbert qq:464884492 
 onTouchMove(e: cc.Event.EventTouch) {
        let deltaX = e.getDeltaX(); //获取本次和上次移动的增量
        let deltaY = e.getDeltaY();
        //左移
        if (deltaX < 0 && this.node.x <= this.leftMinX) return;
        if (deltaX > 0 && this.node.x >= this.rightMaxX) return;
        if (deltaY > 0 && this.node.y >= this.topMaxY) return;
        if (deltaY < 0 && this.node.y <= this.bottomMinY) return;
        this.node.x += deltaX;
        this.node.y += deltaY;
    }
```
4.2 生成坑爹的星星
--
<p>在cc里边需要重复生成的对象，我们一般会制作成一个预制资源。然后在基本中通过代码实例化。何为预制资源，就权当它是一个模板吧。现在生成我们第一颗小星星</p>
```javascript
// author:herbert qq:464884492
buildOneStar() {
        let star = cc.instantiate(this.starPrefab);
        this.node.addChild(star);
         return star;
    }
```
 <p>是的，就是这么简单，有没有class.newInstance()的感觉，当然这个只是在场景的默认位置生成了一个星星而已。我们需要更多的信息，位置肯定也不是默认位置，所以还得继续码代码</p>
```javascript
 // author:herbert qq:464884492
   buildRandomStar() {
        let tempX = 0;
        let tempY = 0;
        tempX = Math.floor(this.starMaxX - Math.random() * this.starMaxX);//生成一个不大于MaxX的坐标
        tempY = Math.floor(this.starMaxY - Math.random() * this.starMaxY);
        if (Math.random() < 0.5) tempX = tempX * -1;
        let star = this.buildOneStar();
        star.setPosition(tempX, tempY);
        star.zIndex = this.tank.zIndex - 1;
        star.name = "star";
        star.getComponent("Star").index = this;
    }
```
 <p>这样感觉好多了，可以生成很多星星了，不过，我们的星星也得往下掉才行，作为前端的你首先想到的是不是更新星星的Y值，是的，我就是这么做的。利用生命周期中start方法,定义一个从上往最小Y运动的动画。后来才了解到所有的游戏引擎都有物理特性，开启了自己就掉下来了。不过原理肯定还是改变y值。何况这么简单的游戏完全没必要使用</p>
```javascript
    start() {
        // 定义一个Action
        let downAction = cc.moveTo(this.index.starFallSpeed, this.node.x, this.minY - 60);
        downAction.easing(cc.easeSineOut());
        this.node.runAction(downAction);
    }
```
4.3 是时候接住星星了
--
<p>只要是游戏少不了做碰撞检测，如果在CC中开启了物理引擎还好，直接跟星星和主角添加一个刚体就好了，不过我们没开启，那就自己来了。不过碰撞检测无非就是判断两个区域有没有重叠地方，简单判断就上下左右，左上右上左下右下八个点。不过我这里偷了个懒，直接判断星星和主角间向量的距离。</p>
```javascript
    //author:herbert qq:464884492
    ...
    let distance = this.node.position.sub(this.tank.getPosition()).mag();
    if (distance < (this.tank.width / 2 - 5)) {
      console.log("接住了");
    }
    ...
```
4.4 来点刺激的
--
<p>游戏嘛，总不能一成不变那多没意思，所以随着时间的推移我们的调整点难度。我这个游戏难度无非就一下两个方面</p>
1. 生成星星的速度加快
2. 星星掉落的速度加快
```javascript
//author:herbert qq:464884492
...
    this.index.scoreNum += this.index.starScoreSpeed;
            this.index.score.string = "得分:" + this.index.scoreNum;
            // 降落速度加
            if (Math.floor(this.index.scoreNum / 100) == this.index.starScoreSpeed - 4 && this.index.starFallSpeed > 1) {
                this.index.starFallSpeed -= 0.2; //下降速度加快
                if (this.index.starBuildTimeOut > 200) {
                    this.index.starBuildTimeOut -= 100; //生成速度加快
                }
                this.index.lifeNum += 1;
                if (this.index.starScoreSpeed < 10) {
                    this.index.starScoreSpeed += 1;
                }
            }
            cc.audioEngine.play(this.index.scoreClip, false, 0.2);
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1)
            this.node.destroy();
...
```
4.5 是时候结束了
--
<p>游戏嘛，也不能一直玩下去。不然多没挑战。自从调整游戏难度后我的最高分重来就没有超过4000.</p>
```javascript
//author:herbert qq:464884492
...
 if (this.node.y <= this.minY) {
            this.index.lifeNum -= 1;
            this.index.life.string = "生命:" + this.index.lifeNum;
            this.node.destroy();
            this.index.allStars.splice(this.index.allStars.indexOf(this.node), 1)
            if (this.index.lifeNum <= 0) {
                this.index.gameOver.node.active = true;
                this.index.btnPlay.node.active = true;
                this.index.starIsRunning = false;
                let storageValue = cc.sys.localStorage.getItem(this.index.HIGHSTORAGEKEY);
                if (storageValue && parseInt(storageValue) > this.index.scoreNum) {
                    return;
                }
                cc.sys.localStorage.setItem(this.index.HIGHSTORAGEKEY, this.index.scoreNum);
                this.index.highScore.string = "最高分:" + this.index.scoreNum;
            }
        }
...
```

5. 来点实际的
--
<p>做技术嘛，大多都是 Talk is cheap,Show me your code.做点总结吧</p>
* [开源地址](https://github.com/464884492/blog/tree/master/demo/firstgame) 
* 在基本中定义的属性，切记在编辑器中拖动绑定
* 多看官网api，多开实例代码
* 发布微信小游戏一定不要有英文，会导致审核不通过


