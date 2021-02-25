<template>
  <div class="guide-bg" :class="!currStep?'transparent-hide':''" v-if="showGuide">
    <div class="step-1" v-if="currStep == 1">
      <div class="guide-arrow arrow-up" />
      <p class="font-16 color-white text-center">上下滑动切换月份</p>
      <div class="guide-arrow arrow-down" />
      <div class="text-center">
        <button class="font-16" @click="nextStep(2)">我知道了</button>
      </div>
    </div>
    <div class="step-2" v-if="currStep == 2">
      <span class="font-16 color-blue bg-white">同步日历</span>
      <div class="guide-arrow arrow-up" />
      <p class="font-16 color-white text-right">同步金融日历到手机日历</p>
      <div class="text-right">
        <button class="font-16" @click="nextStep(0)">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showGuide: false,
      currStep: 1,
    };
  },
  mounted() {
    let hasShown = localStorage.getItem(
      "hasShowCalendarGuide"
    );
    this.showGuide = !hasShown;
  },

  methods: {
    show() {
      this.showGuide = true;
    },
    hide() {
        setTimeout(()=> {
            this.showGuide = false;
        }, 300)
    },
    nextStep(index) {
        this.currStep = index;
      if (!index) {
          
        localStorage.setItem(
          "hasShowCalendarGuide",
          true
        );
        this.hide();
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/assets/css/base.less";
.guide-bg {
  position: absolute;
  width: 100%;
  height: 100vh;
  background: rgba(41, 48, 64, 0.6);
  top: 0;
  z-index: 100;
    transition: background 0.3s;
  button {
    width: 140px;
    height: 40px;
    background: @color-yellow;
    border: none;
    border-radius: 6px;
  }
  .guide-arrow {
    position: relative;
    display: inline-block;
    width: 38px;
    height: 12px;
    &.arrow-up {
      transform: rotate(90deg);
    }
    &.arrow-down {
      transform: rotate(-90deg);
    }
    &.arrow-right {
      transform: rotate(-180deg);
    }
    &::before {
      content: "";
      position: absolute;
      display: inline-block;
      width: 11px;
      height: 11px;
      box-sizing: border-box;
      border-left: none;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 11px solid white;
    }
    &::after {
      content: "";
      position: absolute;
      display: inline-block;
      width: 38px;
      height: 2px;
      background: white;
      top: 4px;
      left: 1px;
    }
  }
  .step-1 {
    margin-top: 150px;
    .arrow-up {
      left: calc(50% - 20px);
      top: -20px;
    }
    .arrow-down {
      left: calc(50% - 19px);
      top: 20px;
    }
    button {
      margin-top: 50px;
    }
  }
  .step-2 {
      position: relative;
    span {
      height: 44px;
      display: inline-block;
      line-height: 44px;
      position: absolute;
      right: 0;
      padding: 0 16px;
    }
    .arrow-up {
        right: calc(68px - 100%);
        top: 65px;
    }
    p {
        margin-top: 84px;
        margin-right: 20px;
    }
    button {
        margin-right: 38px;
        margin-top: 10px;
    }
  }
  &.transparent-hide {
      background: rgba(255,255,255,0);
  }
}
</style>
