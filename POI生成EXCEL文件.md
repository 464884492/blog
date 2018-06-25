## POI生成EXCEL文件


一、背景
--
 根据指定格式的`JSON`文件生成对应的`excel`文件，需求如下
 + 支持多sheet
 + 支持单元格合并
 + 支持插入图片
 + 支持单元格样式可定制
 + 需要 标题(title)，表头(head)，数据(data) ，表尾(foot) 明确区分

二、效果预览
--
![Alt text](https://github.com/464884492/blog/blob/master/images/exceldemo.png)

三、数据格式
--
> 由于是生成Excel文件，这里值考虑生成xlsx格式的Excel文件，数据多表头默认考虑使用 | 表示，不在使用colspan rowspan作为。如需要表示两列两行，第一列合并表头格式为: A|B,A|C生成的表格为
> <table> <tr><td colspan=2 align="center">A</td></tr><tr><td align="center" >B</td><td align="center">C</td></tr> </table>
前端通过post的方式将需要生成的数据构造成符合要求的JSON文件提交跟后台。根据以上需求定义JSON格式如下
```javascript
{
	"saveName": "生成Excel的文件名.xlsx",
	"userStyles": [{
		"id": "1", //不能出现重复，在需要设置单元样式的地方，可以直接将style赋值为此值
		"style": {
			"font": { //设置字体基本格式
                "blod": true,//是否加粗
                "italic": true, //是否倾斜
                "color": "#FF0000",//字体颜色
                "name": "微软雅黑", //字体名称
                "height": 20 //大小
             }, 
			"fmtStr": "", //单元格格式，#,##0.00_);#,##0.00;0 千分位
			"align": "",//水平对齐方式 left right center
			"valign": "",//垂直对齐方式 top center bottom
			"borderColor": "", //设置边框颜色 如 #FF0000
			"bgColor": "" //设置单元格填充颜色 
		}
	}],
	"sheets": [{
		"sheetName": "", //sheet名称
		"title": [], // 对应Sheet标题区域数据
		"titleMerge": [], //对应Sheet标题区域合并信息
		"head": [{}], //表头信息
		"data": [], //数据信息
		"dataMerge": [], //数据合并信息
		"foot": [], //表尾信息
		"footMerge": [], //表尾合并信息
		"img": [] //图片信息，需要将图片转换base64
	}]
}
```
简要说明
+ head  数组中为JSON对象格式为

```javascript
{
	"name": "A|B", //表头名称，多表头用|分割
	"type": "str", //此列数据类型 str num ,在excel中日期也是数字类型，通过fmtStr,显示为日期格式
	"field": "F_FIELD1", //备用字段，可不用
	"style": { //此列数据为列默认样式，可以是Style对象，也可以是在userStyles中定义的id值
		"align": "center"
	}
}
```
+ 在数组 title data foot 中，列表中的数据，可以是一个单独的值如 1,"a"，也可以是一个对象，当为对象时，格式为

```javascript
{
	"value": "", //单元格具体的值
	"type": "",  //单元格类型，默认str 
	"style": {} //单元格样式 可以是Style对象，也可以是在userStyles中定义的id值，如果没设置，默认取head总此列对应的style
}
```
+  titleMerge、dataMerge、footMerge数组值为逗号分隔的字符串，其含义为`"开始行，结束行，开始列，结束列"`，索引从0开始。如在title中有两行三列数据，现在需要合并一行两列数据对应的值为`"0，0，0，1"`
+ img数组中值为对象，格式

```javascript
{
	"col": 1, //图片开始列
	"row": 0, //开始行
	"colSpan": 1,//列跨度，最小值1
	"rowSpan": 2, //行跨度，最小值1
	"data": "" //base64图片数据如: "data:image/png;base64,iVBO...ggg=="
}
```
四、关键实现
--
07以后的Excle文件，其实是一个压缩包，里边是一个个的xml文件，其中每一个sheet是一个xml文件，样式是一个xml文件，图片是对应的图片文件，放在media文件夹中，所以，代码思路依次为
+ 构建 XSSFWorkbook 对象
+ 生成样式
+ 依次生成，title head data foot 行数据
+ 依次处理合并信息 titlemerge datamerge footmerge
+ 添加图片信息
+ 输出文件流

功能入口如下
```java
@Override
	public void buildOutputStream() throws FileProducerException {
		// 处理传入的JSON数据
		sheets = this.jsonData.getJSONArray(this.SHEETS);
		Iterator<Object> sheetIter = sheets.iterator();
		if (sheets.isEmpty()) {
			this.responseData.setErrcode(1001);
			this.responseData.setSuccess(false);
			this.responseData.setErrmsg("无数据可生成");
			throw new FileProducerException();
		}
		wb = new XSSFWorkbook();
		// 建立全局格式
		JSONArray userStyles = this.jsonData.getJSONArray(this.USERSTYLES);
		this.initUserStyles(userStyles);
		this.initDefaultHeadStyle();

		XSSFSheet ws;
		JSONObject sheet;
		JSONArray sheetData;
		JSONArray sheetTitle;
		JSONArray sheetHead;
		JSONArray sheetFoot;
		JSONArray sheetImgs;

		String sheetName;
		int sheetIndex = 0;
		while (sheetIter.hasNext()) {
			sheet = (JSONObject) sheetIter.next();
			// 获取sheet名称
			sheetName = sheet.getString(this.SHEET_NAME);
			ws = wb.createSheet();
			if (StringUtils.isNotBlank(sheetName)) {
				wb.setSheetName(sheetIndex, sheetName);
			}
			int sheetRowIndex = 0;
			sheetTitle = sheet.getJSONArray(this.SHEET_TITLE);
			this.setMergeCells(ws, sheet.getJSONArray(this.SHEET_TITLE_MERGE),
					sheetRowIndex);
			sheetRowIndex = this.createRandom(ws, sheetTitle, sheetRowIndex);

			sheetHead = sheet.getJSONArray(this.SHEET_HEAD);
			sheetRowIndex = this.createHeadColumn(ws, sheetHead, sheetRowIndex);

			this.setMergeCells(ws, sheet.getJSONArray(this.SHEET_DATA_MERGE),
					sheetRowIndex);
			sheetData = sheet.getJSONArray(this.SHEET_DATA);
			sheetRowIndex = this.createData(ws, sheetData, sheetRowIndex);

			sheetFoot = sheet.getJSONArray(this.SHEET_FOOT);
			this.setMergeCells(ws, sheet.getJSONArray(this.SHEET_FOOT_MERGE),
					sheetRowIndex);
			sheetRowIndex = this.createRandom(ws, sheetFoot, sheetRowIndex);

			sheetImgs = sheet.getJSONArray(this.SHEET_IMG);

			this.setSheetImages(ws, sheetImgs);
		}

		// 返回输出流
		try {
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			wb.write(os);
			this.outStreams.add(os);
		} catch (IOException e) {
			throw new FileProducerException(e.getMessage(), e.getCause());
		}
	}
```
生成单元格样式对象，包括`字体` `边框` `背景` `对齐方式`
```java
private XSSFCellStyle createCellStyle(JSONObject style) {

		XSSFCellStyle cellStyle = wb.createCellStyle();
		// 设置字体
		JSONObject font = style.getJSONObject(this.STYLE_FONT);
		Font excelFont = this.createFont(font);
		if (excelFont != null) {
			cellStyle.setFont(excelFont);
		}
		// border统一黑色
		cellStyle.setBorderBottom(BorderStyle.THIN);
		cellStyle.setBorderTop(BorderStyle.THIN);
		cellStyle.setBorderLeft(BorderStyle.THIN);
		cellStyle.setBorderRight(BorderStyle.THIN);

		String borderColor = style.getString(this.BORDER_COLOR);
		if (StringUtils.isNotBlank(borderColor)) {
			XSSFColor xfBorderColor = new XSSFColor(new Color(Integer.parseInt(
					borderColor.substring(1), 16)));
			cellStyle.setBorderColor(BorderSide.BOTTOM, xfBorderColor);
			cellStyle.setBorderColor(BorderSide.TOP, xfBorderColor);
			cellStyle.setBorderColor(BorderSide.LEFT, xfBorderColor);
			cellStyle.setBorderColor(BorderSide.RIGHT, xfBorderColor);
		}
		// 背景色
		String bgColor = style.getString(this.BACKGROUND_COLOR);
		if (StringUtils.isNotBlank(bgColor)) {
			XSSFColor cellBgColor = new XSSFColor(new Color(Integer.parseInt(
					bgColor.substring(1), 16)));
			cellStyle.setFillForegroundColor(cellBgColor);
			cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		}
		// 对齐方式
		String hAlignment = style.getString(this.HALIGNMENT);
		if (StringUtils.isNotBlank(hAlignment))
			cellStyle.setAlignment(HorizontalAlignment.valueOf(hAlignment
					.toUpperCase()));
		String vAlignment = style.getString(this.VALIGNMENT);
		if (StringUtils.isNotBlank(vAlignment))
			cellStyle.setVerticalAlignment(VerticalAlignment.valueOf(vAlignment
					.toUpperCase()));
		// 自动换行TRUE
		cellStyle.setWrapText(true);

		// 格式
		String fmt = style.getString(this.FMTSTRING);
		if (StringUtils.isNotBlank(fmt))
			cellStyle.setDataFormat(wb.createDataFormat().getFormat(fmt));
		return cellStyle;
	}
```
创建字体样式
```java
private Font createFont(JSONObject fontCfg) {
		if (fontCfg == null)
			return null;
		XSSFFont font = wb.createFont();
		font.setFontName(fontCfg.getString(this.FONT_NAME));
		Boolean fontBoole = fontCfg.getBoolean(FONT_BLOD);
		if (fontBoole != null)
			font.setBold(fontBoole.booleanValue());
		fontBoole = fontCfg.getBoolean(this.FONT_ITALIC);
		if (fontBoole != null)
			font.setItalic(fontBoole.booleanValue());
		fontBoole = fontCfg.getBoolean(this.FONT_UNDERLINE);
		if (fontBoole != null && fontBoole.booleanValue() == true)
			font.setUnderline(FontUnderline.SINGLE.getByteValue());
		Short fontHeight = fontCfg.getShort(this.FONT_HEIGHT);
		if (fontHeight != null)
			font.setFontHeightInPoints(fontHeight);
		String colorStr = fontCfg.getString(this.FONT_COLOR);
		if (colorStr != null) {
			font.setColor(new XSSFColor(new Color(Integer.parseInt(
					colorStr.substring(1), 16))));
		}
		return font;
	}
```

处理表头,表过多表头处理，采用 | 分割的方式，传入head长度为列数据，name中有几个 | 就知道表头有几行。所以针对表头处理有以下几个步骤
+ 生成默认列样式
+ 填充所有列数据，求出最大行数
+ 横向合并内容相同的单元
+ 纵向合并空白的单元格

```java
private int createHeadColumn(XSSFSheet ws, JSONArray sheetHead,
			int sheetRowIndex) {
		if (sheetHead == null)
			return sheetRowIndex;
		Iterator<Object> headIter = sheetHead.iterator();
		JSONObject curHead = null;
		int colIndex = 0;
		Object colStyle = null;
		int colSize = sheetHead.size();
		headTypes = new String[colSize];
		headCellStyleKeys = new String[colSize];
		int[] headColLevel = new int[colSize];
		String colName = null;
		String[] colNameAry = null;
		int maxLevel = 0;
		int colLevel = 0;
		XSSFCell headCell = null;
		ArrayList<ArrayList<String>> headValueList = new ArrayList<ArrayList<String>>();
		while (headIter.hasNext()) {
			curHead = (JSONObject) headIter.next();
			// 处理默认样式
			if (curHead.containsKey(this.COLUMN_STYLE)) {
				colStyle = curHead.get(this.COLUMN_STYLE);
				if (colStyle instanceof JSONObject) {
					headCellStyleKeys[colIndex] = this.COLUMNSTYLE_PREV
							+ colIndex;
					this.userStyles.put(headCellStyleKeys[colIndex],
							this.createCellStyle((JSONObject) colStyle));
				} else if (this.userStyles.containsKey(colStyle)) {
					headCellStyleKeys[colIndex] = (String) colStyle;
				}
			}
			// 处理默认列宽
			if (curHead.containsKey(this.COLUMN_WIDTH)) {
				ws.setDefaultColumnWidth(pixToExcelWdith(curHead
						.getIntValue(this.COLUMN_WIDTH)));
			}
			// 保存列样式
			if (curHead.containsKey(this.COLUMN_TYPE)) {
				headTypes[colIndex] = curHead.getString(this.COLUMN_TYPE);
			} else {
				headTypes[colIndex] = this.CELLTYPESTRING;
			}
			// 处理多表头
			colName = curHead.getString(this.COLUMN_NAME);
			colNameAry = colName.split("\\|");
			colLevel = colNameAry.length;
			headColLevel[colIndex] = colLevel;
			if (colLevel > maxLevel) {
				maxLevel = colLevel;
			}
			for (int i = 0; i < colLevel; i++) {
				if (headValueList.size() <= i) {
					headValueList.add(new ArrayList<String>());
				}
				headValueList.get(i).add(colIndex, colNameAry[i]);
				XSSFRow row = ws.getRow(sheetRowIndex + i);
				if (row == null) {
					row = ws.createRow(sheetRowIndex + i);
				}
				headCell = row.createCell(colIndex);
				headCell.setCellValue(colNameAry[i]);
				headCell.setCellStyle(this.userStyles.get(this.HEADSTYLE_KEY));
			}
			colIndex++;
		}

		// 横向合并
		Iterator<ArrayList<String>> a = headValueList.iterator();
		JSONArray headMerge = new JSONArray();
		String prev = "";
		String curent = null;
		int lRowIndex = 0;
		int startCol = 0;
		int mergeCol = 0;
		ArrayList<String> columnInfo = null;
		while (a.hasNext()) {
			startCol = 0;
			mergeCol = 0;
			prev = "";
			columnInfo = a.next();
			// 第三列才能知道，第一列和第二列是否合并
			columnInfo.add("");
			Iterator<String> b = columnInfo.iterator();
			XSSFCell lastRowCell = null;
			while (b.hasNext()) {
				curent = b.next();
				if (lRowIndex > 0) {
					lastRowCell = ws.getRow(sheetRowIndex + lRowIndex - 1)
							.getCell(startCol);
				}
				if (prev.equalsIgnoreCase(curent) && lRowIndex == 0) {
					ws.getRow(sheetRowIndex + lRowIndex).getCell(startCol)
							.setCellType(Cell.CELL_TYPE_BLANK);
					mergeCol++;
				} else if (prev.equalsIgnoreCase(curent)
						&& lRowIndex > 0
						&& StringUtils
								.isBlank(lastRowCell.getStringCellValue())) {
					ws.getRow(sheetRowIndex + lRowIndex).getCell(startCol)
							.setCellType(Cell.CELL_TYPE_BLANK);
					mergeCol++;
				} else {
					if (mergeCol > 0 && startCol > 0) {
						headMerge.add(String.format("%d,%d,%d,%d", lRowIndex,
								lRowIndex, startCol - mergeCol - 1,
								startCol - 1));
						mergeCol = 0;
					}
				}
				startCol++;
				prev = curent;
			}
			lRowIndex++;
		}
		for (int i = 0; i < colSize; i++) {
			if (headColLevel[i] < maxLevel) { // 存在列合并
				headMerge.add(String.format("%d,%d,%d,%d", headColLevel[i] - 1,
						maxLevel - 1, i, i));
				for (int r = headColLevel[i]; r < maxLevel; r++) {
					ws.getRow(sheetRowIndex + r)
							.createCell(i)
							.setCellStyle(
									this.userStyles.get(this.HEADSTYLE_KEY));
				}
			}
		}

		this.setMergeCells(ws, headMerge, sheetRowIndex);
		return sheetRowIndex + maxLevel;
	}

```
添加图片,默认采用单元格描点方式，将图片固定指定的单元格区域内

```java
private void addImg(XSSFSheet ws, JSONObject img, XSSFCreationHelper cHelper) {
		String imgBase64 = img.getString(this.SHEET_IMG_DATA);
		if (StringUtils.isBlank(imgBase64))
			return;
		String[] imgary = imgBase64.split(",");
		System.out.println(imgary[0]);
		byte[] imgByte = Base64.decodeBase64(imgary[1]);
		int imgIdx = wb.addPicture(imgByte, Workbook.PICTURE_TYPE_JPEG);
		XSSFDrawing drawImg = ws.createDrawingPatriarch();
		XSSFClientAnchor anchor = cHelper.createClientAnchor();
		int col = img.getIntValue(this.SHEET_IMG_COL);
		int row = img.getIntValue(this.SHEET_IMG_ROW);
		anchor.setCol1(col);
		anchor.setRow1(row);
		XSSFPicture pict = drawImg.createPicture(anchor, imgIdx);
		Integer colSpan = img.getInteger(this.SHEET_IMG_COLSPAN);
		if (colSpan == null)
			colSpan = 1;
		Integer rowSpan = img.getInteger(this.SHEET_IMG_ROWSPAN);
		if (rowSpan == null)
			rowSpan = 1;
		pict.resize(colSpan, rowSpan);
	}
```
五、总结
--
这次通过传入JSON对象生成样式丰富的excel文件，对于POI操作office文档又更加熟悉一些。相对于解析excel文档，生成就不用考虑文件格式，如：兼容2003格式，考虑大文件sax方式解析。相对于js前端生成excel文件，增加了对生成后文件二次加工的可能性，所以在功能入口中，采用了生成二进制流的方式。文件生成好后，可以继续发送邮件，上传ftp等操作。
重点说明
+ 对于各数据区域数据，保持区域数据独立性（数据索引值）
+ 对于图片开始行和开始列，索引值是针对一个完整的sheet
+ 对于表头区域，多表头采用 | 分割，减少部分传输数据
+ excel中style为所有sheet共享样式。



