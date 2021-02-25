<template>
  <section class="zs-view" :class="bgClass?bgClass:''">
    <view-header
      v-if="hasHead"
      :title="title"
      :hide-back-bar="hideBackBar"
      :handle-back="handleBack"
      :link="link"
      :link-text="linkText"
      :half="half"
      :headClass="headClass"
    >
      <template slot="leftBtn">
        <slot name="leftBtn"></slot>
      </template>
      <template slot="title">
        <slot name="title"></slot>
      </template>
      <template slot="rightBtn">
        <slot name="rightBtn"></slot>
      </template>
    </view-header>
    <div :class="style">
      <template>
        <slot name="content"></slot>
      </template>
    </div>
    <footer v-if="hasFoot" class="footer">
      <slot name="foot"></slot>
    </footer>
  </section>
</template>
<script>
import viewHeader from "./viewHeader";
export default {
  name: "zsView",
  components: {
    viewHeader,
  },
  data () {
    return {
      observer: null,
      currentIndex: 0,
      tabInputList: [],
      inputList: [],
      suportTypes: ['text', 'tel', 'email', 'url', 'number', 'search'],
      lastActiveElement: null
    }
  },
  props: {
    title: String,
    noScroll: Boolean,
    hideNav: Boolean,
    hideBackBar: Boolean,
    handleBack: Function,
    bgClass: String,
    headClass: String,
    linkText: String,
    link: String,
    isCheckBoard: {//是否检查android键盘，因为百度键盘在切换的时候存在不更新type类型的问题
      type: Boolean,
      default: false
    },
    half: {//是否为半屏（如选择框、选卡面板等半屏组件header统一改为圆角）
      type: Boolean,
      default: false
    }
  },
  computed: {
    style () {
      let css = "zs-content";
      css += this.hideNav ? "" : " has-header";
      css += this.$slots.foot ? " has-footer" : "";
      css += this.noScroll ? " overflow" : "";
      return css;
    },
    hasHead () {
      return !this.hideNav;
    },
    hasFoot () {
      return !!this.$slots.foot;
    }
  },
  methods: {
    initEvent () {
      let list = this.$el.querySelectorAll('input[tabindex],div[tabindex],label[tabindex]');
      let submit = this.$el.querySelector('button[submit]');
      if (this.tabInputList.length === list.length) return;
      this.tabInputList.length = 0;
      list.forEach((input, index) => {
        let tabindex = input.tabIndex;
        if (input.nodeName.toLowerCase() === 'input') {
          input.dataset.tabindex = tabindex;
        } else {
          input = input.querySelector('input');
          if (!input) return;
          input.dataset.tabindex = tabindex;
        }
        this.tabInputList.push(input);
        input.removeEventListener('keyup', this.checkInput);
        input.addEventListener('keyup', this.checkInput);
        input.removeEventListener('focus', this.setIndex);
        input.addEventListener('focus', this.setIndex);
      });
      this.tabInputList.sort((x, y) => {
        return x.dataset.tabindex - y.dataset.tabindex;
      });
      this.checkInputKeyboard();
    },
    checkEvent (list) {
      let setEvent = (node) => {
        let input;
        let index;
        if (node.nodeName.toLowerCase() === 'input') {
          input = node;
        } else {
          input = node.querySelector('input');
        }
        if (!input) return;
        if (this.tabInputList.includes(input)) return;
        input.dataset.tabindex = node.tabIndex;
        this.tabInputList.push(input);
        this.tabInputList.sort((x, y) => {
          return x.dataset.tabindex - y.dataset.tabindex;
        });
        index = this.tabInputList.indexOf(input);
        input.removeEventListener('keyup', this.checkInput);
        input.addEventListener('keyup', this.checkInput);
        input.removeEventListener('focus', this.setIndex);
        input.addEventListener('focus', this.setIndex);
      }
      list.forEach(node => {
        let input;
        // 注释节点没有这个方法
        if (!node.getAttribute) return;
        if (node.getAttribute('tabindex')) {
          setEvent(node);
        } else {
          let list = node.querySelectorAll('*[tabindex]');
          list.forEach(setEvent);
        }
        this.checkInputKeyboard(node);
      })
    },
    // 处理android百度键盘在切换时不跟随type类型变化的问题
    checkInputKeyboard (node) {
      let setEvent = (input) => {
        if (this.inputList.includes(input)) return;
        if (this.suportTypes.includes(input.type)) {
          this.inputList.push(input);
          input.removeEventListener('blur', setActive);
          input.addEventListener('blur', setActive);
          input.removeEventListener('focus', checkKeyboard);
          input.addEventListener('focus', checkKeyboard);
        }
      }
      let setActive = (e) => {
        this.lastActiveElement = e.target;
        setTimeout(() => {
          this.lastActiveElement = document.activeElement;
        }, 100);
      }
      let checkKeyboard = (e) => {
        let nodeName = (this.lastActiveElement?.nodeName || '').toLowerCase();
        if (nodeName !== 'input') return;
        let type = this.lastActiveElement.type;
        if (this.suportTypes.includes(type)) {
          let input = e.target;
          input.blur();
          input.removeEventListener('focus', checkKeyboard);
          setTimeout(() => {
            input.focus();
            input.addEventListener('focus', checkKeyboard);
          });
        }
      }
      node = node || this.$el;
      // 注释节点不处理
      if (node.nodeType === 8) return;
      if (node.nodeName.toLowerCase() === 'input') {
        setEvent(node);
      } else {
        let list = node.querySelectorAll('input');
        list.forEach(setEvent)
      }
    },
    setIndex (e) {
      let index = this.tabInputList.indexOf(e.target);
      if (index === -1) return;
      this.currentIndex = index;
    },
    checkInput (e) {
      if (!e.key) return;
      if (e.key.toLowerCase() !== 'enter') return;
      let next = this.tabInputList[this.currentIndex + 1];
      if (next) {
        next.focus();
      } else {
        e.target.blur();
        let submit = this.$el.querySelector('button[submit]');
        if (!submit) return;
        let click = new Event('click');
        submit.dispatchEvent(click);
      }
    }
  },
  mounted () {
    this.initEvent();
    this.observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.checkEvent(mutation.addedNodes);
        }
      });
    });
    this.observer.observe(this.$el, {
      attributes: false,
      childList: true,
      subtree: true
    });
  },
  destroyed () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
};
</script>
<style lang="less" scope>
@import '../assets/css/base.less';
.zs-view {
  // position: absolute;
  width: 100%;
  // left: 0;
  // top: 0;
  // right: 0;
  // bottom: 0;
  // overflow: hidden;
  height: 100%;
  height: 100vh;
  z-index: @z-view;
  background-color: @color-main-background;
  overflow: hidden;
}
.zs-content {
  // position: absolute;
  width: 100%;
  // top: 0;
  // right: 0;
  // bottom: 0;
  // left: 0;
  overflow: auto;
  overflow-x: hidden;
  height: 100%;
  z-index: @z-content;
  box-sizing: border-box;
  &.overflow {
    overflow: hidden;
  }
}
.has-header {
  // top: @h-head;
  // padding-top: @h-head;
}
.footer {
  position: absolute;
  width: 100%;
  bottom: 0;
  // height: @h-foot;
  z-index: 100;
}
.has-footer {
  padding-bottom: @h-foot;
}
</style>