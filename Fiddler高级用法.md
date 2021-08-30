## Fiddler高级用法

### 1. 简单用法

Fiddler作为一个基于http协议的抓包工具，一直在业界有广泛使用。很多测试或者前端在使用Fiddler时，仅仅用于查看前端和服务端之间的请求信息。包括我作为一个Fiddler的重度使用者，除了简单抓包分析外，最多也只是使用它的`Composer`功能，用来构建一个`POST`或者`GET`请求。总的来说，一般使用Fildder一般是使用以下几个功能

1. 抓包分析
2. 通过配置代理，抓移动端请求信息
3. 使用Composer快速测试后端接口

然而功能强大且方便扩展的Fiddler远远不止这个简单的用法。

### 2. 高级用法--乱码处理

前端开发中，调用后端一个接口。接口能正常访问，就是中文出现乱码。

![乱码](images/fiddler/charset.jpg)

从图中左侧可以看到，不管是浏览器，还是在开发者工具中。后端返回的内容，都是乱码。并且乱码的内容还不同。从图中右侧，一般中文乱码的现象描述可以知道

* 浏览器乱码原因推测是 **以GBK的编码方式读取UTF8编码的中文**
* 开发者工具乱码原因推测是 **以IOS8859-1的方式读取UTF8编码的中文** 

然而我后端接口代码刚好，只设置了响应内容是编码方式是UTF8，但并没有告诉浏览器。从显示结果来看，浏览器跟随系统默认编码猜测是**GBK**，而开发者工具默认编码猜测是**IOS8859-1**.为什么是猜测，因为，**现在的chrome浏览器，实在找不到设置编码的地方**，如果有知道的朋友，还麻烦留言告诉一下。

```java
  //author:herbert 公众号:小院不小 Date:20210501 
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String key = request.getParameter("key");
		String userName = request.getParameter("u");
		String password = request.getParameter("p");
		JSONObject user = findUserByNameAndPwd(userName, password);
		JSONObject ret = new JSONObject();
		if (user == null) {
			ret.put("errcode", 99);
			ret.put("errmsg", "未找到用户信息");
			response.setCharacterEncoding("utf8");// 正常设置应该是设置Content-type
			response.getWriter().print(ret.toJSONString());
			return;
		}
    .....
 }
```
由于后端代码没有加，但又必须马上解决。这个时候Fildder就派上用场了。

#### 2.1 Fiddler断点

在Fiddler左下角，有一行黑色的输入框。官方称之为**QuickExec**.在这里可以输入一些命令。比如我们现在要修改响应内容，就需要命令 **bpafter**

![bpafer](images/fiddler/bpafter.jpg)

在这里我们输入`bpafter weixin-server/weixinbind` 回车。然后会在状态栏看到这样一句话，**RsponseURI breakpoint for weixin-server/weixinbind**就表示启动成功了。这是我们在浏览器，重新访问这个链接，再回到Fildder会看到这样一个界面

![bpafterdebug](images/fiddler/bpafterDebug.jpg)

在响应的页签中，我们选择**raw**页签，在Date下一样我们添加如下请求头`Content-Type: text/html;charset=utf-8`然后点击绿色的**Run to Completion** 按钮,回到浏览器。这时乱码就不在了

![rightCharset](images/fiddler/rightChartSet.png)

#### 2.2 Fiddler规则

聪明细心的一定发现了，使用**bpater**针对每次请求都需要手动添加header信息。能不能通过程序自动添加呢？答案是肯定的。
在Fiddler菜单中，选择Rules->Customize Rules...，弹出Fiddler的脚本编辑器。在脚本的**OnBeforeResponse**方法中添加如下代码

```javascript
 //author:herbert 公众号:小院不小 Date:20210501 
 ...
if (oSession.url.indexOf("weixinbind")>-1) {
oSession.oResponse.headers.Add("Customize","add by Script")  
oSession.oResponse.headers.Add("Content-Type","text/html;charset=utf-8")  
}	
 ...
```
保存后退出，然后在状态栏看到**CustomRules.js was loaded at 时间**就表示我们当前修改的脚本已经生效了。回到浏览器重新访问改地址

![rightCharsetByScript](images/fiddler/rightCharsetByScript.png)

### 3. 高级用法--跨域处理

构建跨域环境，我们在本地80端口下，添加index.html文件。文件内容如下

```html
<!--author:herbert 公众号:小院不小 Date:20210501 -->
<html lang="en">
<body>
   <p id="content"></p>
</body>

<script>
  window.onload = async function () {
     let resutData = await fetch("http://localhost:8080/weixin-server/weixinbind?u=1&p=2")
    let jsonData = await resutData.json();
    console.log(jsonData)
    document.querySelector("#content").textContent = JSON.stringify(jsonData)
  }
</script>
</html>
```

从代码中可以知道，访问了一个8080端口的GET请求。如果这个接口后端没有返回允许跨域标志，我们将请求不了数据。我们在浏览器会看到如下错误信息

![cros](images/fiddler/cors.jpg)

这时，在后端不改代码的情况下，我们通过fiddler一样可以实现跨域请求。
在Fiddler菜单中，选择Rules->Customize Rules...，弹出Fiddler的脚本编辑器。在脚本的**OnBeforeResponse**方法中添加如下代码

```javascript
 //author:herbert 公众号:小院不小 Date:20210501 
if(oSession.host== "localhost:8080"){
  oSession.oResponse.headers.Add("Customize","CROS add by Script");
  oSession.oResponse.headers.Add("Content-Type","application/json;charset=utf-8")  
  oSession.oResponse.headers.Add("Access-Control-Allow-Origin","*");
}
```
保存退出后，刷新页面你会发现数据已经请求成功了.

![corsSuccess](images/fiddler/crossuccess.jpg)


### 4. 高级用法--响应替换

修改线上内容，这个功能可想象的空间很大，可做的事情很多。为了说明他强大之处，我们依然上边的index.html说明。不过现在我们需要新建一个index2.html页面，具体内容如下

```html
<!--author:herbert 公众号:小院不小 Date:20210501 -->
<html lang="en">
<body>
   <p id="content"></p>
</body>

<script>
  window.onload = async function () {
    alert("警告！！！您的代码被修改啦")
    let resutData = await fetch("http://localhost:8080/weixin-server/weixinbind?u=1&p=2")
    let jsonData = await resutData.json();
    console.log(jsonData)
    document.querySelector("#content").textContent = JSON.stringify(jsonData)
  }
</script>

</html>
```
这个文件仅仅是多加了一段代码`alert("警告！！！您的代码被修改啦")`,现在我们来实现访问index.html页面时，实际返回的index2.html的内容

在右侧找**AutoResponse**标签，点击添加规则，如下图设置

![autoresponse](images/fiddler/autoresponse.jpg)

保存好以后，刷新刚才的index.html页面，你会看到如下结果

![autoresponsesuccess](images/fiddler/autoresponsesuccess.jpg)

这里除了修改`HTML`页面外，还可以修改`css` `js`甚至`ajax`请求.这样可操作性就很多了，比如对别人的网站搞点小破坏啥的。特别是那些充分相信前端数据的网站，特别危险。
当然除了做响应替换外，还有其他很多命令，如用 ***delay:1000**实现延迟1秒响应，用于测试弱网环境

### 5. Fiddler4频繁弹出代理变化

在很长一段时间，一直使用Fiddler2，每次打开都提示我升级，每次我都拒绝了。可是最近一次我升级了，问题就出现了。

![proxyChanged](images/fiddler/proxychanged.jpg)

抓包过程中出现了一条黄色的提示信息**The system proxy was changed. click to reeable capturing**.只要一出现这个信息，就不能愉快抓包了。后边从官方博客了解到改变代理服务最多可能有以下两个原因

* 防火墙改变代理
* VPN软件改变代理

所以该怎么解决呢？这里有两个方法可以试下

#### 5.1 重新启用代理

在前边内容中，我们多次使用了自定义规则。这里我们一样可以通过自定义规则实现。
首先找到脚本的`main`方法,在里边注册一个事件

```javascript
// author:herbert 公众号:小院不小 Date:20210502
...
static function Main(){
  FiddlerObject.log("注册函数DoReattach")
  FiddlerApplication.oProxy.add_DetachedUnexpectedly(DoReattach);
  var today: Date = new Date();
  FiddlerObject.StatusText = " CustomRules.js was loaded at: " + today;
}
....   
```

然后添加我们注册的方法`DoReattach`

```javascript
// author:herbert 公众号:小院不小 Date:20210502
static function DoReattach(o: Object, ea: EventArgs){
  FiddlerObject.log("DoReattach")
  ScheduledTasks.ScheduleWork("reattach", 1000, innerReattach);
}

static function innerReattach(){
  FiddlerObject.log("innerReattach")
  FiddlerApplication.UI.actAttachProxy();
}

static function OnRetire(){
  FiddlerObject.log("执行函数OnRetire")
  FiddlerApplication.oProxy.remove_DetachedUnexpectedly(DoReattach);
}
```
这里主要是通过检测到代理异常关闭时，启动一个任务，重新启动代理。就相当于程序帮我们完成了点击操作

#### 5.2 从源头解决

细心聪明的你，也许又发现了，上边的方法虽然解决了问题，但并不完美。会造成丢失某些请求。因为这里延迟了1秒重新启动代理。如果这个时间段刚好有一个请求过来，肯定就抓不到这个包。所以，还需要从源头抓起

首选关闭防火墙，如果确定已经关闭，但是问题还没有解决。这个时候就得检查你最近有没有安装vpn软件了。网上很多资料，都是让我们删除vpn的软件，这种杀鸡取卵的方式我是不敢苟同的。

其实我们只需要找到vpn相关的服务，然后关掉就可以了。这里不得不强调一下**不要认为vpn没有运行就Ok，其实Vpn软件安装好以后，会在系统驻留服务，并开机启动**。我们使用win+R启动运行窗口，输入`service.msc`回车，进入服务管理。按状态排序，让正在运行服务排列在最前边。然后一个个看是否有VPN相关文字介绍。这里没有搜索功能，比较麻烦。在我的电脑找到两个vpn相关的服务

![SangforCSClient](images/fiddler/sanvpn.jpg)

![Dell](images/fiddler/vpn.jpg)

这两个vpn工具，刚好都是我使用过的。选择停止这些服务，再回到Fildder工具，就再也么有出现那个黄色的警告条了。

彩蛋来了。附送一个小知识

在查找哪个程序修改了代理，我们可以使用ProcessMonitor工具。比如我们需要了解谁修改了我们代理，就可以添加如下两个过滤器实现

 ```
 author:herbert 公众号:小院不小 Date:20210502

 Operation  is RegSetValue
 Path is HKCU\Software\Microsoft\Windows\CurrentVersion\InternetSettings\ProxyEnable
 Path is HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ProxyServer
 ```
 
 如下图所示

 ![processMonitorFilter](images/fiddler/processMonitorFilter.jpg)

这样筛选以后，回到主界面，观察对应的额结果

![processMonitorList](images/fiddler/processMonitorList.jpg)

从列表中结果中我们可了解到，除了Fiddler外还有其他程序在修改注册表`ProxyEnable`对应的值.

* 20:27:50 这个时间段，是我启动Fiddler出现的结果。ProxyEnable变化 1->0->1,ProxyServer维持为127.0.0.1:8888
* 20:28:09 这个时间段，是Fidder出现那个黄色警告框出现的结果 ProxyEnable变化 1->0->1->0,ProxyServer维持为127.0.0.1:8888

所以，最终`ProxyEnable`变成`0`了，就无法启动代理了。点击最后一条`ProxyEnable`为`0`的数据，查看明细，如下图

![processMonitorDetail](images/fiddler/processMonitorDetail.jpg)

我对比`ProxyEnable`为`1`的那条数据，无论是**进程id还是堆栈信息**，都是一样的。所以我严重怀疑，这是**Fiddler4的一个BUG**。因为同样的环境，运行**Fidder2**并不会出现上边的那种情况。

### 6. 总结

Fiddler这个软件基于插件的开发模式，可以扩展出很多功能。这个工具平时自己经常使用，很多时候只是抓个包发个请求而已。这次深挖了一下，主要是开发过程chrome开发者工具请求的中文出现了乱码。然而后端的代码又是我没权限修改的。所以就动了Fiddler的心思。这次就不放什么demo了。还是希望您多多支持下，写作不易。如果觉得还有点意思，您扫描下方的二维码,关注公众号[**小院不小**]，这里是我记录的技术地方，一直坚持原创，一直坚持是工作所积累。所以不会天天发文。

![公众号](./images/gzh.png)