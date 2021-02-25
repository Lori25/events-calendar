<!--包裹组件的div要设置高度，当里边内容大于外层div高度时才能促发-->
<template>
    <div ref="wrapper" class="wrapper">
       <div class="content" v-if="!scrollX">
           <div class="refreshLoading" v-show="loadingNew">
               <p>
                   <img src="@/assets/images/loading.png" class="rotate" v-show="refreshText=='正在刷新...'"/>
                  {{refreshText}}
               </p>
           </div>
           <slot name='content'></slot>
           <div class="loading-wrapper" :style="{opacity:loadingMore?1:0}" v-if="pullup">
               <p><img src="@/assets/images/loading.png"/>正在加载...</p>
           </div>
       </div>
        <slot name='contentX' v-if="scrollX"></slot>
    </div>
</template>
<script>
    import BScroll from 'better-scroll'
    export default {
        props: {
            /**
             * 1 滚动的时候会派发scroll事件，会截流。
             * 2 滚动的时候实时派发scroll事件，不会截流。
             * 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
             */
            probeType: {
                type: Number,
                default: 1
            },
            /**
             * 点击列表是否派发click事件
             */
            click: {
                type: Boolean,
                default: true
            },
            /**
             * 是否开启横向滚动
             */
            scrollX: {
                type: Boolean,
                default: false
            },
            /**
             * 是否派发滚动事件
             */
            listenScroll: {
                type: Boolean,
                default: false
            },
            /**
             * 列表的数据
             */
            data: {
                type: Array,
                default: null
            },
            /**
             * 是否派发滚动到底部的事件，用于上拉加载
             */
            pullup: {
                type: Boolean,
                default: false
            },
            /**
             * 是否派发顶部下拉的事件，用于下拉刷新
             */
            pulldown: {
                type: Boolean,
                default: false
            },
            /**
             * 是否派发列表滚动结束的事件
             */
            finishScroll: {
                type: Boolean,
                default: false
            },
            /**
             * 是否派发列表滚动开始的事件
             */
            beforeScroll: {
                type: Boolean,
                default: false
            },
            /**
             * 当数据更新后，刷新scroll的延时。
             */
            refreshDelay: {
                type: Number,
                default: 20
            }
        },
        data() {
          return {
              loadingMore: false,
              loadingNew: false,
              refreshText: ''
          }
        },
        mounted() {
            // 保证在DOM渲染完毕后初始化better-scroll
            setTimeout(() => {
                this._initScroll()
            }, 20)
        },
        methods: {
            _initScroll() {
                if (!this.$refs.wrapper) {
                    return
                }
                // better-scroll的初始化
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: true,
                    scrollX: this.scrollX,
                })

                // 是否派发滚动事件
                if (this.listenScroll) {
                    this.scroll.on('scroll', (pos) => {
                        this.$emit('scroll', pos)
                    })
                }

                // 是否派发滚动到底部事件，用于上拉加载
                if (this.pullup) {
                    this.scroll.on('scrollEnd', () => {
                        // 滚动到底部
                        if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                            this.$emit('scrollToEnd')
                            this.loadingMore = true
                        }
                    })

                }

                // 是否派发滚动到滚动停止事件
                if (this.finishScroll) {
                    this.scroll.on('scrollEnd', (pos) => {
                            this.$emit('scrollEnd', pos)
                    })

                }

                // 是否派发顶部下拉事件，用于下拉刷新
                if (this.pulldown) {
                    this.scroll.on('touchEnd', (pos) => {
                        // 下拉动作
                        if (pos.y > 50) {
                            this.$emit('pulldown')
                            this.loadingNew = true
                            this.touchEnd = true
                            this.refreshText = '正在刷新...'
                        }
                    })
                    this.scroll.on('scroll', (pos) => {
                        if(pos.y>50) {
                            this.loadingNew = true
                            this.refreshText = '释放立即刷新'
                        }
                    })

                }

                // 是否派发列表滚动开始的事件
                if (this.beforeScroll) {
                    this.scroll.on('beforeScrollStart', () => {
                        this.$emit('beforeScroll')
                    })
                }
            },
            disable() {
                // 代理better-scroll的disable方法
                this.scroll && this.scroll.disable()
            },
            enable() {
                // 代理better-scroll的enable方法
                this.scroll && this.scroll.enable()
            },
            refresh() {
                // 代理better-scroll的refresh方法
                this.scroll && this.scroll.refresh()
            },
            scrollTo() {
                // 代理better-scroll的scrollTo方法
               //  scrollTo(x, y, time, easing)
/*                 {Number} x 横轴坐标（单位 px）
                    {Number} y 纵轴坐标（单位 px）
                    {Number} time 滚动动画执行的时长（单位 ms）*/
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            },
            scrollToElement() {
                // 代理better-scroll的scrollToElement方法
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            },
        },
        watch: {
            // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
            data() {
                setTimeout(() => {
                    this.loadingMore = false
                    this.loadingNew = false
                    this.refresh()
                }, this.refreshDelay)
            },
            pullup(val) {
                if(!val) {
                    this.scroll.off('scrollEnd')
                }else{
                    this.scroll.on('scrollEnd', () => {
                        // 滚动到底部
                        if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                            this.$emit('scrollToEnd')
                            this.loadingMore = true
                        }
                    })
                }
            },
            finishScroll(val) {
                if(val) {
                    this.scroll.on('scrollEnd', (pos) => {
                        this.$emit('scrollEnd', pos)
                    })
                } else {
                    this.scroll.off('scrollEnd')
                }
            }
        }
    }
</script>
<style lang="less" scoped>
    .wrapper {
        height:100%;
        overflow: hidden;
        position: relative;
    }
    .rotate{
        -webkit-animation: rotate 1S infinite linear;
        animation: rotate 1S infinite linear;
    }
    .loading-wrapper{
        font-size: 14px;
        text-align: center;
        color:#bfbfbf;
        width: 100%;
        img{
            width: 20px;
            margin-right: 5px;
            vertical-align: middle;
            -webkit-animation: rotate 1S infinite linear;
            animation: rotate 1S infinite linear;
            position: relative;
            top:-1px
        }
    }
    @-webkit-keyframes rotate {
        0% { -webkit-transform: rotateZ(0); transform: rotateZ(0);}
        100% { -webkit-transform: rotateZ(360deg); transform: rotateZ(360deg);}
    }
    @keyframes rotate {
        0% { -webkit-transform: rotateZ(0); transform: rotateZ(0);}
        100% { -webkit-transform: rotateZ(360deg); transform: rotateZ(360deg);}
    }
    .absolute{
        position: absolute;
    }
    .refreshLoading{
        font-size: 14px;
        text-align: center;
        color:#bfbfbf;
        width: 100%;
        p{
            padding-top: 10px;
        }
        img{
            width: 20px;
            margin-right: 5px;
            vertical-align: middle;
            position: relative;
            top:-1px
        }
    }
</style>