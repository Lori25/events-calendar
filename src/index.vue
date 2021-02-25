<template>
  <zsView :title="title" class="bg-white calendar-event">
    <a slot="rightBtn" class="view-head-button" @click="synchronize"><span class="color-blue">同步日历</span></a>
    <div slot="content" class="">
      <calendarBox class="border-bottom" ref="calendarBox" :eventList.sync="eventDate" :calendarType.sync="calendarType" @getDate="getDate" />
      <!-- <section class="event bg-white" :style="{'height': scrollHeight}" @touchstart="touchstart"> -->
      <section class="event bg-white" :style="{'height': scrollHeight}" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
        <scroll ref="scroll" :data="eventDate" :finishScroll="listenFinish" @scrollEnd="scrollPos" :probeType="3">
          <div slot="content">
            <div class="event-top-block"></div>
            <div v-for="(eventItem, index) in eventDate" :key="index" :id="'event'+eventItem.dateNum">
              <p class="date-title" v-if="eventItem.dateObj" :data-eventIndex="index">
              <!-- <p class="date-title" v-if="eventItem.dateObj"> -->
                <span class="font-24 num-PingFangSC-Regular" :class="{'color-blue': eventItem.isToday}">{{eventItem.date}}</span>
                <span class="font-12 color-description">星期{{dayList[eventItem.day]}}</span>
                <span class="font-12 color-description">{{eventItem.dateObj.getFullYear()+"年"+(eventItem.dateObj.getMonth()+1)+"月"}}</span>
              </p>
              <div class="event-box bg-white" v-for="event in eventItem.eventList" :key="event.oid" @click="showDetail(event)">
                <div class="event-content" v-html="event.html"></div>
                <div class="font-12 color-description event-link">详情 ></div>
              </div>
            </div>
            <div class="event-top-block"></div>
          </div>
        </scroll>
      </section>
      <guideModel />
    </div>
  </zsView>
</template>

<script>
import zsView from "./components/zsView";
import scroll from "./components/scroll";
import calendarBox from "./components/calendar.vue";
import guideModel from "./components/guideModel";
import { resultsSuggest } from "./plugins/resultsSuggest";

export default {
  data () {
    return {
      title: "金融日历",
      scrollHeight: 0, // 时间scroll高度
      listenFinish: true,
      date: {},
      touch: {
        startY: 0,
        touchEnd: false,
      },
      distance: 0,
      calendarType: "month",
      dayList: ["日", "一", "二", "三", "四", "五", "六"],
      eventDate: [],
      // eventData: {}
    };
  },

  components: {
    zsView,
    calendarBox,
    scroll,
    guideModel
  },

  mounted() {
    // console.log(this.$extendBankCard);
    // console.log(cfca);
    // cfca.find(this.$extendBankCard).then(res => {
    //   console.log("cfca found, ", res)
    // }).catch(e => {
    //   console.log("cfca dismissed, ", e.message)
    //   cfca.openIdCheck()
    // });

    // this.$store.dispatch("getEvents").then(data => {
    //   this.eventData = data;
    // })
  },

  computed: {},

  watch: {
    eventDate(newVal) {
      // console.log(newVal)
      this.$store.dispatch("getEvents").then(data => {
        newVal.length && newVal.forEach(item => {
          let index = item.dateNum
          data[index] && (item.eventList = data[index]);
        });
        setTimeout(()=> {
          this.$refs.scroll.scrollToElement(document.querySelector("#event"+this.date.dateNum), 200);
        }, 100)
      })
    }
  },

  methods: {
    synchronize() {
      let _this = this;
      resultsSuggest({ message: "暂无可同步数据" })
      // popupbox_custom.confirm({
      //   text: "同步到日历更方便",
      //   sureText: "确认同步",
      //   sureCtrl: () => {
      //     let syncList = getList();
      //     if(!syncList.length) {
      //       popupbox_custom.alert({text: "暂无可同步数据"});
      //       return;
      //     }
      //     resultsSuggest({
      //       message: "同步成功",
      //     });
      //   }
      // })

      function getList() {
        let list = [];
        let objList = _this.$store.state.eventByDate
        Object.keys(objList).forEach(dateList => {
          objList[dateList].forEach(item => {
            list.push({
              "title": item.title,
              "description": item.description,
              "start": item.beginTime,
              "end": item.endTime
            })
          })
        });
        return list;
      }
    },
    getDate(date, parent, fromOuter) {
       console.log("currentDate:",date, parent.domHeight, parent.type);
      if(!date.dateObj) return;
      this.date = date;
      this.title = '';
      this.title += (date.dateObj.getFullYear()+'').substr(-2,2)+"年";
      this.title += (date.dateObj.getMonth()+1+'').replace(/(^[0-9]$)/, "0$1")+"月";

      this.scrollHeight = "calc(100vh - 44px - "+parent.domHeight+"px"; // 计算scroll部分高度
      fromOuter && setTimeout(()=> {
        let innerHeight = this.$refs.calendarBox.handleHeight(1, 'end')
        this.scrollHeight = "calc(100vh - 44px - "+innerHeight+"px"; // 计算scroll部分高度
      }, 300);
    
      !fromOuter && this.$refs.scroll.scrollToElement(document.querySelector("#event"+date.dateNum), 200);
      !fromOuter && setTimeout(()=> {
        this.listenFinish = false;
      });
    },
    // 滑动
    touchstart(e) {
      setTimeout(()=> {
        this.listenFinish = true
      })
      this.touch.startY = e.changedTouches[0].clientY;
      this.calendarType=="week" && this.$refs.scroll.enable();
      console.log(this.touch.startY)
    },
    touchend(e) {
      this.touch.touchEnd = true;
      // if(this.calendarType=="week") return;
      let value = this.$refs.calendarBox.handleHeight(this.distance, 'end');
      this.getDate(this.date, {domHeight: value}, true);
    },
    touchmove(e) {
      this.touch.touchEnd = false;
      this.distance = e.changedTouches[0].clientY-this.touch.startY;
      this.calendarType!=="week" && this.distance<0 && this.$refs.scroll.disable();
      this.calendarType!=="week" && this.$refs.calendarBox.handleHeight(this.distance, 'move');
    },
    scrollPos(pos) {
      let domList = document.querySelectorAll(".date-title");
      for(let i = 0; i < domList.length; i++) {
        if(domList[i].offsetTop + pos.y > 0) {
          let eventIndex = domList[i].dataset.eventindex;
          this.$refs.calendarBox.printCurrentDate(this.eventDate[eventIndex-1], eventIndex-1, true)
          return;
        }
      }
    },
    showDetail(event) {
      console.log(event)
      switch(event.module) {
        case "individualLoan":
          // jump to module
          break;
        case "creditCard":
          // jump to module
          break;
        default:
          break;
      }
    }
  }
}

</script>
<style lang="less">
@import "~@/assets/css/base.less";
.calendar-event {
  .event-top-block {
    height: 1px;
  }
  .date-title {
    line-height: 60px;
    display: inline-flex;
    padding: 0 16px;
    vertical-align: middle;
    span:first-child {
      font-family: PingFangSC-Medium;//汉字字体加粗
      font-weight: 500;
      width: 30px;
      text-align: center;
    }
    span:nth-child(odd) {
      margin-right: 10px;
    }
    span:nth-child(even) {
      margin-right: 5px;
    }
  }
  .event-box {
    position: relative;
    margin: 0 16px 12px 16px;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0px 2px 16px -2px rgba(202, 207, 220, 0.5);
    font-size: 14px;
    .event-content {
      p {
        margin-bottom: 8px;
        &:first-child {
          font-weight: 500;
        }
        &:last-child {
          color: @color-description;
          margin-bottom: 0;
        }
      }
    }
    .event-link {
      position: absolute;
      right: 16px;
      top: calc(50% - 8px);
    }
  }
  
}
</style>