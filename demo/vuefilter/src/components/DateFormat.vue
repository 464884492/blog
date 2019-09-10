<template>
  <div>
    <dl>
      <dt>在template中使用filter</dt>
      <dd>当前时间:{{curDate|DateFmt('yyyy-MM-dd hh:mm:ss')}}</dd>
      <dt>通过Vue.filter返回方法，直接在代码调用</dt>
      <dd>当前时间:{{curDateVueFilter}}</dd>
      <dt> 通过$options原型调用</dt>
      <dd>当前时间:{{curDateOptFilter}}</dd>
      <dt> 通过import引入方法调用</dt>
      <dd>当前时间:{{curDateImportFilter}}</dd>
    </dl>
  </div>
</template>

<script>
import Vue from 'vue';
import { DateFmt } from '@/filters/DateFmt.js';
export default {
  data() {
    return {
      curDate: new Date(),
      curDateVueFilter: Vue.filter("DateFmt")(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      curDateOptFilter: this.$options.filters.DateFmt(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      curDateImportFilter: DateFmt(new Date(), 'yyyy-MM-dd hh:mm:ss')
    }
  },
  mounted() {
    setInterval(() => {
      this.curDate = new Date();
      this.curDateVueFilter = Vue.filter("DateFmt")(new Date(), 'yyyy-MM-dd hh:mm:ss')
      this.curDateOptFilter = this.$options.filters.DateFmt(new Date(), 'yyyy-MM-dd hh:mm:ss')
      this.curDateImportFilter = DateFmt(new Date(), 'yyyy-MM-dd hh:mm:ss')
    }, 1000);
  },

}
</script>

