import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

import org.junit.Test;

public class FileUploadTest {

	@Test
	public void buildUploadStream() throws IOException {
		String url = "http://127.0.0.1:8080/uploader";
		String file1 = "D:\\201806251320534828test.xlsx";
	
		file1 = "D:\\test.pdf";
		file1 = "D:\\test.xls";
		String fileName = "201806251320534828test.xlsx";
		fileName = "test.pdf";
		fileName = "test.xls";
		
		String newLine = "\r\n";
		String boundaryPrefix = "--";
		String boundary = "----" + UUID.randomUUID().toString();

		URL postUrl = new URL(url);
		HttpURLConnection conn = (HttpURLConnection) postUrl.openConnection();

		conn.setRequestMethod("POST");
		conn.setDoInput(true);
		conn.setDoOutput(true);
		conn.setUseCaches(false);

		conn.setRequestProperty("connection", "Keep-Alive");
		conn.setRequestProperty("Charset", "UTF-8");
		conn.setRequestProperty("Content-Type",
				"multipart/form-data; boundary=" + boundary);

		OutputStream out = conn.getOutputStream();

		
		StringBuilder sb = new StringBuilder();

		sb.append(boundaryPrefix);
		sb.append(boundary);
		sb.append(newLine);

		sb.append("Content-Disposition: form-data; name=\"id\"");
		sb.append(newLine);
		sb.append(newLine);
		sb.append("testCodeUpload");
		sb.append(newLine);

		sb.append(boundaryPrefix);
		sb.append(boundary);
		sb.append(newLine);

		sb.append("Content-Disposition: form-data; name=\"name\"");
		sb.append(newLine);
		sb.append(newLine);
		sb.append(fileName);
		sb.append(newLine);

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
		byte[] end_data = (newLine + boundaryPrefix + boundary + boundaryPrefix + newLine)
				.getBytes();
		out.write(end_data);
		out.flush();
		out.close();

		BufferedReader reader = new BufferedReader(new InputStreamReader(
				conn.getInputStream()));
		String line = null;
		while ((line = reader.readLine()) != null) {
			System.out.println(line);
		}
	}
}
