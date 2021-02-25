<template>
  <i class="icon-back" @click="back"></i>
</template>
<script>
export default {
  name: "back",
  methods: {
    back() {
      // if (this.handle) {
      //   this.handle();
      // } else if (this.url) {
      //   histories.backTo(this.url);
      // } else {
      //   module.goBack();
      // }
    }
  }
};
</script>
<style lang="less" scoped>
@import "~@/assets/css/base.less";
.icon-back {
  display: inline-block;
  width: 42px;
  height: 100%;
  min-height: @h-head;
  background: url("../assets/images/comp_navi_back.png") no-repeat center center;
  background-size: 20px 20px;
}
</style>