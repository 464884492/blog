##构建multipart/form-data实现文件上传
> 通常文件上传都是通过`form`表单中的`file`控件，并将form中的content-type设置为`multipart/form-data`。现在我们通过java来构建这部分请求内容实现文件上传功能。
一、关于multipart/form-data
----
文件上传本质上是一个`POST`请求。只不过请求头以及请求内容遵循一定的规则（协议）
+ 请求头（Request Headers）中需要设置 `Content-Type` 为 `multipart/form-data; boundary=${boundary}`。其中`${boundary}`分割线，需要在代码中替换，且尽量复杂，不易重复
+ 请求正文（Request Body）需要使用在 Header中设置的 `${boundary}`来分割当前正文中的FormItem，内容格式如下

 ```plain
 --${boundary}
 Content-Disposition: form-data; name="id"
 
 testCodeUpload
  --${boundary}
  Content-Disposition: form-data; name="file";filename="xx.txt"
  Content-Type: application/octet-stream
 
 {{这里写入文件流}}
 --${boundary}--
 
 ```
 正文开始以`前缀`+${boundary}开始，以 `前缀` +${boundary}+`前缀`结束。中间每个`FormItem` 以 `前缀`+${boundary}开始，以一个空白的换行结束。 
 
二、代码实现
----
>实例代码采用`HttpURLConnection`实现一个简单`POST`请求

* 建立`http`请求，设置基本参数
```java
URL postUrl = new URL(url);
HttpURLConnection conn = (HttpURLConnection) postUrl.openConnection();
conn.setRequestMethod("POST");
conn.setDoInput(true);
conn.setDoOutput(true);
conn.setUseCaches(false);
conn.setRequestProperty("connection", "Keep-Alive");
conn.setRequestProperty("Charset", "UTF-8");
```
* 添加文件上传必须的请求信息，获取http请输出流
```java
String boundary = "----" + UUID.randomUUID().toString();
conn.setRequestProperty("Content-Type",
				"multipart/form-data; boundary=" + boundary);
OutputStream out = conn.getOutputStream();	
StringBuilder sb = new StringBuilder();			
```
* 一组`FormItem`
```java
sb.append(boundaryPrefix);
sb.append(boundary);
sb.append(newLine);
sb.append("Content-Disposition: form-data; name=\"id\"");
sb.append(newLine);
sb.append(newLine);
sb.append("testCodeUpload");
sb.append(newLine);
```
* 文件写人
```java
sb.append(boundaryPrefix);
sb.append(boundary);
sb.append(newLine);
sb.append("Content-Disposition: form-data; name=\"file\"; filename=\""
				+ fileName + "\"");
sb.append("Content-Type: application/octet-stream");
sb.append(newLine);
sb.append(newLine);
out.write(sb.toString().getBytes());		
File file = new File(file1);
FileInputStream in = new FileInputStream(file);
byte[] bufferOut = new byte[1024];
int bytes = 0;
while ((bytes = in.read(bufferOut)) != -1) {
 out.write(bufferOut, 0, bytes);
}
out.write(newLine.getBytes());
in.close();
```
*结束标志 **前缀+boundary +前缀**
```java
byte[] end_data = (newLine + boundaryPrefix + boundary + boundaryPrefix + newLine)
				.getBytes();
out.write(end_data);
out.flush();
out.close();
```
三、文件接收
----
* 文件接收端通过迭代每个FileItem获取不同的数据

```java
FileItemFactory factory = new DiskFileItemFactory();
ServletFileUpload upload = new ServletFileUpload(factory);
upload.setHeaderEncoding("UTF-8");
try {
  items = upload.parseRequest(request);
} catch (FileUploadException ex) {
  ex.printStackTrace();
  out.println(ex.getMessage());
  return;
}
Iterator<FileItem> itr = items.iterator();
String id = "", fileName = "";
int chunks = 1, chunk = 0;
FileItem tempFileItem = null;
while (itr.hasNext()) {
	FileItem item = (FileItem) itr.next();
	if (item.getFieldName().equals("id")) {
		id = item.getString();
	} else if (item.getFieldName().equals("name")) {
		fileName = new String(item.getString().getBytes(
							"ISO-8859-1"), "UTF-8");
	} else if (item.getFieldName().equals("file")) {
		tempFileItem = item;
	}
```
四、总结
----
通过代码实现一遍文件上传，了解其运行机制，解开了以前在写文件上传代码中`item.getFieldName().equals("name")`等相关判断的疑惑。所以，对于已有的基础代码，还是多看，多写，多实践。
