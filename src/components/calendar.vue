<template>
  <div class="calendar bg-white" id="calendar">
    <section class="calendar-header color-description font-12">
      <ul>
        <li v-for="(day, index) in dayList" :key="index">{{ day }}</li>
      </ul>
    </section>
    <section
      class="calendar-body color-content font-14"
      @touchstart="touchstart"
      @touchend="touchend"
      @touchmove.stop.prevent="touchmove"
      :style="{'height': type=='week'?'40px':currentHeight+'px'}"
    >
      <ul :style="[{'top': currentTop+'px'}]" class="calendar-date-list">
        <li
          v-for="(date, index) in dateList"
          :key="index"
          :class="date.isCurrentMonth?'':'color-graw3'"
          @click="printDate(date, $event)"
        >
          <span
            :class="[
              { isToday: date.isToday },
              { hasEvent: date.eventList && date.eventList.length && !date.isToday },
            ]"
            >{{ date.date }}</span
          >
        </li>
      </ul>
      <div class="check-circle" :class="{'transition':touch.touchEnd}" :style="{'top': (type=='week'?2:circle.top)+'px', 'left': circle.left+'px', 'display': circle.display?'inline-block':'none'}"></div>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    eventList: {
      type: Array,
      default: ()=> {
        return [];
      }
    },
    calendarType: String
  },
  data() {
    return {
      type: 'month', // month,week  显示方式
      currentDate: null, // 当前选中天
      currentMonth: null, // 当前选中月
      currentYear: null, // 当前选中年
      heightUnit: 40,
      currentHeight: 40, // 当前显示月份/周的高度，根据月周模式变化
      currentMonthHeight: 0, // 当月高度
      firstHeight: 0,  
      currentTop: 0, // 当前显示月份/周的高度
      firstCTop: 0,
      dayList: ["日", "一", "二", "三", "四", "五", "六"],
      dateList: [],
      // eventList: [], // 事件列表
      dateHeight: 0, // 日期列表高度
      chosenDate: null, // 划到某天
      sensitivity: 10,  // 上下滑切换月份的灵敏度，暂定为 10px
      touch: {
        touchEnd: true,
        firstTop: 0,
        startY: 0,  // 滑动开始的位置
        endY: 0,  // 滑动结束的位置
      },
      circle: {
        display: true,
        firstTop: 0,
        left: -50,
        top: -50
      },
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.resetCurrent();
  },
  watch: {
    eventList(newVal) {
      this.dataList = newVal;
    }
  },

  methods: {
    // 重置当前月份
    resetCurrent() {
      this.currentDate = this.currentDate || new Date();
      this.currentMonth = this.currentDate.getMonth() + 1;
      this.currentYear = this.currentDate.getFullYear();
      this.circle.display = false;
      this.formatList();
    },
    formatList() {
      this.dateList = [];
      this.getMonthList(this.currentYear, this.currentMonth - 1, -1);
      this.getMonthList(this.currentYear, this.currentMonth, 0);
      this.getMonthList(this.currentYear, this.currentMonth + 1, 1);
    },
    // 获取当前选中月及上下各三个月的日期列表
    getMonthList(year, month, isCurrentMonth) {
      // isCurrentMonth -1：上个月 0：当月 1：下月
      let tempDate = new Date(year, month, 0);
      let dayLength = tempDate.getDate(); // 获取到当月总天数
      let tempList = [];
      let currentMonthFirst = new Date(year, month-1, 1); // 当月一号

      for (let i = 0; i < dayLength; ) {
        let date = new Date(year, month - 1, ++i);
        let len = this.dateList.length+(isCurrentMonth < 0?0:-1);
        // 计算高度
        if( i==1 && !isCurrentMonth ) {
          this.currentHeight = this.calcHeight(date, dayLength); // 算出当月高度
          this.firstHeight = this.currentHeight;
        }
        if(i==1 && isCurrentMonth===-1) {
          this.currentTop = -(this.calcHeight(date, dayLength)); // 算出上月高度
          this.firstCTop = this.currentTop; // 算出上月高度
        }
        if(i==dayLength && isCurrentMonth===-1 && date.getDay()<6) { // 如果上月最后一天不是刚好周六的话，则当月top需变化
          this.currentTop += this.heightUnit;
          this.firstCTop += this.heightUnit; // 算出上月高度
        }
        // -----计算高度 end-----
        tempList.push({
          dateObj: date,
          date: i,
          dateNum: year+(month+'').replace(/(^[0-9]$)/, "0$1")+(date.getDate()+'').replace(/(^[0-9]$)/, "0$1"),
          isToday: this.getDate(date) === this.getDate(new Date()), // 是否是本日
          day: date.getDay(),
          eventList: [],
          isCurrentMonth: !isCurrentMonth,
          index: i+len,
          totalTop: Math.floor(((this.dateList.length+date.getDate()-1)/7))*this.heightUnit,  // 当前日期相对当前日历顶部的距离
          indexTop: (Math.floor((date.getDate()+currentMonthFirst.getDay()-1)/7))*this.heightUnit // 当前日期离日历上沿多远，方便计算收拢距离
        });
      }

      let tempDateObj = tempList[this.currentDate.getDate()-1];
      if(!isCurrentMonth && this.currentDate.getDate()==tempDateObj.dateObj.getDate()) {
        this.printCurrentDate(tempDateObj, this.dateList.length-1);
      }

      this.dateList = this.dateList.concat(
        this.dateList.length ? tempList : this.fillDateList(tempList)
      );

      isCurrentMonth==1 && this.$emit("update:eventList", this.dateList)
    },
    // 计算月份高度
    calcHeight(date, dayLength) {
      let sum = date.getDay() + dayLength;
      let lines = Math.ceil(sum/7) || 5;
      return lines*this.heightUnit
    },
    getDate(date) {
      if (!date) return;
      return date.getFullYear() + "" + date.getMonth() + "" + date.getDate();
    },
    // 滑动切换
    touchstart(e) {
      console.log(this.firstHeight, this.chosenDate)
      let circle = document.querySelector(".check-circle")
      this.touch.firstTop = this.currentTop;
      this.touch.startY = e.changedTouches[0].clientY;
      this.circle.display = true;
      this.circle.firstTop = circle.offsetTop;
    },
    touchend(e) {
      this.touch.touchEnd = true;
      if(this.type=='month') {
        if(e.changedTouches[0].clientY-this.touch.startY > this.sensitivity) {
          this.scrollTo(-1);
        } else if (e.changedTouches[0].clientY-this.touch.startY < -this.sensitivity) {
          this.scrollTo(1);
        }
      } else {
        if(e.changedTouches[0].clientY-this.touch.startY > this.sensitivity) {
          this.currentHeight = this.firstHeight;
          this.type='month';
          this.$emit("update:calendarType", this.type)
        }
      }
    },
    touchmove(e) {
      this.touch.touchEnd = false;
      if(this.type=='month') {
        this.currentTop = this.touch.firstTop + e.changedTouches[0].clientY-this.touch.startY;
        this.circle.top = this.circle.firstTop + e.changedTouches[0].clientY-this.touch.startY;
      } else {
        // 由周展开为月
        let distance = e.changedTouches[0].clientY-this.touch.startY;
        let rate = distance/(this.firstHeight-this.heightUnit);  // 移动的比例
        distance > 0 && (this.type="")
        // 根据外部纵轴移动的距离收拢
        this.currentHeight = this.heightUnit + distance;
        this.currentTop = this.firstCTop + this.chosenDate.indexTop*rate;
        this.circle.top = this.circle.firstTop + this.chosenDate.indexTop*rate;
      }
    },
    // 滚动到上下月
    scrollTo(index, date) {
      if(!index) return;
      this.circle.display = false;
      // index -1滚动到上月 1滚动到下月
      if(date) {
        this.currentDate = date;
      } else {
        let targetDate = this.currentDate;
        this.chosenDate.dateObj && targetDate.setDate(this.chosenDate.dateObj.getDate());
        targetDate.setMonth(this.currentDate.getMonth()+index);
        if(targetDate.getMonth()-this.currentMonth > 0) {
          targetDate.setDate(targetDate.getDate()-1);
        }
      }
      this.resetCurrent();
    },
    printCurrentDate(obj, len, isOuter) {
      setTimeout(()=> {
        let target = null;
        let dateUl = document.querySelector(".calendar-date-list");
        let dateListDom = dateUl.querySelectorAll("li");
        let dateIndex = isOuter?len:len+this.currentDate.getDate();
        target = dateListDom[dateIndex];
        this.printDate(obj, {target:target}, isOuter);
      }, 300)
    },
    // 打印date
    printDate(date, ev, isOuter) {
      let target;
      let distance = date.dateObj.getMonth()-(this.currentMonth-1);
      let calendarDom = document.querySelector(".calendar");
      this.chosenDate = date; // 存储当前选中的日期，在scrollto方法里对date重新赋值
      this.scrollTo(distance, date.dateObj);
      (!ev.isTrusted || (ev.isTrusted&&!distance)) && this.$emit("getDate", date, {
        domHeight: calendarDom.offsetHeight,
        type: this.type
      }, isOuter);

      if(!ev) return;
      if(ev.target.localName=='li') target = ev.target;
      if(ev.target.parentNode.localName=='li') target = ev.target.parentNode;

      if(distance) {
        this.circle.display = false;
      } else {
        this.circle.display = true;
        this.moveCircle(target)
      }
    },
    // 移动选中框
    moveCircle(target) {
      this.circle.left = target.offsetLeft + (target.offsetWidth-36)/2;
      this.circle.top = target.offsetTop+this.currentTop+2;
      this.circle.firstTop = this.circle.top;
    },
    // 填充空位
    fillDateList(list) {
      let delay = list[0].dateObj.getDay();
      for (let i = 0; i < delay; i++) {
        list.unshift({});
      }
      return list;
    },
    // 月/周显示切换
    toggleType() {
      // this.type = this.type=="month"?"week":"month";

    },
    handleHeight(outerDistance, type) {
      if(!outerDistance) return document.querySelector(".calendar").offsetHeight;
      // console.log(outerDistance, this.firstHeight+outerDistance<40, type);
      let currentIndexTop =  this.chosenDate.indexTop;
      this.touch.touchEnd = type=='end';
      if(type=='end') {
        let temp = this.firstHeight+outerDistance<200;
        if(temp) {
          this.type = "week";
          this.$emit("update:calendarType", this.type)
        }
        if(this.type == 'month') {
          outerDistance = temp?this.heightUnit-this.firstHeight:0;
        } else {
          this.currentTop = -this.chosenDate.totalTop;
          // this.circle.top = 2;
        }
      }
      if(this.type=="month") {
        this.currentHeight = this.firstHeight + outerDistance;
        if(this.currentHeight >= this.firstHeight) {
          this.currentHeight = this.firstHeight;
          this.currentTop = this.firstCTop;
          this.circle.top = this.circle.firstTop;
        } else {
          let rate = outerDistance/(this.firstHeight-this.heightUnit);  // 移动的比例
          // 根据外部纵轴移动的距离收拢
          this.currentTop = this.firstCTop + currentIndexTop*rate;
          this.circle.top = this.circle.firstTop + currentIndexTop*rate;
        }
      }
      let calendarDom = document.querySelector(".calendar");
      return calendarDom.offsetHeight;
    }
  },
};
</script>
<style lang="less" scoped>
.calendar {
  padding: 15px 0;
  .calendar-body {
    position: relative;
    overflow: hidden;
    ul.calendar-date-list {
      position: absolute;
    }
    .check-circle {
      display: inline-block;
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(255, 214, 48, 1);
      &.transition {
        transition: all 0.1s ease-in-out;
      }
    }
  }
  li {
    display: inline-block;
    width: calc(100% * 1 / 7);
    height: 40px;
    line-height: 40px;
    text-align: center;
    vertical-align: bottom;
    .isToday {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      width: 36px;
      position: relative;
      &::after {
        content: "\4ECA";
        display: inline-block;
        color: white;
        position: absolute;
        left: 0;
        font-size: 14px;
        background: linear-gradient(to bottom, #7eb3f8 0%, #477bef 100%);
        height: 36px;
        width: 36px;
        border-radius: 50%;
      }
    }
    .hasEvent {
      position: relative;
      &::after {
        content: "";
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 2px;
        background: #477bef;
        position: absolute;
        bottom: 0;
        bottom: -6px;
        left: calc(50% - 2px);
      }
    }
  }
}
</style>
