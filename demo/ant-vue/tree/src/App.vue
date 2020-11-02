<template>
  <div style="background:#ECECEC;overflow: hidden;padding:20px">
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
      <a-tree :tree-data="treeData" :defaultExpandAll="true" :selectedKeys.sync="selectKeys" showLine />
      <img src="./assets/gamelogo.png" width="100%" style="margin-top:20px" />
    </a-card>
    <a-divider type="vertical" style="float: left;" />
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
    <a-divider type="vertical" style="float: left;" />
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
  </div>
</template>
<script>

const treeData = [
  {
    title: '我的小游戏',
    key: '0-0',
    children: [
      {
        title: '地心侠士',
        key: '0-0-0',
        children: [
          { title: '益智类消除类', key: '0-0-0-0' },
          { title: '道具丰富,完整的故事情节', key: '0-0-0-1' },
        ],
      },
      {
        title: '坦克侠',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: '碰撞消除类' }],
      },
    ],
  },
];

const treeData1 = [
  {
    title: '我的小游戏',
    key: '0-0',
    scopedSlots: { title: 'title' },
    children: [
      {
        title: '地心侠士',
        key: '0-0-0',
        scopedSlots: { title: 'title' },
        children: [
          { title: '益智类消除类', key: '0-0-0-0', scopedSlots: { title: 'title' }, children: [] },
          { title: '道具丰富,完整的故事情节', key: '0-0-0-1', scopedSlots: { title: 'title' }, children: [] },
        ],
      },
      {
        title: '坦克侠',
        key: '0-0-1',
        scopedSlots: { title: 'title' },
        children: [
          { key: '0-0-1-0', title: '碰撞消除类', scopedSlots: { title: 'title' }, children: [] },
          { key: '0-0-1-1', title: '测试不初始children属性', scopedSlots: { title: 'title' } },
        ],
      },
    ],
  },
];

const treeData2 = [
  {
    title: '我的小游戏',
    key: '0-0',
    children: [
      {
        title: '地心侠士',
        key: '0-0-0',
        children: [
          { title: '益智类消除类', key: '0-0-0-0' },
          { title: '道具丰富,完整的故事情节', key: '0-0-0-1' },
        ],
      },
      {
        title: '坦克侠',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: '碰撞消除类' }],
      },
    ],
  },
];

export default {
  data() {
    return {
      treeData,
      treeData1,
      treeData2,
      selectKeys: ['0-0-0'],
      selectKeys1: ['0-0-0'],
      selectKeys2: ['0-0-0'],
      eventSelectedNode: null,
      addSameTitle: '地心侠士,会玩就停不下来',
      addSubTitle: '地心侠士,值得你来玩',
      editTitle: '扫码游戏开始',
    }
  },
  methods: {
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
    dataDriveAddSame() {
      let parentChilds = this.getTreeParentChilds(this.treeData, this.selectKeys[0])
      parentChilds.forEach(item => console.log(item.title));
      parentChilds.push({
        title: this.addSameTitle,
        key: new Date().getTime()
      })
    },
    dataDriveAddSub() {
      let selectItem = this.getTreeDataByKey(this.treeData, this.selectKeys[0])
      if (!selectItem.children) {
        this.$set(selectItem, "children", [])
      }
      selectItem.children.push({
        title: this.addSubTitle,
        key: new Date().getTime()
      })
      this.$forceUpdate()
    },
    dataDriveModify() {
      let selectItem = this.getTreeDataByKey(this.treeData, this.selectKeys[0])
      selectItem.title = this.editTitle
    },
    dataDriveDelete() {
      let parentChilds = this.getTreeParentChilds(this.treeData, this.selectKeys[0])
      let delIndex = parentChilds.findIndex(item => item.key == this.selectKeys[0])
      parentChilds.splice(delIndex, 1)
    },

    slotAddSame(nodeItem) {
      console.log(nodeItem)
      this.$warn({ content: "采用插槽方式,找不到父级对象,添加失败!请通过添加下级添加" })
    },
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
    slotModify(nodeItem) {
      console.log(nodeItem)
      console.log('nodeItem仅仅时渲染Treenode属性的一个浅复制的副本,直接修改Title没有用')
      nodeItem.title = this.editTitle
      // 这里可以借助dataRef 更新
      nodeItem.dataRef.title = nodeItem.title
    },
    slotDelete(nodeItem) {
      console.log(nodeItem)
      this.$warn({ content: "采用插槽方式,找不到父级对象,删除失败!请通过添加下级添加" })
      delete nodeItem.dataRef
    },

    onEventTreeNodeSelected(seleteKeys, e) {
      console.log(seleteKeys, e)
      if (e.selected) {
        this.eventSelectedNode = e.node
        return
      }
      this.eventSelectedNode = null
    },
    eventAddSame() {
      // 查找父级
      let dataRef = this.eventSelectedNode.$parent.dataRef
      if (!dataRef.children) {
        this.$set(dataRef, 'children', [])
      }
      dataRef.children.push({
        title: this.addSameTitle,
        key: new Date().getTime()
      })
    },
    eventAddSub() {
      let dataRef = this.eventSelectedNode.dataRef
      if (!dataRef.children) {
        this.$set(dataRef, 'children', [])
      }
      dataRef.children.push({
        title: this.addSubTitle,
        key: new Date().getTime(),
        scopedSlots: { title: 'title' },
        children: []
      })
    },
    eventModify() {
      let dataRef = this.eventSelectedNode.dataRef
      dataRef.title = this.editTitle
    },
    eventDelete() {
      let parentDataRef = this.eventSelectedNode.$parent.dataRef
      // 判断是否是顶层
      const children = parentDataRef.children
      const currentDataRef = this.eventSelectedNode.dataRef
      const index = children.indexOf(currentDataRef)
      children.splice(index, 1)
    }
  }
}
</script>