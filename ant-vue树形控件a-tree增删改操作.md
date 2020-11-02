### ant-design-vue中tree增删改

#### 1. 使用背景
 
新项目中使用了`ant-design-vue`组件库.该组件库完全根基数据双向绑定的模式实现.只有表单组件提供少量的方法.所以,在使用`ant-design-vue`时,一定要从改变数据的角度去切换UI显示效果.然而,在树形控件`a-tree`的使用上,单从数据驱动上去考虑,感体验效果实在不好.

#### 2. 当前痛点

通过阅读官方帮助文档,针对树形控件数据绑定.需要将数据构造成一个包含`children,title,key`属性的大对象.这样一个对象,要么通过后端构造好这样的json对象,要么就是后端给前端一个json数组,前端根据上下级关系构建这么一个树形对象.数据绑定好,就可以成功的渲染成我们想要的UI效果了.可痛点在哪里呢?

* 树形加载成功后,我要向当前的树形添加一个同级以及下级节点该如何操作(增)
* 树形加载成功后,我要修改任意一个树形节点该如何操作(改)
* 树形加载成功后,我要删除一个树形节点该如何操作(删)

以上操作,都要求不重新加载树形控件条件下完成.经过测试整理出了三个可行方案

1. 数据驱动
2. 作用域插槽
3. 节点事件

![三种方案截图](/images/antvue/treedemoall.png)

#### 3. 数据驱动实现树形节点增删改

我们可以在帮助文档中找到名为`selectedKeys(.sync)`属性,`sync`表示该属性支持双向操作.但是,这里仅仅获取的是一个`key`值,并不是需要的绑定对象.所以,需要通过这key值找到这个对象.**需要找这个对象就相当恶心了**

1. 如果后端返回是构建好的数据,需要遍历这个树形数据中找到和这个key值对应的对象.我能想到的就是通过顶层节点递归查找.可是控件都渲染完成了,都知道每个节点的数据.我为什要重新查找一遍呢???
2. 如果后端返回的仅仅是一个数组,这个刚才有提到需要重新构建这部分数据为对象.这样查找这个对象又分两种情况
   a. 如果列表数据和构建后树形对象采用克隆的方式,也就是列表中对象的地址和树形中相同key值对象的地址不同.需要通过方法1遍历重新构造后的树形数据
   b. 如果列表数据中的对象和构建后对应的节点是相同的对象地址.可以直接查找这个列表数据得到对应的对象.
  
所以,恶心的地方就在于**构建好一个树,我又得遍历这个树查找某个节点**,或者采用方案b这种**空间换时间**的做法

这里我们假设数据,已经是构建成树形的数据格式.要实现数据驱动的首要任务需要完成两个核心方法

1. 根据当前节点key值查找节点对象`getTreeDataByKey`
2. 根据当前节点key值查找父级节点children集合`getTreeParentChilds`

两个方法代码分别如下

```javascript
// author:herbert date:20201024 qq:464884492
// 根据key获取与之相等的数据对象
getTreeDataByKey(childs = [], findKey) {
   let finditem = null;
   for (let i = 0, len = childs.length; i < len; i++) {
     let item = childs[i]
     if (item.key !== findKey && item.children && item.children.length > 0) {
       finditem = this.getTreeDataByKey(item.children, findKey)
     }
     if (item.key == findKey) {
       finditem = item
     }
     if (finditem != null) {
       break
     }
   }
   return finditem
 },
// author:herbert date:20201024 qq:464884492
// 根据key获取父级节点children数组
getTreeParentChilds(childs = [], findKey) {
   let parentChilds = []
   for (let i = 0, len = childs.length; i < len; i++) {
     let item = childs[i]
     if (item.key !== findKey && item.children && item.children.length > 0) {
       parentChilds = this.getTreeParentChilds(item.children, findKey)
     }
     if (item.key == findKey) {
       parentChilds = childs
     }
     if (parentChilds.length > 0) {
       break
     }
   }
   return parentChilds
},
```

##### 3.1 添加同级节点

添加同级节点,需要把新增加的数据,添加到当前选中节点的父级的`children`数组中.所以,添加节点的难点在如何找到当前选中节点的绑定对象的父级对象.页面代码如下

```html
<!-- author:herbert date:20201030 qq:464884492-->
<a-card style="width: 450px;height:550px;float: left;">
<div slot="title">
  <h2>树形操作(纯数据驱动)<span style="color:blue">@herbert</span></h2>
  <div>
    <a-button @click="dataDriveAddSame">添加同级</a-button>
    <a-divider type="vertical" />
    <a-button @click="dataDriveAddSub">添加下级</a-button>
    <a-divider type="vertical" />
    <a-button @click="dataDriveModify">修改</a-button>
    <a-divider type="vertical" />
    <a-button @click="dataDriveDelete">删除</a-button>
  </div>
</div>
<a-tree :tree-data="treeData" :defaultExpandAll="true"
        :selectedKeys.sync="selectKeys" showLine />
<img src="./assets/gamelogo.png" width="100%" style="margin-top:20px" />
</a-card>
``` 

从页面代码中可以看出,再树上绑定了两个属性`tree-data`,`selectedKeys`,这里我们就可以通过`selectedKeys`绑定值,获取到树形当前选择的`key`值.然后使用方法`getTreeParentChilds`就可以实现同级添加.所以,对用的`dataDriveAddSame`代码实现如下

```javascript
// author:herbert date:20201030 qq:464884492
dataDriveAddSame() {
   let parentChilds = this.getTreeParentChilds(this.treeData, this.selectKeys[0])
   parentChilds.forEach(item => console.log(item.title));
   parentChilds.push({
     title: '地心侠士,会玩就停不下来',
     key: new Date().getTime()
   })
},
```

##### 3.2 添加下级

有了上边的基础,添加下级就很简单了.唯一需要注意的地方就是**获取到的对象children属性可能不存在,此时我们需要$set方式添加属性**`dataDriveAddSub`代码实现如下

```javascript
// author:herbert date:20201030 qq:464884492
dataDriveAddSub() {
   let selectItem = this.getTreeDataByKey(this.treeData, this.selectKeys[0])
   if (!selectItem.children) {
     this.$set(selectItem, "children", [])
   }
   selectItem.children.push({
     title: 地心侠士,值得你来玩,
     key: new Date().getTime()
   })
   this.$forceUpdate()
   },
```

##### 3.3 修改节点

能获取到绑定对象,修改节点值也变得简单了,同添加下级一样使用`getTreeDataByKey`获取当前对象,然后直接修改值就是了.`dataDriveModify`代码实现如下

```javascript
// author:herbert date:20201030 qq:464884492
dataDriveModify() {
   let selectItem = this.getTreeDataByKey(this.treeData, this.selectKeys[0])
   selectItem.title = '扫码下方二维码,开始地心探险之旅'
},
```

##### 3.4 删除节点

删除和添加同级一样,需要找到父级节点`children`数组,已经当前对象在父级数组中对应的索引.`dataDriveDelete`代码实现如下

```javascript
// author:herbert date:20201030 qq:464884492
dataDriveDelete() {
   let parentChilds = this.getTreeParentChilds(this.treeData, this.selectKeys[0])
   let delIndex = parentChilds.findIndex(item => item.key == this.selectKeys[0])
   parentChilds.splice(delIndex, 1)
},
```

#### 4. 通过插槽方式树形节点增删改

在`ant-tree`的api中,树形节点属性`title`类型可以是字符串,也可以是插槽[`string|slot|slot-scope`],我么这里需要拿到操作对象,这里使用作用域插槽,对应的页面代码如下

```html
<!-- author:herbert date:20201030 qq:464884492-->
<a-card style="width: 450px;height:550px;float: left;">
<div slot="title">
  <h2>树形操作(采用作用域插槽)</h2>
  <div>
    采用作用域插槽,操作按钮统一放置到树上<span style="color:blue">@小院不小</span>
  </div>
</div>
<a-tree ref="tree1" :tree-data="treeData1" :defaultExpandAll="true" :selectedKeys.sync="selectKeys1" showLine blockNode>
  <template v-slot:title="nodeData">
    <span>{{nodeData.title}}</span>
    <a-button-group style="float:right">
      <a-button size="small" @click="slotAddSame(nodeData)" icon="plus-circle" title="添加同级"></a-button>
      <a-button size="small" @click="slotAddSub(nodeData)" icon="share-alt" title="添加下级"></a-button>
      <a-button size="small" @click="slotModify(nodeData)" icon="form" title="修改"></a-button>
      <a-button size="small" @click="slotDelete(nodeData)" icon="close-circle" title="删除"></a-button>
    </a-button-group>
  </template>
</a-tree>
<img src="./assets/gamelogo.png" width="100%" style="margin-top:20px" />
</a-card>
```
##### 4.1 添加同级

采用插槽的方式拿到对象,其实是当前节点对应的属性值,并且是一个浅复制的副本.在源码`vc-tree\src\TreeNode.jsx`中的`renderSelector`可以找到如下一段代码

```javascript
const currentTitle = title;
let $title = currentTitle ? (
  <span class={`${prefixCls}-title`}>
    {typeof currentTitle === 'function'
      ? currentTitle({ ...this.$props, ...this.$props.dataRef }, h)
      : currentTitle}
  </span>
) : (
  <span class={`${prefixCls}-title`}>{defaultTitle}</span>
);
```
从这段代码,可以看到一个dataRef.但是在官方的帮助文档中完全没有这个属性的介绍.不知道者算不算给愿意看源码的同学的一种福利.不管从代码层面,还是调试结果看.通过作用域得到的对象,没有父级属性所以**不能实现同级添加**.`slotAddSame`代码如下

```javascript
// author:herbert date:20201030 qq:464884492
slotAddSame(nodeItem) {
console.log(nodeItem)
this.$warn({ content: "采用插槽方式,找不到父级对象,添加失败!不要想了,去玩地心侠士吧" })
},
```

##### 4.2 添加下级

虽然得到了对象,但是只是一个副本.所以设置`children`也是没用的!!

```javascript
// author:herbert date:20201030 qq:464884492
slotAddSub(nodeItem) {
if (!nodeItem.children) {
  console.log('其实这个判断没有用,这里仅仅是一个副本')
  this.$set(nodeItem, "children", [])
}
nodeItem.children.push({
  title: this.addSubTitle,
  key: new Date().getTime(),
  scopedSlots: { title: 'title' },
  children: []
})
},
```

##### 4.3 修改节点

修改一样也不能实现,不过上边有提到`dataRef`,这里简单使用下,可以实现修改title值.

```javascript
// author:herbert date:20201030 qq:464884492
slotModify(nodeItem) {
   console.log(nodeItem)
   console.log('nodeItem仅仅时渲染Treenode属性的一个浅复制的副本,直接修改Title没有用')
   nodeItem.title = '这里设置是没有用的,去玩游戏休息一会吧'
   // 这里可以借助dataRef 更新
   nodeItem.dataRef.title = nodeItem.title
 },
```

##### 4.4 删除节点

很明显,删除也是不可以的.

```javascript
// author:herbert date:20201030 qq:464884492
slodDelete(nodeItem) {
console.log(nodeItem)
this.$warn({ content: "采用插槽方式,找不到父级对象,删除失败!很明显,还是去玩地心侠士吧" })
delete nodeItem.dataRef
},
```
#### 5. 树形事件结合dataRef实现

上边通过插槽方式,仅仅实现了修改功能.特别失望有没有.不过从设计的角度去考虑,给你对象仅仅是帮助你做自定义渲染,就好多了.接续读官方Api找到**事件**其中的`select`事件提供的值,又给了我们很大的发挥空间.到底有多大呢,我们去源码看看.首先我们找到触发`select`事件代码在`components\vc-tree\src\TreeNode.jsx`文件中,具体代码如下

```javascript
onSelect(e) {
   if (this.isDisabled()) return;
   const {
     vcTree: { onNodeSelect },
   } = this;
   e.preventDefault();
   onNodeSelect(e, this);
},
```
从代码中可以看到`TreeNode`onSelect其实是调用`Tree`中的onNodeSelected方法,我们到`components\vc-tree\src\Tree.jsx`找到对应的代码如下

```javascript
 onNodeSelect(e, treeNode) {
   let { _selectedKeys: selectedKeys } = this.$data;
   const { _keyEntities: keyEntities } = this.$data;
   const { multiple } = this.$props;
   const { selected, eventKey } = getOptionProps(treeNode);
   const targetSelected = !selected;
   // Update selected keys
   if (!targetSelected) {
     selectedKeys = arrDel(selectedKeys, eventKey);
   } else if (!multiple) {
     selectedKeys = [eventKey];
   } else {
     selectedKeys = arrAdd(selectedKeys, eventKey);
   }

   // [Legacy] Not found related usage in doc or upper libs
   const selectedNodes = selectedKeys
     .map(key => {
       const entity = keyEntities.get(key);
       if (!entity) return null;

       return entity.node;
     })
     .filter(node => node);

   this.setUncontrolledState({ _selectedKeys: selectedKeys });

   const eventObj = {
     event: 'select',
     selected: targetSelected,
     node: treeNode,
     selectedNodes,
     nativeEvent: e,
   };
   this.__emit('update:selectedKeys', selectedKeys);
   this.__emit('select', selectedKeys, eventObj);
},
```
结合两个方法,从Tree节点eventObj对象中可以知道组件`select`不仅把Tree节点渲染TreeNode缓存数据`selectedNodes`以及对应实实在在的TreeNode节点`node`,都提供给了调用方.有了这个node属性,我们就可以拿到对应节点的上下级关系

接下来我们说说这个再帮助文档上没有出现的`dataRef`是个什么鬼.
找到文件`components\tree\Tree.jsx`在对应的`render`函数中我们可以知道Tree需要向vc-tree组件传递一个`treeData`属性,我们最终使用的传递节点数据也是这个属性名.两段关键代码如下

```javascript
render(){
   ...
   let treeData = props.treeData || treeNodes;
    if (treeData) {
      treeData = this.updateTreeData(treeData);
    }
   ...
   if (treeData) {
      vcTreeProps.props.treeData = treeData;
   }
   return <VcTree {...vcTreeProps} />;
}
```
从上边代码可以看到,组件底层调用方法`updateTreeData`对我们传入的数据做了处理,这个方法关键代码如下

```javascript
updateTreeData(treeData) {
   const { $slots, $scopedSlots } = this;
   const defaultFields = { children: 'children', title: 'title', key: 'key' };
   const replaceFields = { ...defaultFields, ...this.$props.replaceFields };
   return treeData.map(item => {
     const key = item[replaceFields.key];
     const children = item[replaceFields.children];
     const { on = {}, slots = {}, scopedSlots = {}, class: cls, style, ...restProps } = item;
     const treeNodeProps = {
       ...restProps,
       icon: $scopedSlots[scopedSlots.icon] || $slots[slots.icon] || restProps.icon,
       switcherIcon:
         $scopedSlots[scopedSlots.switcherIcon] ||
         $slots[slots.switcherIcon] ||
         restProps.switcherIcon,
       title:
         $scopedSlots[scopedSlots.title] ||
         $slots[slots.title] ||
         restProps[replaceFields.title],
       dataRef: item,
       on,
       key,
       class: cls,
       style,
     };
     if (children) {
       // herbert 20200928 添加属性只能操作叶子节点
       if (this.onlyLeafEnable === true) {
         treeNodeProps.disabled = true;
       }
       return { ...treeNodeProps, children: this.updateTreeData(children) };
     }
     return treeNodeProps;
   });
 },
}
```
从这个方法中我们看到,在`treeNodeProps`属性找到了`dataRef`属性,它的值就是我们传入`treeData`中的数据项,所以这个属性是支持**双向绑定**的哦.这个`treeNodeProps`最终会渲染到`components\vc-tree\src\TreeNode.jsx`,组件中去.

弄清楚这两个知识点后,我们要做的操作就变得简单了.事件驱动页面代码如下

```html
<!-- author:herbert date:20201101 qq:464884492 -->
<a-card style="width: 450px;height:550px;float: left;">
   <div slot="title">
     <h2>树形事件(结合dataRef)<span style="color:blue">@464884492</span></h2>
     <div>
       <a-button @click="eventAddSame">添加同级</a-button>
       <a-divider type="vertical" />
       <a-button @click="eventAddSub">添加下级</a-button>
       <a-divider type="vertical" />
       <a-button @click="eventModify">修改</a-button>
       <a-divider type="vertical" />
       <a-button @click="eventDelete">删除</a-button>
     </div>
   </div>
   <a-tree :tree-data="treeData2" @select="onEventTreeNodeSelected" :defaultExpandAll="true" :selectedKeys.sync="selectKeys2" showLine />
   <img src="./assets/gamelogo.png" width="100%" style="margin-top:20px" />
</a-card>
```
既然是通过事件驱动,我们首先得注册对应得事件,代码如下

```javascript
// author:herbert date:20201101 qq:464884492 
onEventTreeNodeSelected(seleteKeys, e) {
   if (e.selected) {
     this.eventSelectedNode = e.node
     return
   }
   this.eventSelectedNode = null
},
```
在事件中,我们保存当前选择TreeNode方便后续的增加修改删除

##### 5.1 添加同级

 利用vue虚拟dom,找到父级

```javascript
// author:herbert date:20201101 qq:464884492 
eventAddSame() {
   // 查找父级
   let dataRef = this.eventSelectedNode.$parent.dataRef
   if (!dataRef.children) {
     this.$set(dataRef, 'children', [])
   }
   dataRef.children.push({
     title: '地心侠士好玩,值得分享',
     key: new Date().getTime()
   })
 },
```

##### 5.2 添加下级

直接使用对象`dataRef`,注意`children`使用`$set`方法

```javascript
// author:herbert date:20201101 qq:464884492
eventAddSub() {
   let dataRef = this.eventSelectedNode.dataRef
   if (!dataRef.children) {
     this.$set(dataRef, 'children', [])
   }
   dataRef.children.push({
     title: '地心侠士,还有很多bug欢迎吐槽',
     key: new Date().getTime(),
     scopedSlots: { title: 'title' },
     children: []
   })
   }, 
```

##### 5.3 修改节点

修改直接修改`dataRef`对应的值

```javascript
// author:herbert date:20201101 qq:464884492 
eventModify() {
   let dataRef = this.eventSelectedNode.dataRef
   dataRef.title = '地心侠士,明天及改完bug'
   },
```

##### 5.4 删除节点

通过vue虚拟dom找到父级`dataRef`,从`children`中移除选择项就可以

```javascript
// author:herbert date:20201101 qq:464884492 
 eventDelete() {
   let parentDataRef = this.eventSelectedNode.$parent.dataRef
   // 判断是否是顶层
   const children = parentDataRef.children
   const currentDataRef = this.eventSelectedNode.dataRef
   const index = children.indexOf(currentDataRef)
   children.splice(index, 1)
 }
```
#### 6. 总结

这个知识点,从demo到最终完成.前前后后花费快一个月的时间.期间查源码,做测试,很费时间.不过把这个点说清楚了,我觉得很值得!如果需要Demo源码请扫描下方的二维码,关注公众号[**小院不小**],回复`ant-tree`获取.关于`ant-desgin-vue`这套组件库来说相比我以前使用的`easyUi`组件库来说,感觉跟适合网页展示一类.做一些后台系统,需要提供大量操作,感觉还比较乏力

![公众号](./images/gzh.png)