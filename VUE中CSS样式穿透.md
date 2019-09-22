### VUE中CSS样式穿透
#### 1. 问题由来

在做两款H5的APP项目，前期采用微信官方推荐的weui组件库。后来因呈现的效果不理想，组件不丰富，最终项目完成后全部升级采用了有赞开发的`vant`组件库。同时将webpack顺利从3升级到4（项目结构 webpack+vue+vue-store+vue-router+vant+less）。相信好多做TOB的开发朋友都会选择顺手组件库。组件库内置了很多样式，方便了我们开发者，同时又因高度封装，有时也会给我们带来一点点困扰。比如，在使用`vant`组件库中的*环形进度条*时，查看官方文档，有改变*进度条颜色*，有改*变轨道颜色*，也有改变*填充颜色*。就是没有改变显示文字颜色的。凑巧的是，我们的需求就是要改变*文字颜色*。怎么办呢？写个css不就好了么。

#### 2. 编写样式

为了说明情况，我为本文专门配合了一个测试demo。假如您现在也已经初始化好了一个Vue项目，并引入了我们需要的vant组件库。接下来，我们在components文件夹中新建一个CssScope.vue的单文件组件。基本代码如下：

```javascript
<template>
<div><van-circle v-model="currentRate" :rate="90" :speed="100" :text="text" /></div>
</template>
<style lang="less" scoped>
</style>
<script>...</script>
```

编译运行，我们在浏览器就会看到一个进度为90%的环形进度条。当然显示文字**90%**显示是黑色，现在我们就来改变它。
最初我们想到，文字颜色color是可以从父级继承的，所以我们在Style标签中写下如下css样式：

```less
<style lang="less" scoped>
.van-circle{color:blue;}
</style>
```
回到浏览器，文字颜色没变。通过Chrome的开者工具，找到我们的圆形进度条。才发现，原来，这个组件内部是一个svg 和 div 标签组成，svg用于显示我们图形，div用于显示文字。并且在这个div上存在一个class 为 van-circle__text。根据css优先级，我们刚在父级设置的字体颜色无效。找到原因，那就好办了。我们需要在Style标签中定义这个class选择器，并设置它字体颜色为蓝色。于是我们删除刚写的样式，改写为如下：

```less
<style lang="less" scoped>
.van-circle{
	.van-circle__text{olor:blue;}
}
</style>
```
这下应该可以了，可回到浏览器，效果依旧。黑色，还是黑色。此时，回到chrome，在开发者工具找到我们的元素。仔细的你才发现，显示文字的标签和它的父级好像不一样，少个`data-v-xxx`的属性。也许是style的 scoped搞鬼，那我们就去掉。回到浏览器，文字颜色居然改变了。欢喜之余，总感觉哪里不对？我们得查查这个水鬼`scoped`

#### 3. Style中的 Scoped神奇效果

我们的项目采用`Less`作为CSS 预处理语言。在组件中习惯于使用一个带有scoped属性的Style标签，scoped 属性的效果，就是在编译打包后，在当前组件能一眼看到的标签中统一添加一个随机的属性（下图 data-v-97a9747e）如下图所示：

![生成的dom](https://github.com/464884492/blog/blob/master/images/vuescoped/vuescoped1.png?raw=true)
 
 编译的css也会对于加上那个随机属性
 
![生成的dom](https://github.com/464884492/blog/blob/master/images/vuescoped/vuescopedStyle2.png?raw=true)
 
 我们再在回到解决问题的那里，我们去掉了`scoped`后，Style标签里边的样式变成全局的了，这可不是我们想要的结果。不生效的原因，通过以上两图，已经一目了然。我们得穿透一下。怎么办?找文档?记得在vue-loader中找。

#### 4.  深度作用选择器

从官方文档了解到，我们所谓的穿透，官方叫做深度选择器。怎么用的呢 ?就是在我们想穿透的选择器前边添加 >>> 或者 /deep/  或者 ::v-deep。官方还说>>>可能存在问题，建议用后两者，我们用的less，就选择 /deep/ 好了，于是我们加回刚在style中删除的scoped属性，并修改为如下代码：

```less
<style lang="less" scoped>
.van-circle {
  /deep/ .van-circle__text {
    color: blue;
  }
}
</style>
```

回到浏览器，颜色改变，大功告成。不过，我们还是得仔细检查检查，再次找到生成的css，如下图所示：

![生成的dom](https://github.com/464884492/blog/blob/master/images/vuescoped/vuescopestyle4.png?raw=true)

 对，没毛病,是我们要的结果。

#### 4. 总结

写代码，查问题，得找对路径。用别人的东西，就多看看对应官方文档。

欢迎感兴趣的朋友关注我的微信订阅号"小院不小"，或者点击下方的二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中。需要**本文demo**可以在公众号中回复**vuescoped**

![微信关注【小院不小】](https://github.com/464884492/blog/blob/master/images/dyh.jpg?raw=true)

闲来无事，采用cocos creator开发了一个小游戏，感兴趣的朋友一个可以来玩玩

![小游戏坦克侠](https://github.com/464884492/blog/blob/master/images/ccgame.png?raw=true)