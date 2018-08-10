package demo.websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.PongMessage;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.alibaba.fastjson.JSONObject;

@ServerEndpoint(value = "/demowebsocket/{userId}/{sessionId}")
public class DemoWebSokcet {
	private static final Set<DemoWebSokcet> connections = new CopyOnWriteArraySet<DemoWebSokcet>();
	private Session session;

	public DemoWebSokcet() {
	}

	@OnOpen
	public void openConnection(Session session, EndpointConfig conf,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		this.session = session;
		connections.add(this);
		JSONObject jo = new JSONObject();
		jo.put("code", "newuser");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", "server：新连接用户");
		sendMessage(jo);

		// 测试 代码
		JSONObject jo1 = new JSONObject();
		jo1.put("code", "codeone");
		jo1.put("userid", userId);
		jo1.put("sessionid", sessionId);
		jo1.put("msg", "Server：组件1你好");
		sendMessage(jo1);

		JSONObject jo2 = new JSONObject();
		jo2.put("code", "codetwo");
		jo2.put("userid", userId);
		jo2.put("sessionid", sessionId);
		jo2.put("msg", "server：组件2你好");
		sendMessage(jo2);
	}

	@OnClose
	public void closeConnection(@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		connections.remove(this);
		JSONObject jo = new JSONObject();
		jo.put("code", "connectionClose");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", "server:连接关闭");
		sendMessage(jo);
	}

	// 处理文本消息
	@OnMessage
	public void handleTextMsg(Session session, String message,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		System.out.println("userId=>" + userId + " sessionId=>" + sessionId);
		// 原样转发客户端消息
		sendMessage(JSONObject.parseObject(message));
	}

	// 处理二进制消息
	@OnMessage
	public void handleBinaryMsg(Session session, ByteBuffer msg,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {

	}

	// 处理pong消息
	@OnMessage
	public void handlePongMsg(Session session, PongMessage msg,
			@PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) {
		JSONObject jo = new JSONObject();
		jo.put("code", "pong");
		jo.put("userid", userId);
		jo.put("sessionid", sessionId);
		jo.put("msg", msg.getApplicationData().toString());
		sendMessage(jo);
	}

	@OnError
	public void onError(Throwable t, @PathParam("userId") String userId,
			@PathParam("sessionId") String sessionId) throws Throwable {
		JSONObject jo = new JSONObject();
		jo.put("code", "servererror");
		jo.put("userid", userId);
		jo.put("sessionid", userId);
		jo.put("msg", t.getMessage());
		sendMessage(jo);
	}

	private static void sendMessage(JSONObject msg) {
		for (DemoWebSokcet client : connections) {
			try {
				synchronized (client) {
					client.session.getBasicRemote()
							.sendText(msg.toJSONString());
				}
			} catch (IOException e) {
				JSONObject jo = new JSONObject();
				jo.put("code", "servererror");
				jo.put("userid",
						client.session.getPathParameters().get("userid"));
				jo.put("sessionid",
						client.session.getPathParameters().get("sessionid"));
				connections.remove(client);
				try {
					client.session.close();
				} catch (IOException e1) {
				}

				jo.put("msg", "server：发送消息出现异常，连接已关闭" + e.getMessage());
				sendMessage(jo);
			}
		}
	}
}
