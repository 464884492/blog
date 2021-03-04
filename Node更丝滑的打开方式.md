### Node更丝滑的打开方式

#### 1. 使用背景

最近前端的一个项目，使用gulp作为工程化。在运行过程中出现如下错误
`gulp[3192]: src\node_contextify.cc:628: Assertion `args[1]->IsString()' failed.`
经过搜索得到回复表明，是当前电脑安装的Node版本(14.x)太高了需要降级到(10.x)版本。需要卸载再安装对应的版本，但是当我这个工程不再使用，想切回高的版本又得卸载再安装，很是麻烦。当时就继续深挖了一下，居然有人开发node版本管理这样的小工具。经过下载安装使用，果然很给力。

#### 2. nvm管理node版本

首先从[https://github.com/coreybutler/nvm-windows/releases]下载nvm工具。官方提供了安装版已经免安装版。建议使用安装版简化手动配置环境变量过程。**安装nvm过程之前，请确保当前电脑中经卸载了已安装的Node**.根据提示一步步操作即可。根据我测试结果，有以下两个建议

+ nvm安装路径最好修改一下，不使用默认地址
+ nodejs链接文件使用默认值

安装完成后，首先到你安装目录中找到 **settings.txt** 文件，在该文件中添加以下两行配置

```text
//公众号:小院不小 vx:464884492
node_mirror: https://npm.taobao.org/mirrors/node/
npm_mirror: https://npm.taobao.org/mirrors/npm/
```
接下来，运行一个命令窗口。输入命令`nvm version`检查是否安装成功。如果没有显示版本号，请检查:

+ 环境变量中是否存在`NVM_HOME NVM_SYMLINK`
+ 检查`PATH`变量中是否添加nvm的运行路径

一切就绪以后，就可以开始安装任意版本的Node。我们已安装node10为示范

1. 输入命令`nvm install 10`,工具会自动给下载nodejs 10.0.0版本
2. 输入命令`nvm list`,工具会显示当前系统中所有安装的nodejs版本
3. 输入命令`nvm use 10`,工具自动将当前系统node版本切换的10.0.0版本
4. 输入命令`node -v`,检测node是否切换成功

重复以上几个步骤，我们就可以实现node版本的任意切换

#### 3. nrm管理npm仓库地址

有node的地方就有npm。由于npm标准仓库地址访问不稳定，所以我们需要切换到国内的镜像地址。在没有使用nrm工具前，我们通过如下命令实现

```bat
 rem 公众号:小院不小 vx:464884492
 npm config set registry http://registry.npm.taobao.org/
```
如果公司存在npm私服地址，在多个地址间切换很容易出错，所以有必要引入nrm来管理所有的镜像地址。在安装nrm之前，有必要将npm全局路径自定到我们容易找到路径下。依次在命令窗口执行以下两条命令

```bat
rem 公众号:小院不小 vx:464884492
npm config set cache "D:\nodejs\npm-cache"
npm config set prefix "D:\nodejs\npm_global"
```

接下来输入命令`npm install -g nrm`安装nrm.安装完成后输入命令`nrm ls`,得到如下结果

```bat
  npm -------- https://registry.npmjs.org/
  yarn ------- https://registry.yarnpkg.com/
  cnpm ------- http://r.cnpmjs.org/
* taobao ----- https://registry.npm.taobao.org/
  nj --------- https://registry.nodejitsu.com/
  npmMirror -- https://skimdb.npmjs.com/registry/
  edunpm ----- http://registry.enpmjs.org/
```
可以看到nrm已经将常用的镜像地址存储起来了，现在只需通过命令`nrm use taobao`就可以将npm镜像地址切换到淘宝的镜像库

如果公司搭建了npm私服可以，假设私服地址为 `http://192.168.225.19:4874/`,可以依次执行以下命令切换到公司私服地址

```bat
rem 公众号:小院不小 vx:464884492
nrm add company http://192.168.225.19:4874/
nrm use company
```

#### 4. 总结

以上两个工具，很轻巧也很方便。是前端人员以及node开发必备佳品。想了解更多干货请关注公众号[**小院不小**]，这里可以学习还可以玩游戏[**地心侠士**]

![公众号](./images/gzh.png)
