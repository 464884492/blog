### cocosCreator定制小游戏构建模板

#### 1. 解决痛点

在开发微信小游戏过程中,需要在微信小游戏game.json加入一个配置键**navigateToMiniProgramAppIdList**,但常规通过构建发布game.json都是自动生成的,根本就不给你配置的机会.但如果不解决,需要在每次发布后,手动的在build目录中找到game.json文件,手动添加配置.或者复制一个配置好的文件,每次构建完成后,就复制覆盖.总之,很麻烦!

通过常规构建发布生成的game.json文件

```json
{
  "deviceOrientation": "portrait",
  "networkTimeout": {
    "request": 5000,
    "connectSocket": 5000,
    "uploadFile": 5000,
    "downloadFile": 5000
  },
  "subpackages": []
}
```
我期望生成的game.json文件

```json
{
  "author":"wx:464884492 回复 cocos 加群",
  "deviceOrientation": "portrait",
  "navigateToMiniProgramAppIdList": [
    "需要跳转的小程序appid"
  ],
  "networkTimeout": {
    "request": 5000,
    "connectSocket": 5000,
    "uploadFile": 5000,
    "downloadFile": 5000
  },
  "subpackages": []
}
```

#### 2. 项目中builder.json文件

在项目setting文件夹中,有一个builder.json文件.按照正常逻辑它应该和构建相关.凑巧的是在里边刚好还有一个**wechatgame**的配置对象.在没查阅文档的情况下,凭直觉在这个加入我需要的配置

```json
...
  "wechatgame": {
    "author":"wx:464884492 回复 cocos 加群",
    "REMOTE_SERVER_ROOT": "",
    "navigateToMiniProgramAppIdList": ["需要跳转小程序appid"],
    "appid": "当前项目appid",
    "orientation": "portrait",
    "separate_engine": false,
    "subContext": ""
  }
...
```
一溜烟操作后,赶紧构建发布.可最终的结果是添加的配置并没有如愿的添加到game.json文件中.可这问题必须要解决,不生效,我也很绝望啊.

#### 3. 构建模板

绝望又怎样,还是要解决问题.日常百度,查文档.功夫不负有心人,在官网找到了[定制项目构建流程](https://docs.cocos.com/creator/manual/zh/publish/custom-project-build-template.html).可是看了这个文档.一脸懵逼.虽然找到了方向,可是这文档说的也抽象了.我实在不能理解,我最终的构建模板该是个什么样子的.左思右想,不添加自定义模板也可以完成构建.说明,在编辑器安装目录中也有具体的构建模板,我复制过来就得了.

果不其然,在项目安装目录找到构建模板 *C:\Program Files (x86)\CocosCreator\resources\builtin\weapp-adapter* 里边刚好有一个*wechatgame*.解放我双手的稻草居然是你.于是乎我根据官网的提示,在我项目目录里边建立一个名为*build-templates*文本夹,然后把找到的*wechatgame*文件夹复制过来.我仿佛看到胜利的曙光了,赶紧构建发布.是的,并没有出现问题.可是,当我打开微信开发者工具时,在控制台输出一大串嘲讽红色的错误信息.好吧,感觉又失败了.

#### 4. 借鸡下蛋

不慌,要冷静,仔细观察生成的文件结构和模板中的文件结构,仅仅只是多了*res*和*src*两个文件夹.于是大胆假设,放弃从安装目录去拷贝模板文件,直接从默认构建发布的文件去复制就得了.所以,先将项目文件中build-templates文件改个名字,重新构建发布.然后再去build目录中复制除了*res*和*src*之外的所有文件.然后再模板文件中的game.json文件中添加自定义配置**navigateToMiniProgramAppIdList**,再次构建发布,打开微信开发者工具.这次终于成功.

#### 5. 总结

知识虽小,重在积累.2020注定是不平凡的一年.加油!!

欢迎感兴趣的朋友关注我的订阅号“小院不小”，或点击下方二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中
![订阅号](https://images.cnblogs.com/cnblogs_com/yfrs/1583406/o_dyh.jpg)
