#### Cocos Creator 中 _worldMatrix 到底是什么(中)

####  1.    中篇摘要

在[上篇](https://mp.weixin.qq.com/s/dPyt2Mn6M0xZpVe6uAntwA)中主要做了三件事
+ 简单表述了矩阵的基本知识，以及需要涉及到的三角函数知识
+ 推导了图形变换中 位移 、旋转、缩放 对应的变换矩阵。
+ cocos creator 中矩阵存储方式

在本篇中我们将运用推导的变换矩阵，一一验证代码中更新节点变换矩阵的代码背后的逻辑。游戏场景中的节点都成树形的父子关系。当前节点 worldMatrix是通过父级节点对应的矩阵获取，所以当前场景中只有一个节点时，当前节点的  worldMatrix 应该与localMatrix相同（未测试）。所以这里就通过分析 updateLocalMatrix 来了解。

cocos creator 中图形变换采用标记脏数据方式告知渲染流需要更新变换矩阵。采用位运算存储当前需要更新的变换信息。updateLocalMatrix 方法代码行数比较长，也为了方便分析，所以会将代码块拆分。如想整体浏览此代码块，请下载v2.1.3版本的cocos creator。对应的代码在安装文件 \resources\engine\cocos2d\core\CCNode.js 

#### 2. updateLocalMatrix函数整体逻辑

从如下代码就可以论证我上边说明的变换过程，判断脏值，有更新无返回。判断是否有图形变换，有更新无返回。这里有必要说明下位运算是如何做到存储多值的。

设某选择题存在ABC三个选项，正确选项为AC。我们设ABC的权值分别是  A=001 B=010  C=100 ，AC的权值 AC=A|B = 101。此时若用户选择 B，程序只需要将 AC & B > 0 就知道是否正确。代码中就刚好利用这一点，在节点变换过程中，不断改变存在变换 localMatDirty 的值。

```javascript
// author:herbert 公众号:小院不小
_updateLocalMatrix() {
    let dirtyFlag = this._localMatDirty;
    if (!dirtyFlag) return;
    let t = this._matrix;
    if (dirtyFlag & (LocalDirtyFlag.RT | LocalDirtyFlag.SKEW)) {
      // 旋转 缩放 倾斜
    }
    t.m12 = this._position.x;
    t.m13 = this._position.y;
    this._localMatDirty = 0;
    this._worldMatDirty = true;
}
```

代码中`(LocalDirtyFlag.RT | LocalDirtyFlag.SKEW)` LocalDirtyFlag.RT=LocalDirtyFlag.POSITION | LocalDirtyFlag.SCALE | LocalDirtyFlag.ROTATION  所以代码中if 判断是当前变换中是否存在 位置 、缩放 、旋转、倾斜。虽然判断了位置，并没有放到if代码块中设置，也许还有其他什么变换导致位置变换。最后就是还原标记，以及告诉渲染流得更新worldMatrix了。

#### 3. 旋转 缩放 倾斜代码逻辑

矩阵的乘法是不满足交换律，即 AB <> BA  所以体现在代码中就是判断旋转和倾斜还在设置缩放的原因。复合变换的顺序会影响最终节点的位置。此部分代码逻辑如下

```javascript
// author:herbert 公众号:小院不小
if (dirtyFlag & (LocalDirtyFlag.RT | LocalDirtyFlag.SKEW)) {
    let rotation = -this._eulerAngles.z;
    let hasSkew = this._skewX || this._skewY;
    let sx = this._scale.x, sy = this._scale.y;
    if (rotation || hasSkew) {
       // 旋转 倾斜
    }
    else {
        t.m00 = sx;
        t.m01 = 0;
        t.m04 = 0;
        t.m05 = sy;
    }
}
```

代码中，没有旋转或倾斜信息，就只剩下缩放。那么当前矩阵就是缩放矩阵，只需要把矩阵对角线上的值依次设置成sx sy。`let rotation = -this._eulerAngles.z;`取负值是因为，rotation 顺时针为正，然后欧拉角中，逆时针为正。取z轴旋转角，是因为2d中旋转轴就是z轴。

#### 4. 存在旋转倾斜代码逻辑

从代码中可知，如果存在复合变换。cocos creator 变换顺序为，旋转->缩放->倾斜->位移。这里有两个需要注意地方

+ 传入的旋转角度需要转换成弧度。不经常用math.cos math.sin 可能不知道这些函数的参数是弧度值
+ Math.sin(Math.PI/6)不等于0.5是因为浮点数的原因

```javascript
// author:herbert 公众号:小院不小 wx:464884492
if (rotation || hasSkew) {
    let a = 1, b = 0, c = 0, d = 1;
    // rotation
    if (rotation) {
        let rotationRadians = rotation * ONE_DEGREE;
        c = Math.sin(rotationRadians);
        d = Math.cos(rotationRadians);
        a = d;
        b = -c;
    }
    // scale
    t.m00 = a *= sx;
    t.m01 = b *= sx;
    t.m04 = c *= sy;
    t.m05 = d *= sy;
    // skew
    if (hasSkew) {
      // 倾斜
    }
}
```

代码中将旋转矩阵分块，只提取左上角的四项，得出具体的分块矩阵A为。A此时就应该等于选择矩阵，即 a=cos(b) b=sin(b) c=-sin(b) d=cos(b).从上篇中我们推导旋转矩阵是逆时针旋转推倒。然后代码中rotation为了符合使用习惯是顺时针的。所有对应的旋转矩阵应该乘以-1；

$$
A= \left[
  \begin{matrix}
cos(b)&-sin(b)\\
sin(b)&cos(b)\\
 \end{matrix}
  \right]
  =>-1\times
  \left[
  \begin{matrix}
cos(b)&sin(b)\\
-sin(b)&cos(b)\\
 \end{matrix}
  \right]
  =
  \left[
  \begin{matrix}
  a&c\\
  b&d\\
  \end{matrix}
  \right]
  $$

由于cos是偶函数，sin是奇函数，将-1带入矩阵得到
a=cos(b) b=-sin(b) c=sin(b) d=cos(b);接下来处理缩放，将缩放矩阵右乘（cocos  中复合变换矩阵，是左乘还是右乘，没有明确的地方说明。此处是通过代码反推可能有误）变化后的矩阵，如下图所示

$$
\left[
\begin{matrix}
a&c\\
b&d\\
\end{matrix}
\right]
=
\left[
\begin{matrix}
a&c\\
b&d\\
\end{matrix}
\right] \times \left[
\begin{matrix}
sx&0\\
0&sy\\
\end{matrix}
\right]
$$

根据矩阵乘法规则(行乘列)可知
  a=a*sx   b=b*sx   c=c*sy    d= d*sy 

#### 5. 倾斜代码逻辑

倾斜其实是两个变换，X轴倾斜和Y轴倾斜。在上篇推导中，得到对应变换矩阵。同上边一样也只取左上角的的分块矩阵A.其中

$$
Askx=\left[
\begin{matrix}
1&tan(a)\\
0&1\\
\end{matrix}
\right],
Asky=\left[
\begin{matrix}
1&0\\
tan(a)&1\\
\end{matrix}
\right]
$$

```javascript
// author:herbert 公众号:小院不小 wx:464884492
if (hasSkew) {
let a = t.m00, b = t.m01, c = t.m04, d = t.m05;
let skx = Math.tan(this._skewX * ONE_DEGREE);
let sky = Math.tan(this._skewY * ONE_DEGREE);
if (skx === Infinity)
    skx = 99999999;
if (sky === Infinity)
    sky = 99999999;
t.m00 = a + c * sky;
t.m01 = b + d * sky;
t.m04 = c + a * skx;
t.m05 = d + b * skx;
}
```
由于 tan(90)趋近无穷大，当计算值为Infinity skx 和 sky 分别做一个值限定。接下来看代码对应的矩阵变换。首先先从y到x的顺序，将Asky和Askx相乘得到一个复合矩阵。再左乘当前变换矩阵p，为了和前边对照，依然采用a b c d

$$
\left[
\begin{matrix}
m00&m04\\
m01&m05
\end{matrix}
\right]
=\left[
\begin{matrix}
a&c\\
b&d
\end{matrix}
\right]\times\left[
\begin{matrix}
1&0\\
sky&1\\
\end{matrix}
\right]\times\left[
\begin{matrix}
1&skx\\
0&1\\
\end{matrix}
\right]
$$

矩阵乘法满足结合率，先将右边的两个矩阵相乘

$$
\left[
\begin{matrix}
m00&m04\\
m01&m05
\end{matrix}
\right]
=\left[
\begin{matrix}
a&c\\
b&d
\end{matrix}
\right]\times\left[
\begin{matrix}
1&skx\\
sky&1\\
\end{matrix}
\right]
$$

所以通过矩阵乘法规则得到新的值
m00=a+c\*sky      m04=c+a\*skx
m01=d+b\*sky     m05=d+b\*skx

#### 6. 总结

中篇相对于上篇，中间间隔了一个多月的时间，原创实属不易。这期间一直在恶补图形学和矩阵相关知识。最初分析版本2.0.10,当时代码中存在rotationX rotationY 旋转，当rotationX 和rotationY  不相等时，一直卡在那段代码的分析过程中。后来还去官方论坛提问 https://forum.cocos.com/t/topic/84680/4 ，没有得到满意的结果，也没多少人回复。后来各种查资料，才发现官方将那段代码移除了，采用欧拉角的方式。所有我将本地版本升级成v2.1.3版本。到这个版本后，又卡在了  let rotation = **-**this.\_eulerAngles.z这个**负**号问题。越分析越，感觉欠缺的越多，欧拉角，四元数。同时感觉可能写不出中篇了，不过我还是找了一个感觉是对的推导将中篇完成了。当然其中我觉得不清楚的地方还有

+ 在2.0.10 版本中Y轴旋转和X轴选中问题，为啥可以根据Z轴旋转的结果一分为二
+ 在2.1.3 版本中旋转取欧拉角z负号问题，旋转矩阵 b c 值相互取反问题
+ 复合矩阵变换左乘右乘问题，在本文中我通过代码推导应该是左乘
+ 倾斜变换Asky和Askx两个居中相乘顺序问题，本文通过y右乘x得到代码结果

欢迎感兴趣的朋友关注我的微信订阅号"小院不小"，或者点击下方的二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中。需要**本文demo**可以在公众号中回复**matrix**

![微信关注【小院不小】](https://github.com/464884492/blog/blob/master/images/dyh.jpg?raw=true)

维护了一个Coscos Creator 的游戏开发群，欢迎喜欢聊技术的朋友加入

![微信群](https://raw.githubusercontent.com/464884492/blog/master/images/group.jpg)

闲来无事，采用cocos creator开发了一个小游戏【坦克侠】，感兴趣的朋友一个可以来玩玩

![小游戏坦克侠](https://github.com/464884492/blog/blob/master/images/ccgame.png?raw=true)

