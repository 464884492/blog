#### Cocos Creator 中 _worldMatrix 到底是什么(下)

#### 1. 摘要

[上篇](https://mp.weixin.qq.com/s/dPyt2Mn6M0xZpVe6uAntwA)介绍了矩阵的基本知识以及对应图形变换矩阵推倒。[中篇](https://mp.weixin.qq.com/s/ssu_sZBEGk65NpNB03kT5A)具体介介绍了对应矩阵转换成cocos creator代码的过程。这篇我们将通过一个具体的实例来验证我们上篇和中篇的结果。

#### 2. 场景准备

新建一个cocos项目，在层级管理器Canvas下依次完成以下节点建立。

1. 新建一个Sprite(单色)节点并设置大小为100,100黄色背景,取名matrixReference
2. 新建一个Sprine(单色)节点并设置大小为100,100浅蓝色背景，取名matrix
3. 在matrix节点下新建一个空节点，取名center。然后在属性检查器中添加Graphics组件，并设置Stroke Color 为蓝色 
4. 回到Canvas，新建一个空节点，取名line。然后在属性检查器中添加Graphisc组件，并设置Stroke Color为白色

脚本文件准备。在资源管理器scripts文件夹下，新建脚本 matrix.ts 和 line.ts。matrix.ts用来完成矩阵的验证操作。line.ts用来绘画一个平面的xy坐标系。

#### 3. 绘制平面坐标系 

利用Graphic画笔功能，分别沿水平方向和垂直方向绘制长度100的两条直线。然后在轴的正方向绘制一个三角形箭头。绘制代码如下

```javascript
start() {
let g = this.getComponent(cc.Graphics);
//  y轴
g.moveTo(0, -100);
g.lineTo(0, 100);
g.lineTo(-10, 80);
g.lineTo(10, 80);
g.lineTo(0, 100);
// x 轴
g.moveTo(-100, 0);
g.lineTo(100, 0);

g.lineTo(80, -10);
g.lineTo(80, 10);
g.lineTo(100, 0);
g.stroke();
}
```
将此用户组件分别绑定到节点line和center下，完成后刷新浏览器我们会看到如下界面

![初始图片](https://github.com/464884492/blog/blob/master/images/matrix/demo_0.png?raw=true)

从上图可知，cocos creator 中层级覆盖方式是下覆盖上。所目前只能看浅蓝色的方块以及白色线条的坐标系。

#### 4. 测试代码准备

验证cocos creator 对应节点变换的矩阵信息，需要通过输出当前节点的本地矩阵和世界矩阵，以及当前节点设置信息，和父级节点的设置信息。所以我们在matrix.ts中先创建一个log函数用于输出当前节点各种属性状态值。代码如下：

```javascript
log(title) {
console.log(`---${title}---`);
let wm = cc.mat4();
this.node.getWorldMatrix(wm);
console.log("---1. [世界坐标矩阵]---");
console.log(wm.toString());

let lm = cc.mat4();
this.node.getLocalMatrix(lm);
console.log("---2. [本地坐标矩阵]---");
console.log(lm.toString());

console.log("---3. [当前各属性状态]---");

console.log(`
   1. position: ${this.node.position.toString()}
   2. scale: ${this.node.scale.toString()}
   3. angle: ${this.node.angle}
   4. skewX: ${this.node.skewX}
   5. skewY: ${this.node.skewY}
   6. width: ${this.node.width}
   7. height: ${this.node.height}
   8. parentWidth: ${this.node.parent.width}
   9. parentHeight: ${this.node.parent.height}`)

console.log("---4. [锚点角(0,0)坐标信息]---")
let wordVec = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
let localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
console.log(`原点的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);

console.log("---5. [右上角(50,50)坐标信息]---")
wordVec = this.node.convertToWorldSpaceAR(cc.v2(50, 50));
localVec = this.node.parent.convertToNodeSpaceAR(wordVec);
console.log(`右上角的世界坐标:${wordVec.toString()}  本地坐标: ${localVec.toString()}`);
}
````
将matrix.ts以用户组件的方式添加到matrix节点。然后回到matrix.ts脚本当中，并在start方法中添加如下代码

```javascript
start() {
  this.log("初始状态");
}
```
编译运行，刷新浏览器，我们就可以在Console控制台中，看到如下信息

```text
------------------初始状态-------------------
---1. [世界坐标矩阵]---
[
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
480, 320, 0, 1
]
---2. [本地坐标矩阵]---
[
1, 0, 0, 0,
0, 1, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
]
---3. [当前各属性状态]---
1. position: (0.00, 0.00, 0.00)
2. scale: 1
3. angle: 0
4. skewX: 0
5. skewY: 0
6. width: 100
7. height: 100
8. parentWidth: 960
9. parentHeight: 640
---4. [锚点角(0,0)坐标信息]---
原点的世界坐标:(480.00, 320.00)  本地坐标: (0.00, 0.00)
---5. [右上角(50,50)坐标信息]---
右上角的世界坐标:(530.00, 370.00)  本地坐标: (50.00, 50.00)
```
从输出结果可知，当前节点的世界坐标，只有m12和m13有值分别是480和320。然后我们Canvas的宽高分别是960和460，锚点分别是0.5和0.5，此结果就已经说明了平移矩阵。当前节点本地坐标矩阵为单位矩阵，其他属性都保持默认值。这里有必要仔细看看输出的第4和第五。分别输出了当前节点原点位置和右上角的世界坐标和本地坐标。从世界坐标可知，右上角的坐标为原点实际坐标加上50（锚点0.5）480+50=530 。也符合预期。

#### 5. 旋转30度

在start中添加代码

```javascript
start() {
  this.log("初始状态");
  this.node.angle = 30;
  this.log("1. 旋转30°");
  this.node.rotation=30;
  this.log("2. 旋转30°");
}
```
在代码中使用了两次旋转分别使用`angle`以及`rotation` 前者默认逆时针方向后者默认顺时针方向。也许目前您可能会认为逆时针旋转30°，然后再顺时针旋转30°，刚好回到0°位置。其实不是的，cocos 中矩阵的更新是通过最后的状态值确定的。图像最终表现为顺时针旋转30°。在最初构思这部分内容时，想更清晰展示矩阵在游戏开发中的魔力。计划是通过属性的方式将图形变形，然后直接改变node私有变量_matrix给变回去，就泡汤了。以上代码图形的最终结果如下

![旋转30°](https://github.com/464884492/blog/blob/master/images/matrix/demo_1.png?raw=true)

回到控制台，输出的日志信息如下

```text
------------------旋转30°-------------------
---1. [世界坐标矩阵]---
[
0.8660254037844387, -0.49999999999999994, 0, 0,
0.49999999999999994, 0.8660254037844387, 0, 0,
0, 0, 1, 0,
480, 320, 0, 1
]
---2. [本地坐标矩阵]---
[
0.8660254037844387, -0.49999999999999994, 0, 0,
0.49999999999999994, 0.8660254037844387, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
]
---3. [当前各属性状态]---
1. position: (0.00, 0.00, 0.00)
2. scale: 1
3. angle: -30
4. skewX: 0
5. skewY: 0
6. width: 100
7. height: 100
8. parentWidth: 960
9. parentHeight: 640
---4. [锚点角(0,0)坐标信息]---
原点的世界坐标:(480.00, 320.00)  本地坐标: (0.00, 0.00)
---5. [右上角(50,50)坐标信息]---
右上角的世界坐标:(548.30, 338.30)  本地坐标: (68.30, 18.30)
```
以上输出中 `math.sin(math.PI/6)=0.499,math.cos(math.PI/6)=0.866`,最终使用的`rotation`所有需要注意负号。从当前属性的状态中也`angle=-30`也说明了问题。本地坐标矩阵和世界坐标矩阵结果也符合推导结果。我们这里在看看右上角(50,50)的坐标变成了(68.30,18.30)，我们通过结果矩阵来推导下这个坐标值，由于cocos creator中Mat4中 toString方法做了转置，所有需要使用点乘本地坐标矩阵，即

$$
 \left[
 \begin{matrix}
   x_1\\y_1\\z_1\\1
 \end{matrix}
 \right]^T=
\left[
  \begin{matrix}
    50\\50\\0\\1
  \end{matrix}
\right]^T\times
\left[
  \begin{matrix}
0.8660254037844387& -0.49999999999999994& 0& 0\\
0.49999999999999994& 0.8660254037844387& 0& 0\\
0& 0& 1& 0\\
0& 0& 0& 1
  \end{matrix}
\right]
$$

 根据矩阵公式可知

 $$
 x_1=50*0.8660254037844387+50*0.49999999999999994\approx68.30\\
 y_1=50*(-0.49999999999999994)+50*0.8660254037844387\approx18.30\\
 $$

 #### 6. 分别沿x轴和y轴方向倾斜30°

 修改start中代码为如下

 ```javascript
start() {
  this.log("初始状态");
  this.node.angle = 30;
  this.log("旋转30°");
  this.node.rotation = 30;
  this.log("旋转30°");
  this.node.skewX = 30;
  this.node.skewY = 30;
  this.log("XY倾斜30°");
}
 ```
 重新编译，您将在浏览器看到倾斜后的图形，显示如下

 ![XY倾斜30°](https://github.com/464884492/blog/blob/master/images/matrix/demo_2.png?raw=true)

 回到控制台，输出日志如下

 ```text
 ------------------XY倾斜30°-------------------
---1. [世界坐标矩阵]---
[
1.1547005383792515, 5.551115123125783e-17, 0, 0,
1, 0.577350269189626, 0, 0,
0, 0, 1, 0,
480, 320, 0, 1
]
---2. [本地坐标矩阵]---
[
1.1547005383792515, 5.551115123125783e-17, 0, 0,
1, 0.577350269189626, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
]
---3. [当前各属性状态]---
1. position: (0.00, 0.00, 0.00)
2. scale: 1
3. angle: -30
4. skewX: 30
5. skewY: 30
6. width: 100
7. height: 100
8. parentWidth: 960
9. parentHeight: 640
---4. [锚点角(0,0)坐标信息]---
原点的世界坐标:(480.00, 320.00)  本地坐标: (0.00, 0.00)
---5. [右上角(50,50)坐标信息]---
右上角的世界坐标:(587.74, 348.87)  本地坐标: (107.74, 28.87)
 ```
 说明,**在js中一个很小的值就认为是0**，针对输出结果做一下简单推导,由于旋转和倾斜都是30度所有，我们用s c t 分别代表sin(30) cos(30) tan(30) 所以当前输出的复合矩阵P有以下关系

 $$
 P=\left[
  \begin{matrix}
   1&t\\t&1
  \end{matrix}
 \right]\times\left[
   \begin{matrix}
     c&-s\\s&c
   \end{matrix}
   \right]=\left[
     \begin{matrix}
      c+ \frac{s^2}{c}&0\\s+s&c+ \frac{-s^2}{c} 
     \end{matrix}
     \right]
 $$
 
 依次带入求值便可得到以上输出结果。

  #### 7. 将图形缩放0.5倍

  继续修改start方法里边的代码，改动如下

  ```javascript
start() {
  this.log("初始状态");
  this.node.angle = 30;
  this.log("旋转30°");
  this.node.rotation = 30;
  this.log("旋转30°");
  this.node.skewX = 30;
  this.node.skewY = 30;
  this.log("XY倾斜30°");
  this.node.scale = 0.5;
  this.log("缩小50%");
}
  ```
 重新编译，您将在浏览器看到缩小后的图形，显示如下

 ![缩小50%](https://github.com/464884492/blog/blob/master/images/matrix/demo_3.png?raw=true)

 回到控制台，输出日志如下

```text
------------------缩小50%-------------------
---1. [世界坐标矩阵]---
[
0.5773502691896257, 2.7755575615628914e-17, 0, 0,
0.5, 0.288675134594813, 0, 0,
0, 0, 1, 0,
480, 320, 0, 1
]
---2. [本地坐标矩阵]---
[
0.5773502691896257, 2.7755575615628914e-17, 0, 0,
0.5, 0.288675134594813, 0, 0,
0, 0, 1, 0,
0, 0, 0, 1
]
---3. [当前各属性状态]---
1. position: (0.00, 0.00, 0.00)
2. scale: 0.5
3. angle: -30
4. skewX: 30
5. skewY: 30
6. width: 100
7. height: 100
8. parentWidth: 960
9. parentHeight: 640
---4. [锚点角(0,0)坐标信息]---
原点的世界坐标:(480.00, 320.00)  本地坐标: (0.00, 0.00)
---5. [右上角(50,50)坐标信息]---
右上角的世界坐标:(533.87, 334.43)  本地坐标: (53.87, 14.43)
```
针对缩放相对简单，输出结果矩阵每项直接乘以缩放比列0.5可得

#### 8. 将图形向右上方平移10px

 继续修改start方法里边的代码，改动如下

  ```javascript
   start() {
     this.log("初始状态");
     this.node.angle = 30;
     this.log("旋转30°");
     this.node.rotation = 30;
     this.log("旋转30°");
     this.node.skewX = 30;
     this.node.skewY = 30;
     this.log("XY倾斜30°");
     this.node.scale = 0.5;
     this.log("缩小50%");
     this.node.setPosition(10, 10);
     this.log("平移(10,10)");
   }
  ```
 重新编译，您将在浏览器看到平移后的图形，显示如下

 ![缩小50%](https://github.com/464884492/blog/blob/master/images/matrix/demo_4.png?raw=true)

 回到控制台，输出日志如下

 ```text
 ------------------平移(10,10)-------------------
---1. [世界坐标矩阵]---
[
0.5773502691896257, 2.7755575615628914e-17, 0, 0,
0.5, 0.288675134594813, 0, 0,
0, 0, 1, 0,
490, 330, 0, 1
]
---2. [本地坐标矩阵]---
[
0.5773502691896257, 2.7755575615628914e-17, 0, 0,
0.5, 0.288675134594813, 0, 0,
0, 0, 1, 0,
10, 10, 0, 1
]
---3. [当前各属性状态]---
1. position: (10.00, 10.00, 0.00)
2. scale: 0.5
3. angle: -30
4. skewX: 30
5. skewY: 30
6. width: 100
7. height: 100
8. parentWidth: 960
9. parentHeight: 640
---4. [锚点角(0,0)坐标信息]---
原点的世界坐标:(490.00, 330.00)  本地坐标: (10.00, 10.00)
---5. [右上角(50,50)坐标信息]---
右上角的世界坐标:(543.87, 344.43)  本地坐标: (63.87, 24.43)
 ```
 对比输出结果可知，平移对a b c d并无影响。仅仅是将m12和m13的值分别加上(x,y)方向的平移量。从输出4和5可知，平移改变了原点的位置。

 #### 9. 总结

游戏中的matrix，欧拉角，四元素，复数。这些基础知识在学习时不知其有何用。当真实使用起来时，才发现其中的奥秘。技术这块路，不一定要追新。往往原理性的东西，那些伟人早都研究透彻了。这三篇文章，从计划到完成预计2月时间。确实很多基础知识需要补充。当然，其中肯定有理解不对的地方，如有发现，希望热心的同行，能加我wx反馈。在此先谢谢了

 原创欢迎感兴趣的朋友关注我的微信订阅号"小院不小"，或者点击下方的二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中。需要**本文demo**可以在公众号中回复**matrix**

![微信关注【小院不小】](https://github.com/464884492/blog/blob/master/images/dyh.jpg?raw=true)

维护了一个Coscos Creator 的游戏开发群，欢迎喜欢聊技术的朋友加入

![微信群](https://raw.githubusercontent.com/464884492/blog/master/images/group.jpg)

闲来无事，采用cocos creator开发了一个小游戏【坦克侠】，感兴趣的朋友一个可以来玩玩

![小游戏坦克侠](https://github.com/464884492/blog/blob/master/images/ccgame.png?raw=true)
