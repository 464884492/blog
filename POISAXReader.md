##解决POI读取XLSX文件内存占用过过多
>&nbsp;&nbsp;**poi**处理excel分别提供比较友好的用户模式以及比较底层的事件模式。其中，用户模式提供良好的封装，同时兼容**2003**以及**2007**以上的格式，使用相当方便。不过，代价是花费巨大的内存。只要超过6w条以后，基本是就是内存溢出了。
>&nbsp;&nbsp;好在POI团队也提供了更底层的的流处理模式**eventMode**,对于大数据的Xlsx文件的写入，poi 3.8 提供SXSSF，采用缓存方式写如文件。对于文件的读取采用sax的方式直接读取每个sheet对应的xml文件。

----
##POI SheetContentsHandler 接口
&nbsp;&nbsp;在POI中已经对SAX当时读取对应的Sheet的xml文件已经做了基本的封装，所以我们仅仅需要实现接口**SheetContentsHandler**,就可以完成SAX的方式读取。这个接口中需要是实现三个方法
- public void startRow(int rowNum) 读取某行开始
- public void endRow(int rowNum) 读取某行结束
- public void cell(String cellReference, String formattedValue,XSSFComment comment) 读取某行中的单元格
- public void headerFooter(String text, boolean isHeader, String tagName) 暂时不清楚

##POI SheetContentsHandler实现
这里我主要参照**poi** ```XLSX2CSV.java```实现方式，需要提供对应的xlsx文件最大列数。其次，我在此基础上做了扩展，在 ```endRow``` 提供了一个事件，当前处理的的行数据,让这个解析功能更加独立。
实现思路，在```startRow```方法中构造一个List<String>对象，在```cell```函数中添加每个单元内容，在```endRow```函数中判断当前列是否等于最大列数，如果不等循环补齐，并出发添加行事件
**SheetSaxHandler**详细代码
``` java
protected class SheetSaxHandler implements SheetContentsHandler {
		private int currentRow = -1;
		private int currentCol = -1;
		private int minColumns;

		public void setMinColumns(int minColumns) {
			this.minColumns = minColumns;
		}

		public SheetSaxHandler(int minColumns) {
			super();
			this.minColumns = minColumns;
		}

		public SheetSaxHandler() {
		}

		private List<SheetRowListener> listeners = new ArrayList<SheetRowListener>();
		private List<String> lRows = new ArrayList<String>(); // 处理一行信息

		public void rowAdded(SheetRowListener add) {
			listeners.add(add);
		}

		private void postRowAdded(List<String> row, int rowNum)
				throws SQLException {
			for (SheetRowListener hl : listeners)
				hl.addRow(row, rowNum);
		}

		@Override
		public void startRow(int rowNum) {
			currentRow = rowNum;
			currentCol = -1;
			lRows.clear();
		}

		@Override
		public void endRow(int rowNum) {
			// 添加数据
			for (int i = currentCol; i < minColumns; i++) {
				lRows.add("");
			}
			try {
				postRowAdded(lRows, rowNum);
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}

		@Override
		public void cell(String cellReference, String formattedValue,
				XSSFComment comment) {
			if (cellReference == null) {
				cellReference = new CellAddress(currentRow, currentCol)
						.formatAsString();
			}
			int thisCol = (new CellReference(cellReference)).getCol();
			int missedCols = thisCol - currentCol - 1;//处理数据中间存在空白
			for (int i = 0; i < missedCols; i++) {
				this.lRows.add("");
			}
			currentCol = thisCol;

			// TODO 数据类型处理
			try {
				Double.parseDouble(formattedValue);
				this.lRows.add(formattedValue);
			} catch (NumberFormatException e) {
				this.lRows.add(formattedValue);
			}
		}

		@Override
		public void headerFooter(String text, boolean isHeader, String tagName) {
			System.out.println(text + "==" + isHeader + "==" + tagName);
		}

	}
```
事件接口
``` java
interface SheetRowListener {
		void addRow(List<String> row, int rowNum);
	}
```
## 调用方式
1. 打开文件
2. 找到对应sheet的xml文件
3. 使用上边的方法依次处理每一个sheet

##### 处理文件
``` java 
             @Override
	public int saveToOracle(String filePath, String pcId)
			throws FileNotFoundException, EncryptedDocumentException,
			InvalidFormatException, IOException, ClassNotFoundException,
			SQLException, OpenXML4JException, SAXException,
			ParserConfigurationException {
		File f = new File(filePath);
		OPCPackage p = null;
		int num = 0;
		Connection conn = null;
		if (f.exists()) {
			try {
				JSONArray sheetCfgs = this.cfgJson.getJSONArray("sheets");
				dataBuferRows = this.cfgJson.getInteger("dataBuferRows");
				dataBuferRows = dataBuferRows == null ? 1000 : dataBuferRows;
				conn = ca.getConnection(ca.getSqlCfg(serverPath));
				String importTime = new SimpleDateFormat(
						"yyyy-MM-dd HH:mm:ss.SSS").format(new Date());
				p = OPCPackage.open(f, PackageAccess.READ);
				ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(
						p);
				XSSFReader xssfReader = new XSSFReader(p);
				StylesTable styles = xssfReader.getStylesTable();
				XSSFReader.SheetIterator iter = (XSSFReader.SheetIterator) xssfReader
						.getSheetsData();
				HashMap<Integer, JSONObject> hSheetCfg = new HashMap<Integer, JSONObject>();
				for (int i = 0; i < sheetCfgs.size(); i++) {
					JSONObject sheetCfg = sheetCfgs.getJSONObject(i);
					hSheetCfg.put(sheetCfg.getInteger("sheetIndex"), sheetCfg);
				}
				int index = 1;
				while (iter.hasNext()) {
					InputStream sheetStream = iter.next();
					if (hSheetCfg.containsKey(index)) {
						processSheet(styles, strings, new SheetSaxHandler(),
								sheetStream, hSheetCfg.get(index), conn, pcId,
								this.fileName, importTime);
					}
					index++;
				}

				p.close();
				f = null;
				conn.close();
			} catch (SQLException e) {
				conn.close();
				conn = null;
				throw e;
			}
		}
		return num;
	}
```

###处理Sheet
```java
public void processSheet(StylesTable styles,
			ReadOnlySharedStringsTable strings, SheetSaxHandler sheetHandler,
			InputStream sheetInputStream, final JSONObject sheetCfg,
			final Connection conn, String PcID, String fileName,
			String importTime) throws IOException,
			ParserConfigurationException, SAXException, SQLException {

		final PreparedStatement ps = conn.prepareStatement(ca.buildInsertSql(
				sheetCfg, PcID, fileName, importTime));
		final int dataStartNum = sheetCfg.getIntValue("dataStartNum");
		sheetHandler.setMinColumns(sheetCfg.getJSONArray("fieldReference")
				.size());
		sheetHandler.rowAdded(new SheetRowListener() {
			@Override
			public void addRow(List<String> row, int rowNum) {
				if (rowNum < dataStartNum - 1)
					return;
				try {
					ca.setParamter(ps, sheetCfg, row, rowNum - dataStartNum);
					if (rowNum % dataBuferRows == 0) {
						ps.executeBatch();
						ps.clearBatch();
					}
				} catch (SQLException e) {
					try {
						ps.close();
						conn.close();
						throw e;
					} catch (SQLException e1) {
						e1.printStackTrace();
					}
					e.printStackTrace();
				}

			}
		});
		XMLReader sheetParser = SAXHelper.newXMLReader();
		DataFormatter formatter = new DataFormatter();
		InputSource sheetSource = new InputSource(sheetInputStream);
		ContentHandler handler = new XSSFSheetXMLHandler(styles, null, strings,
				sheetHandler, formatter, false);
		sheetParser.setContentHandler(handler);
		sheetParser.parse(sheetSource);
		// 处理剩下的数据
		ps.executeBatch();
		ps.clearBatch();
		// 关闭当前ps
		ps.close();
	}
````
##总结
> 在最初使用poi的用户模式，很快的就完成一个excel文件的解析，很方便。随着项目的逐渐深入，处理的excel文件越来越大，用户模式已经不能胜任。于是开始查找资料，在官网上看到了转csv的实例。
> 这段代码的主要功能将excel文件中的数据导入到oracle数据库对应的表中，在实现功能方面，我主要遇到了以下问题
> 
1. 解决excel文件解析内存泄露（2007以后文件采用sax方式基本解决）
2. 对应大量数据的保存，速度一直很慢，尽管我这里采用了批量提交的方式（目前这问题**我依然没找到很好的方案，如果有同行看到的，还希望多多指教**）
