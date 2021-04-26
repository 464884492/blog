<template>
  <div style="width:1000px;height:500px;margin:20px auto;border:solid 1px red;">
    <a-table :columns="tableColumn" :data-source="tableData" :scroll="{y:500,x:400}" rowKey="field0" bordered :footer="footer" :pagination="false" :title="()=>'滚动加载'">
    </a-table>
  </div>
</template>
<script>
/* eslint-disable */
/*
   components: PropTypes.shape({
        table: PropTypes.any,
        header: PropTypes.shape({
          wrapper: PropTypes.any,
          row: PropTypes.any,
          cell: PropTypes.any,
        }),
        body: PropTypes.shape({
          wrapper: PropTypes.any,
          row: PropTypes.any,
          cell: PropTypes.any,
        }),
      }),
*/
import infiniteScroll from 'vue-infinite-scroll';
export default {
  directives: { infiniteScroll },
  data() {
    const tableData = []
    const tableColumn = []

    for (let i = 0; i < 10; i++) {
      let fixed = false;
      if (i < 2) {
        fixed = "left"
      }
      if (i > 8) {
        fixed = "right"
      }
      tableColumn.push({ title: `测试列${i}`, dataIndex: `field${i}`, fixed: fixed, width: 150 })
    }
    for (let i = 0; i < 100; i++) {
      let data = {};
      for (let a of tableColumn) {
        let { dataIndex: filed } = a
        data[filed] = `测试数据${i}-${filed}`
      }
      tableData.push(data)
    }
    return {
      tableData,
      tableColumn,
      footer: function (currentPageData) {
        console.log(currentPageData)
        return <table class="tablefooter"><tbody><tr><td>1232</td></tr></tbody></table>
      }
    }
  }
}

</script>