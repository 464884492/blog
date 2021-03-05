### ant-design-vue中table自定义列

#### 1. 使用背景

在项目中使用`ant-vue`的`a-table`控件过程中，需要显示序号列或者在列中显示图片，超链，按钮等UI信息。经过查询文档`customCell`和`customRender`可以实现以上需求，比如实现如下表格数据渲染

![三种方案截图](/images/antvue/ant-table.png)

#### 2. slots&scopedSlots作用

在查看文档过程中，在类型一栏中经常看到 `xxx|slot |slot-scope` 这样的描述信息。比如`customRender`在文档中的描述信息

```text
customRender | 生成复杂数据的渲染函数.. | **Function(text, record, index) {}|slot-scope**
```

在最初一直以为在列中可以是如下配置的

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
const tableColumn = [
      {
        title: '游戏名称',
        dataIndex: 'title',
        customRender:'xxslot'
      }
]
```

这样定义后执行`npm run serve`在浏览器会出现`customRender is not function` 的错误信息。以及后来看到有如下写法

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
const tableColumn = [
      {
        title: '游戏名称',
        dataIndex: 'title',
        scopedSlots: {
          customRender: "customRender"
        }
      }
]
```

还有很长一段时间不明白`scopedSlots`这个对象的属性为啥是`customRender`, 还有其他的什么属性吗？当时知识还不完善没有理解到文档上`使用 columns 时，可以通过该属性配置支持 slot-scope 的属性`的含义

虽然知道怎么用了，但还是有必要了解下它是如何运行的。我们知道在vue中可以通过`this.$slots`、`this.$scopedSlots`分别访问静态插槽和作用域插槽。在文件`components\table\index.jsx`中可以找到组件库对`scopedSlots`、`slots`转换成具体函数的过程，代码如下

```javascript
 // 公众号:小院不小 date 20210205 wx:464884492
 ...
 // 获取插槽
 const { $slots, $scopedSlots } = this;
 // 转换静态插槽
 Object.keys(slots).forEach(key => {
      const name = slots[key];
      if (column[key] === undefined && $slots[name]) {
        column[key] = $slots[name].length === 1 ? $slots[name][0] : $slots[name];
      }
    });
 // 转换动态插槽  
 Object.keys(scopedSlots).forEach(key => {
  const name = scopedSlots[key];
  if (column[key] === undefined && $scopedSlots[name]) {
    column[key] = $scopedSlots[name];
  }
 });
```

从以上代码也可以知道，如果您定义如下的列配置，自定插槽会失效,以下代码该列会全部显示123

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
{
    title: "customRender|slot-scope",
    dataIndex: '',
    customRender: () => 123,
    scopedSlots: {
      customRender: "customRender"
    }
}
```

也就是说customRender定义成函数的优先级高于作用域插槽

#### 3. customCell

`customCell`影响的是`vnode`中的属性信息，你可以改变当前列的样式等相关信息，在文件 `components\vc-table\src\TableCell.jsx` 对应代码片段

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
...
 if (column.customCell) {
  tdProps = mergeProps(tdProps, column.customCell(record, index));
}
...
 return (
  <BodyCell class={cellClassName} {...tdProps}>
    {indentText}
    {expandIcon}
    {text}
  </BodyCell>
);    
```
所以这个对象可以传递值可以参考vue官方文档[深入数据对象](https://cn.vuejs.org/v2/guide/render-function.html#深入数据对象)中的描述。你可以返回如下对改变当前列的字体大小和颜色

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
 return {
    style: {
      color: 'red',
      fontSize: '14px'
    }
 }
```

也可通过如下改变显示的内容

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
return {
  domProps: {
      innerHTML: record.title + "#" + (index + 1)
    }
}
```

#### 4. customRender
`customRender`也可以影响当前列的显示信息，不过它更灵活。可以返回一段`jsx`获取返回一个类似`customCell`一样的属性信息。不过从代码来看，它只接收一下属性**attrs**、**props**、**class**、**style**、**children**，而且它的优先级也没有`customCell`优先级高。`customRender`可以是一个插槽，也可以是一个函数。
当作为插槽使用时代码应该如下所示

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
[{
  title: "customRender|slot-scope",
  dataIndex: '',
  scopedSlots: {
    customRender: "customRender"
  }
},{
  title: "customRender|slot-scope",
  dataIndex: '',
  slots: {
    customRender: "customRender"
  }
}]
```

从上边了解到的插槽知识可以知道**作用域插槽的优先级高于静态插槽**也就是说，在一个列中分别配置了键值相等的静态插槽和作用域插槽，将优先显示作用域插槽的内容
当作为函数使用时，代码应该如下所示

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
[{
  title: '游戏特点',
  dataIndex: 'desc',
  customRender: (text, record, index) => {
    if (index == 1) {
      return <div> {text} <span style="color:blue"> @小院不小</span></div>
    }
    return {
      attrs:{},
      props:{},
      class:{},
      style:{},
      children: text
    }
  }
}]
```

两种返回值组件通过`isInvalidRenderCellText`函数判断。判断是否是`jsx`的方式主要代码如下

``` javascript
// 公众号:小院不小 date 20210205 wx:464884492
function isValidElement(element) {
  return (
    element &&
    typeof element === 'object' &&
    'componentOptions' in element &&
    'context' in element &&
    element.tag !== undefined
  ); 
}
```

通过上边的说明，我们就能很好的使用`customRender`属性了。不过我们还是有必要了解一下，这段属性对应源代码逻辑。在文件`components\vc-table\src\TableCell.jsx` 对应的代码片段如下

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
if (customRender) {
  text = customRender(text, record, index, column);
  if (isInvalidRenderCellText(text)) {
    tdProps.attrs = text.attrs || {};
    tdProps.props = text.props || {};
    tdProps.class = text.class;
    tdProps.style = text.style;
    colSpan = tdProps.attrs.colSpan;
    rowSpan = tdProps.attrs.rowSpan;
    text = text.children;
  }
}

if (column.customCell) {
  tdProps = mergeProps(tdProps, column.customCell(record, index));
}
```

#### 5. 总结
ant的组件很灵活，很多需要通过扩展来实现一些特殊的功能.`customRender`和`customCell`都可以实现自定义列信息。在什么场景下使用，还需要根据不同业务诉求。比如我要改变列字体，颜色等，我们就优先考虑`customCell`.根据上面的介绍这里有一个面试题代码如下

```javascript
// 公众号:小院不小 date 20210205 wx:464884492
{
  title: "自定义列",
  dataIndex: '',
  customRender:()=>'函数渲染'
   scopedSlots: {
    customRender: "scopedSlots"
  },
  slots: {
    customRender: "slots"
  }
}
```

请问列`自定义列`最终渲染的内容是 
+ A 函数渲染
+ B scopedSlots
+ C slots

如果想知道答案或需要Demo源码请扫描下方的二维码,关注公众号[**小院不小**],回复`ant-table`获取.

![公众号](./images/gzh.png)