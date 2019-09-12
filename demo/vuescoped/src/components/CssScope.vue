<template>
  <div>
    <van-circle v-model="currentRate" :rate="90" :speed="100" :text="text" />
  </div>
</template>
<style lang="less" scoped>
.van-circle {
  /deep/ .van-circle__text {
    color: blue;
  }
}
</style>

<script>
import { Circle } from 'vant';
export default {
  components: {
    [Circle.name]: Circle
  },
  data() {
    return {
      currentRate: 0
    };
  },
  computed: {
    text() {
      return this.currentRate.toFixed(0) + '%'
    }
  }
}
</script>
