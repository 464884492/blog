##POI生成WORD文档
&nbsp;&nbsp;&nbsp;&nbsp;POI为Java系处理office文档的比较优秀的开源库，其中对于Excel的处理最为优秀，文档也写的很详细。不过很多网友都认为它在word文档处理方面就逊色很多，不过对于我本次的完成文档的生成我依然选择了POI。
##需要完成功能
  1. 配置Word模板文件，包括表格
  2. 解析配置的Word文档，返回配置的特殊标记
  3. 构造数据，替换配置的标签，以及生成表格

##配置word模版
采用${xx}方式配置标签，如果是表格在对应一行一列配置表格名称
![](http://i.imgur.com/WgxXLjE.jpg)
**注意**在word文档中，如果两个相近的字符样式不同，word默认会保存在不同的`RUN`元素中，由此很多朋友在配置好以后都需要保存为一个单独的文件，然后不把不在一起的标签合并到一个`RUN`元素中，如果文件比较大，我相信这绝对是一个比较痛苦的事情，这里将会侧重处理这个问题.我的解决方案是只保留第一`RUN`的样式其他的删掉
![](http://i.imgur.com/Pj5xevs.jpg)
##解析word模板
首先需要将文件转换为`XWPFDocument`对象，可以通过流的当时，也可以通过`opcpackage`,不过如果使用`opcpackage`打开的方式，打开的文件和最终生成的文件不能够是同一个文件，我这里采用文件流的方式
```java
public XWPFDocument openDocument() {
		XWPFDocument xdoc = null;
		InputStream is = null;
		try {
			is = new FileInputStream(saveFile);
			xdoc = new XWPFDocument(is);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return xdoc;
	}
```
获取非列表的标签，实现方式`XWPFDocument`对象有当前所有段落以及表格，这里暂不考虑表格嵌套表格的情况，每个段落的文本信息是可以通过`p.getText()`获取，获取段落中文档配置信息如下：
```java
   // 获取段落集合中所有文本
	public List<TagInfo> getWordTag(XWPFDocument doc, String regex) {
		List<TagInfo> tags = new ArrayList<TagInfo>();
		// 普通段落
		List<XWPFParagraph> pars = doc.getParagraphs();
		for (int i = 0; i < pars.size(); i++) {
			XWPFParagraph p = pars.get(i);
			setTagInfoList(tags, p, regex);
		}
		// Table中段落
		List<XWPFTable> commTables = getDocTables(doc, false, regex);
		for (XWPFTable table : commTables) {
			List<XWPFParagraph> tparags = getTableParagraph(table);
			for (int i = 0; i < tparags.size(); i++) {
				XWPFParagraph p = tparags.get(i);
				setTagInfoList(tags, p, regex);
			}
		}
		return tags;
	}
```
获取文本后通过正则解析，并依次保存到TagInfo中
```java
// 向 taglist中添加新解析的段落信息
	private void setTagInfoList(List<TagInfo> list, XWPFParagraph p,
			String regex) {
		if (regex == "")
			regex = defaultRegex;
		Pattern pattern = Pattern.compile(regex);
		Matcher matcher = pattern.matcher(p.getText());
		int startPosition = 0;
		while (matcher.find(startPosition)) {
			String match = matcher.group();
			if (!list.contains(new TagInfo(match, match, ""))) {
				list.add(new TagInfo(match, match, ""));
			}
			startPosition = matcher.end();
		}
	}
```
解析表格
```java
    // 获取Table列表中的配置信息
	public Map<String, List<List<TagInfo>>> getTableTag(XWPFDocument doc,
			String regex) {
		Map<String, List<List<TagInfo>>> mapList = new HashMap<String, List<List<TagInfo>>>();
		List<XWPFTable> lstTables = getDocTables(doc, true, regex);
		for (XWPFTable table : lstTables) {
			// 获取每个表格第一个单元格，以及最后一行
			String strTableName = getTableListName(table, regex);
			List<List<TagInfo>> list = new ArrayList<List<TagInfo>>();
			List<TagInfo> lstTag = new ArrayList<TagInfo>();
			int rowSize = table.getRows().size();
			XWPFTableRow lastRow = table.getRow(rowSize - 1);
			for (XWPFTableCell cell : lastRow.getTableCells()) {
				for (XWPFParagraph p : cell.getParagraphs()) {
					// 去掉空白字符串
					if (p.getText() != null && p.getText().length() > 0) {
						setTagInfoList(lstTag, p, regex);
					}
				}
			}
			list.add(lstTag);
			// 添加到数据集
			mapList.put(strTableName, list);
		}
		return mapList;
	}
```
##生成WORD文档
**难点替换标签**
传入数据格式包含三个formtag以及一个tableTag
```json
{"formTags":[{"TagName":"${xxxx}","TagText":"${xxxx}","TagValue":""},{"TagName":"${123}","TagText":"${123}","TagValue":""},{"TagName":"${ddd}","TagText":"${ddd}","TagValue":""}],"tableTags":{"${table}":[[{"TagName":"${COL1}","TagText":"${COL1}","TagValue":""},{"TagName":"${COL2}","TagText":"${COL2}","TagValue":""}]]}}
```
普通文档生成，并且保留配置样式，这里主要使用**POI**中提供searchText方法，返回Tag所有所在的`RUN`标签，通过一个字符做比较，如果找的第一个匹配的文本开始计数，所有在当前条件下类型 $${xxx}这样的标签是无法实现替换的
替换普通文本Tag
```java
	public void ReplaceInParagraph(List<TagInfo> tagList, XWPFParagraph para,
			String regex) {
		if (regex == "")
			regex = defaultRegex;
		List<XWPFRun> runs = para.getRuns();
		for (TagInfo ti : tagList) {
			String find = ti.TagText;
			String replValue = ti.TagValue;
			TextSegement found = para.searchText(find,
					new PositionInParagraph());
			if (found != null) {
				// 判断查找内容是否在同一个Run标签中
				if (found.getBeginRun() == found.getEndRun()) {
					XWPFRun run = runs.get(found.getBeginRun());
					String runText = run.getText(run.getTextPosition());
					String replaced = runText.replace(find, replValue);
					run.setText(replaced, 0);
				} else {
					// 存在多个Run标签
					StringBuilder sb = new StringBuilder();
					for (int runPos = found.getBeginRun(); runPos <= found
							.getEndRun(); runPos++) {
						XWPFRun run = runs.get(runPos);
						sb.append(run.getText((run.getTextPosition())));
					}
					String connectedRuns = sb.toString();
					String replaced = connectedRuns.replace(find, replValue);
					XWPFRun firstRun = runs.get(found.getBeginRun());
					firstRun.setText(replaced, 0);
					// 删除后边的run标签
					for (int runPos = found.getBeginRun() + 1; runPos <= found
							.getEndRun(); runPos++) {
						// 清空其他标签内容
						XWPFRun partNext = runs.get(runPos);
						partNext.setText("", 0);
					}
				}
			}
		}
		// 完成第一遍查找,检测段落中的标签是否已经替换完
		Pattern pattern = Pattern.compile(regex);
		Matcher matcher = pattern.matcher(para.getText());
		boolean find = matcher.find();
		if (find) {
			ReplaceInParagraph(tagList, para, regex);
			find = false;
		}
	}
```
表格主要是通过复制模版行，然后对模版行中的内容做修改
复制文本标签`RUN`
```java
	private void CopyRun(XWPFRun target, XWPFRun source) {
		target.getCTR().setRPr(source.getCTR().getRPr());
		// 设置文本
		target.setText(source.text());
	}
```
复制段落`XWPFParagraph`
```java
	private void copyParagraph(XWPFParagraph target, XWPFParagraph source) {
		// 设置段落样式
		target.getCTP().setPPr(source.getCTP().getPPr());
		// 添加Run标签
		for (int pos = 0; pos < target.getRuns().size(); pos++) {
			target.removeRun(pos);
		}
		for (XWPFRun s : source.getRuns()) {
			XWPFRun targetrun = target.createRun();
			CopyRun(targetrun, s);
		}
	}
```
复制单元格`XWPFTableCell`
```java
	private void copyTableCell(XWPFTableCell target, XWPFTableCell source) {
		// 列属性
		target.getCTTc().setTcPr(source.getCTTc().getTcPr());
		// 删除目标 targetCell 所有单元格
		for (int pos = 0; pos < target.getParagraphs().size(); pos++) {
			target.removeParagraph(pos);
		}
		// 添加段落
		for (XWPFParagraph sp : source.getParagraphs()) {
			XWPFParagraph targetP = target.addParagraph();
			copyParagraph(targetP, sp);
		}
	}

```
复制行`XWPFTableRow`
```java
	private void CopytTableRow(XWPFTableRow target, XWPFTableRow source) {
		// 复制样式
		target.getCtRow().setTrPr(source.getCtRow().getTrPr());
		// 复制单元格
		for (int i = 0; i < target.getTableCells().size(); i++) {
			copyTableCell(target.getCell(i), source.getCell(i));
		}
	}
```
版权所有，转载请说明来源 **[杨瀚博](http://www.cnblogs.com/yfrs/)**
以上就完成所有功能更，只要你配置规范，可以完全原样输出模版内容。这里特别感谢下[肖哥哥](http://www.cnblogs.com/xiaochangwei/)大力支持。
其次，java的编码真的让人很无语，get或post时各种乱码问题，还好都解决。
2016-06-03 16:53:08 