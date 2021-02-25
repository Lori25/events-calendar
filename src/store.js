import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

let calcDuration = (dateStr, type) => {
  // type: 0 开始 ， 1 结束时间
  if(!dateStr || dateStr.length < 8) return; 
  let hour = !type?9:18;
  return new Date(dateStr.substr(0,4),Number(dateStr.substr(4,2))-1,dateStr.substr(6,2),hour).getTime();
}

export default new Vuex.Store({
  state: {
    // eventByDate: null,
    eventByDate: [{
      
    }],
    eventList: []
  },
  mutations: {
    setData(state, data) {
      state.eventByDate = data;
    }
  },
  actions: {
    getEvents({ state, commit }) {
      // 数据按日期分类， 02 贷款类 04 信用卡
      let handleData = (data) => {
        console.log(data);
        let eventlist = {};
        // list.push()
        Object.keys(data).forEach(key => {
          if(typeof data[key] == "object") {
            handleByType(key, data[key])
          }
        })

        function handleByType(type, prodList) {
          switch(type) {
            case '02':
              prodList.forEach(item => {
                // lastBillDt  curPayDt  nextBillDt
                let {lastBillDt, curPayDt, nextBillDt} = item;
                if(lastBillDt) {
                  !eventlist[lastBillDt] && ( eventlist[lastBillDt] = [] );
                  eventlist[lastBillDt].push({
                    name: item.prodName,  // 产品名
                    module: "individualLoan",  // 跳转的模块
                    status: item.lastPayStatus, // 上期还款状态
                    repayAmt: item.lastRealpayBal,  // 上期实际还款金额
                    beginTime: calcDuration(lastBillDt, 0),
                    endTime: calcDuration(lastBillDt, 1),
                    title: item.prodName+'还款日',  // 同步到日历组件的字段
                    oid: Math.random(),
                    description: item.lastPayStatus + '：' + item.lastRealpayBal + '元',  // 同步到日历组件的字段
                    html: '<p>'+item.prodName+'还款日</p>'
                          + '<p>'+item.lastPayStatus + '：<span class="'
                          + (item.lastPayStatus=='已还款'?'color-content':'color-orange') + '">'
                          + item.lastRealpayBal + '</span>元</p>'  // 前端显示文本
                  })
                }
                if(curPayDt) {
                  !eventlist[curPayDt] && ( eventlist[curPayDt] = [] );
                  eventlist[curPayDt].push({
                    name: item.prodName,  // 产品名
                    module: "individualLoan",  // 跳转的模块
                    status: item.curPayStatus, // 本期还款状态
                    repayAmt: item.curRealPayBal,  // 本期实际还款金额
                    curTotalPaybal: item.curTotalPaybal, // 本期需还金额
                    beginTime: calcDuration(curPayDt, 0),
                    endTime: calcDuration(curPayDt, 1),
                    title: item.prodName+'还款日',  // 同步到日历组件的字段
                    description: item.curPayStatus + '：' + item.curPayStatus=='已还款'?item.curRealPayBal:item.curTotalPaybal + '元',  // 同步到日历组件的字段
                    html: '<p>'+item.prodName+'还款日</p>'
                          + '<p>'+item.curPayStatus + '：<span class="'
                          + (item.curPayStatus=='已还款'?'color-content':'color-orange') + '">'
                          + (item.curPayStatus=='已还款'?item.curRealPayBal:item.curTotalPaybal) + '</span>元</p>'  // 前端显示文本
                  })
                }
                if(nextBillDt) {
                  !eventlist[nextBillDt] && ( eventlist[nextBillDt] = [] );
                  eventlist[nextBillDt].push({
                    name: item.prodName,  // 产品名
                    module: "individualLoan",  // 跳转的模块
                    repayAmt: item.nextTotalpayBal,  // 上期需还款金额
                    beginTime: calcDuration(nextBillDt, 0),
                    endTime: calcDuration(nextBillDt, 1),
                    title: item.prodName+'还款日',  // 同步到日历组件的字段
                    description: '需还款：' + item.nextTotalpayBal + '元',  // 同步到日历组件的字段
                    html: '<p>'+item.prodName+'还款日</p>'
                          + '<p>需还款:<span class="color-orange">'
                          + item.nextTotalpayBal + '</span>元</p>'  // 前端显示文本
                  })
                }
              })
              break;
            case '04':
              prodList.forEach(item => {
                // lastBillDt  curBillDt  curPayDt  nextBillDt remBalori
                let {lastBillDt, curBillDt, curPayDt, nextBillDt, remBalori} = item;
                  if(remBalori) {
                    !eventlist[remBalori] && ( eventlist[remBalori] = [] );
                    eventlist[remBalori].push({
                      name: item.prodName,  // 产品名
                      module: "creditCard",  // 跳转的模块
                      status: item.lastPayStatus, // 上期还款状态
                      repayAmt: item.lastRealpayBal,  // 上期实际还款金额
                      beginTime: calcDuration(remBalori, 0),
                      endTime: calcDuration(remBalori, 1),
                      title: item.prodName+'账单日',  // 同步到日历组件的字段
                      description: '已出账单金额：：' + item.remBal + '元',  // 同步到日历组件的字段
                      html: '<p>'+item.prodName+'账单日</p>'
                            + '<p>已出账单金额：<span>'
                            + item.remBal.replace(/-/g,'') + '</span>元</p>'  // 前端显示文本
                    })
                  }
                  if(lastBillDt) {
                    !eventlist[lastBillDt] && ( eventlist[lastBillDt] = [] );
                    eventlist[lastBillDt].push({
                      name: item.prodName,  // 产品名
                      module: "creditCard",  // 跳转的模块
                      status: item.lastPayStatus, // 上期还款状态
                      repayAmt: item.lastRealpayBal,  // 上期实际还款金额
                      beginTime: calcDuration(lastBillDt, 0),
                      endTime: calcDuration(lastBillDt, 1),
                      title: item.prodName+'还款日',  // 同步到日历组件的字段
                      description: item.lastPayStatus + '：' + item.lastRealpayBal.replace(/-/g,'') + '元',  // 同步到日历组件的字段
                      html: '<p>'+item.prodName+'还款日</p>'
                            + '<p>'+item.lastPayStatus + '：<span class="'
                            + (item.lastPayStatus=='已还款'?'color-content':'color-orange') + '">'
                            + item.lastRealpayBal.replace(/-/g,'') + '</span>元</p>'  // 前端显示文本
                    })
                  }
                  if(curBillDt) {
                    !eventlist[curBillDt] && ( eventlist[curBillDt] = [] );
                    eventlist[curBillDt].push({
                      name: item.prodName,  // 产品名
                      module: "individualLoan",  // 跳转的模块
                      status: item.curPayStatus, // 本期还款状态
                      repayAmt: item.curRealPayBal,  // 本期实际还款金额
                      curTotalPaybal: item.curTotalPaybal, // 本期需还金额
                      beginTime: calcDuration(curBillDt, 0),
                      endTime: calcDuration(curBillDt, 1),
                      title: item.prodName+'账单日',  // 同步到日历组件的字段
                      description: '已出账单金额：' + item.curTotalPaybal + '元',  // 同步到日历组件的字段
                      html: '<p>'+item.prodName+'账单日</p>'
                            + '<p>已出账单金额：<span>'
                            + item.curTotalPaybal + '</span>元</p>'  // 前端显示文本
                    })
                  }
                  if(curPayDt) {
                    !eventlist[curPayDt] && ( eventlist[curPayDt] = [] );
                    eventlist[curPayDt].push({
                      name: item.prodName,  // 产品名
                      module: "individualLoan",  // 跳转的模块
                      status: item.curPayStatus, // 本期还款状态
                      repayAmt: item.curRealPayBal,  // 本期实际还款金额
                      curTotalPaybal: item.curTotalPaybal, // 本期需还金额
                      beginTime: calcDuration(curPayDt, 0),
                      endTime: calcDuration(curPayDt, 1),
                      title: item.prodName+'还款日',  // 同步到日历组件的字段
                      description: item.curPayStatus + '：' + (item.curPayStatus=='已还款'?item.curRealPayBal.replace(/-/g,''):item.curTotalPaybal) + '元',  // 同步到日历组件的字段
                      html: '<p>'+item.prodName+'还款日</p>'
                            + '<p>'+item.curPayStatus + '：<span class="'
                            + (item.curPayStatus=='已还款'?'color-content':'color-orange') + '">'
                            + (item.curPayStatus=='已还款'?item.curRealPayBal.replace(/-/g,''):item.curTotalPaybal) + '</span>元</p>'  // 前端显示文本
                    })
                  }
                  if(nextBillDt) {
                    !eventlist[nextBillDt] && ( eventlist[nextBillDt] = [] );
                    eventlist[nextBillDt].push({
                      name: item.prodName,  // 产品名
                      module: "individualLoan",  // 跳转的模块
                      repayAmt: item.nextTotalpayBal,  // 上期需还款金额
                      beginTime: calcDuration(nextBillDt, 0),
                      endTime: calcDuration(nextBillDt, 1),
                      title: item.prodName+'账单日',  // 同步到日历组件的字段
                      description: '需还款：' + item.nextBillBal + '元',  // 同步到日历组件的字段
                      html: '<p>'+item.prodName+'账单日</p>'
                            + '<p>需还款：<span class="color-orange">'
                            + item.nextBillBal + '</span>元</p>'  // 前端显示文本
                    })
                  }
                });
              break;
            default:
              break;
          }
        }

        return eventlist;
      }

      return new Promise((resolve, reject)=> {
        if(state.eventByDate) {
          resolve(state.eventByDate);
          return;
        }
  
        // request.post({
        //   url: api.getCalendarEvents,
        //   data: {}
        // }).then(data => {
        //   let resultData = handleData(data.context);
        //   resolve(resultData);
        //   commit("setData", resultData);
        // }).catch(e => {
        //   // let resultData = handleData([]);
        //   // resolve(resultData);
        //   // commit("setData", resultData);
        //   reject(e)
        // })
      });
    }
  }
});