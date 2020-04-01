### Java Servlet单元测试

#### 1. 解决痛点

虽然目前主流的开发方式,很多都是通过controll或者微服务提供api.但是不免还是需要写几个`servlet`完成接口开发.按照常规,`servlet`调用服务层代码,只需做下服务层单元测试就好了.可是,这里就忽略了请求参数处理过程的测试,按照以往,如果需要测试,往往是先运行一个tomcat,然后找到一个借口测试工具,完成接口测试.其实没这么麻烦,使用`spring-test`即可快速搞定.解决了如下痛点

+ 单元测试覆盖不全面
+ 不需要启动一个servlet容器
+ 不需要第三方的接口测试工具

#### 2. 实现方式

既然是做单元测试,首先我们需要在pom文件引入`junit`和`spring-test`两个依赖

```xml
<!--author:herbert wx:464884492-->
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-test</artifactId>
  <version>${springVersion}</version>
  <scope>test</scope>
</dependency>
```
然后在单元测试的代码中声明,我们需要做单元测试的`servlet`对象,单元测试类加载时实例化这个对象.

```java
// author:herbert wx:464884492
public class DemoServletTest {
    DemoServlet servlet = null;

	@Before
	public void setUp() {
		servlet = new DemoServlet();
		DOMConfigurator.configure("src/main/webapp/WEB-INF/log4j.xml");
	}
}
```
再添加我们具体的测试方法,简单几句代码就完成了一个请求封装.

```java
// author:herbert wx:464884492
@Test
public void testReqImg() throws ServletException, IOException, InterruptedException {
  JSONObject p = new JSONObject();
  p.put("demoRequest", "herbert 通过spring-test 测试servlet");
  MockHttpServletRequest request = new MockHttpServletRequest();
  request.setContent(p.toString().getBytes());
  MockHttpServletResponse response = new MockHttpServletResponse();
  servlet.doPost(request, response);
  while (true) {
  	Thread.sleep(200);
  }
}
```
其实现原理就是 `MockHttpServletRequest` 和 `MockHttpServletResponse` 分别实现了接口 `HttpServletRequest` 和 `HttpServletResponse`,一般情况下是,容器自动实现的.所以一般开发时不会注意具体的实现内容.如果感兴趣,完全可以自己实现这两个接口,完成单元测试.

#### 3. 总结

知识虽小,重在积累.2020注定是不平凡的一年.加油!!

欢迎感兴趣的朋友关注我的订阅号“小院不小”，或点击下方二维码关注。我将多年开发中遇到的难点，以及一些有意思的功能，体会都会一一发布到我的订阅号中
![订阅号](https://images.cnblogs.com/cnblogs_com/yfrs/1583406/o_dyh.jpg)