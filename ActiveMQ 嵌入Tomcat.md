##ActiveMQ 嵌入Tomcat
> 在一些项目中，单独开启一个ActiveMQ，对于项目实施来说有时略显繁琐。所以我们将ActiveMQ内嵌到Tomcat，Tomcat启动同时就顺带启动了ActiveMQ。由此我们需要掌握三个个重要的知识点
* ActiveMQ中的BrokerService
* 自启动Servlet配置
* 使用jconsole了解嵌入ActiveMQ运行状态

一、开启BrokerService
----
在pom.xml添加ActiveMQ依赖，本次代码实例采用5.7版本，**记住只需要`activemq-core`就行**。
```xml
<dependency>
	<groupId>org.apache.activemq</groupId>
	<artifactId>activemq-core</artifactId>
	<version>5.7.0</version>
</dependency>
```
在编写`BrokerService`代码部分，主要注意三个点
1. 是否需要在`jconsole`中显示监控信息 `broker.setUseJmx(true)`
2. 设置连接用户名和密码，如何使用验证插件
3. 是否持久化，存储位置设置，持久化配置

所以需要启动一个连接地址 `tcp://localhost:61616`，用户名为`admin`，密码为`admin`，需要持久化，持久化数据文件存储地址为 `/activemq` ,需要启动`jconsole`监控的BrokerService的代码如下:
```java
    // author:herbert qq:464884492
	BrokerService broker = new BrokerService();
	broker.setUseJmx(true); // 开启监控
	broker.setPersistent(true); // 持久化
	broker.setBrokerName("Test");
	SimpleAuthenticationPlugin sap = new SimpleAuthenticationPlugin();
	AuthenticationUser au = new AuthenticationUser("admin", "admin","users");
	ArrayList<AuthenticationUser> d = new ArrayList<AuthenticationUser>();
	d.add(au);
	sap.setUsers(d); // 用户验证
	broker.setPlugins(new BrokerPlugin[] { sap });
	String mqDataPath = "/activemq"; // 存储位置 
	broker.getPersistenceAdapter().setDirectory(new File(mqDataPath));
	broker.addConnector("tcp://localhost:61616"); // 连接地址
	broker.start();
```

二、生产者和消费者
----
  ActiveMQ中，通用的消息传递方式有两种
  * 队列，支持消息持久化，未消费的消息，在重启后依然存在。若有多个消费者，在每次提取一条消息的前提下，所有消费均分队列中的消息
  * 主题，不支持消息持久化，未消费的消息，在重启后消息丢失。若有多个消费，每个消费者依次消费主题中所有消息

不管是生产者还是消费者代码编写，主要是**4**个步骤
1. 建立连接，采用`failover:()`方式，自动断线重连
2. 建立`Session`，获取发送或接收目标`Destination` ，指定是队列(`session.createQueue(queueName)`),还是主题(`session.createTopic(topicName)`)
3. 通过`Session`获取生产者或消费者
4. 生产或消费消息

我们现在编写一个生产者的代码，并循环产生10条消息
```java
 // author:herbert qq:464884492
String mqConnUrl = "tcp://localhost:61616";
String connUrl = "failover:(" + mqConnUrl.trim()+ ")?initialReconnectDelay=1000&maxReconnectDelay=30000";
ConnectionFactory connectionFactory = new ActiveMQConnectionFactory("admin","admin", connUrl);
javax.jms.Connection connection = connectionFactory.createConnection();
connection.start();
Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
Destination destination = session.createQueue("system");
MessageProducer messageProducer = session.createProducer(destination);

for (int i = 0; i < 10; i++) {
 javax.jms.TextMessage message = session.createTextMessage("ActiveMQ 发送的消息" + i);
 System.out.println("发送消息：" + "ActiveMQ 发送的消息" + i);
 messageProducer.send(message);
}
```
编写一个消费，消费上边的10条消息
```java
 // author:herbert qq:464884492
String mqConnUrl = "tcp://localhost:61616";
String connUrl = "failover:(" + mqConnUrl.trim()+ ")?initialReconnectDelay=1000&maxReconnectDelay=30000";
ConnectionFactory connectionFactory = new ActiveMQConnectionFactory("admin", "admin", connUrl);
javax.jms.Connection connection = connectionFactory.createConnection();
connection.start();
Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
Destination destination = session.createQueue("system");
MessageConsumer messageConsumer = session.createConsumer(destination);
messageConsumer.setMessageListener(new MessageListener() {
@Override
public void onMessage(javax.jms.Message message) {
   ActiveMQTextMessage m = (ActiveMQTextMessage) message;
	try {
	      System.out.println("接收到：" + m.getText());
	     } catch (JMSException e) {
	     e.printStackTrace();
	    }
     }
});
```
运行效果

![Alt text](https://github.com/464884492/blog/blob/master/images/activemq_result.png)

可见，我们生产者，产生的10条消息，已成功被消费者处理了。

三、监控嵌入的ActiveMQ
----
对于嵌入的ActiveMQ，在BrokerService启动前需要设置 broker.setUseJmx(true);然后找到你的JAVA_HOME,切换到bin，输入jconsole命令。

![Alt text](https://github.com/464884492/blog/blob/master/images/activemq_cmd.png)

待jconsole启动后，选择ActiveMQ所在的进程。连接后选择Mbean页签

![Alt text](https://github.com/464884492/blog/blob/master/images/activemq_jconsole.png)

红框的地方分别为已消费和已进入MQ中的消息的条数。选择操作，找到那个SendTextMessage还可以想此队列发送消息。
四、Selvelt跟随Tomcat启动
----
对于Tomcat7.x版本之后Tomcat，Selvelt都可以通过直接在代码中通过注解的方式配置URl连接，一起是否自启动`loadOnStartup `这个值>=0表示需要自启动，值越小优先级越高
```java
 // author:herbert qq:464884492
@WebServlet(urlPatterns = "/initmq", loadOnStartup = 1)
public class InitMqServlet extends HttpServlet {
@Override
public void init(ServletConfig config) throws ServletException {
		super.init(config);
        // 这里编写启动ActiveMQ代码
 }
}		
```
五、总结
-----
这次以ActiveMQ作为消息队列使用切入点，总体上说还比较顺利。其中唯一出现问题的地方就是对于activeMQ依赖过多，多依赖了jar`activemq-broker`，导致消息能连接，但不能发送消息。后边直接换成 `activemq-all`,有出现slf4j日志冲突，使用`exclusions`依然不能解决问题。最终只依赖 ` activemq-core`,完美解决所有问题。