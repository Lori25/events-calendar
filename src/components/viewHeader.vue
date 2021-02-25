<template>
  <header class="view-head font-pingfang" :class="cssClass">
    <back v-if="!hideBackBar" :url="url" :handle="handleBack"></back>
    <p class="title" v-if="!$slots.title">{{title}}</p>
    <p class="title" v-if="$slots.title">
      <slot name="title"></slot>
    </p>
    <a v-if="linkText" class="view-head-button" @click="go">{{linkText}}</a>
    <slot name="leftBtn"></slot>
    <slot name="rightBtn"></slot>
  </header>
</template>
<script>
import back from './back'
export default {
  name: 'viewHeader',
  components: {
    back
  },
  props: {
    url: String,
    title: {
      type: String
    },
    linkText: String,
    link: String,
    hideBackBar: Boolean,
    handleBack: Function,
    half: {//是否为半屏（如选择框、选卡面板等半屏组件header统一改为圆角）
      type: Boolean,
      default: false
    },
    hasBottom: {
      type: Boolean,
      default: false
    },
    headClass: String
  },
  computed: {
    cssClass () {
      let css = '';
      if (this.half) css += 'half';
      if (this.hasBottom) css += ' border-bottom';
      if (this.headClass) css += ` ${this.headClass}`;
      return css;
    }
  },
  methods: {
    go () {
      this.$router.push(this.link);
    }
  },
  watch: {
    title (value) {
      if (value && !this.half) {
        document.title = value;
      }
    }
  },
  mounted () {
    if (this.title && !this.half) {
      document.title = this.title;
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/css/base.less';
.view-head {
  position: absolute;
  top: 0;
  width: 100%;
  height: @h-head;
  z-index: @z-header;
  background-color: @color-white;
  // border-bottom: 0.5px solid @color-border;
  &.half {
    border-bottom: none;
    background-image: none;
    height: @h-head-big;
    .radius-half-page;
  }
}
.title {
  color: @color-title;
  font-size: @font-title;
  line-height: @h-head;
  position: absolute;
  top: 0;
  left: @dis-title-both;
  right: @dis-title-both;
  text-align: center;
  .font-pingfang {
    font-family: 'PingFangSC-Medium';
  }
}
.view-head-button {
  position: absolute;
  right: @dis-left-right;
  line-height: @h-head;
  color: @color-black;
}
.view-head {
  &.half {
    .title,
    .view-head-button {
      line-height: @h-head-big;
    }
  }
}
.header-background {
  background-color: @color-yellow;
}
</style>