<template>
  <div style="overflow: hidden;padding:20px 300px;">
    <a-table :columns="tableColumn" :data-source="tableData" bordered>
      <i slot="customRender" slot-scope="text,record,index">{{record.title+"#"+(index+1)}}</i>
    </a-table>
  </div>
</template>
<script>

import gameimg from "./assets/gamelogo.png"

export default {
  data() {
    const tableData = [
      { title: "地心侠士", type: "益智类消除类", desc: "道具丰富,完整的故事情节" },
      { title: "坦克侠", type: "碰撞消除类", desc: "好玩易上手" }
    ];
    const tableColumn = [
      {
        title: '游戏名称',
        dataIndex: 'title'
      }, {
        title: '游戏类型',
        dataIndex: 'type'
      }, {
        title: '游戏特点',
        dataIndex: 'desc',
        customRender: (text, record, index) => {
          if (index == 1) {
            return <div> {text} <span style="color:blue"> @小院不小</span></div>
          }
          return {
            children: text
          }
        }
      },
      {
        title: "customRender|函数",
        dataIndex: '',
        customRender: (text, record, index) => {
          return <div>
            <b>{record.title + "#" + (index + 1)}</b>
            <img src={gameimg} height="50px"></img>
          </div>
        }
      },
      {
        title: "customRender|slot-scope",
        dataIndex: '',
        customRender: () => 123,
        scopedSlots: {
          customRender: "customRender"
        }
      },
      {
        title: "customCell",
        dataIndex: '',
        customCell: (record, index) => {
          return {
            style: {
              color: 'red',
              fontSize: '14px'
            },
            domProps: {
              innerHTML: record.title + "#" + (index + 1)
            }
          }
        }
      }]
    return {
      tableData,
      tableColumn
    }
  }
}

</script>