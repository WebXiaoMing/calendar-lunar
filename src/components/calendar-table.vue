<template>
  <div class="calendar-table">
    <div class="calender-table-content">
      <div class="show-month-calender" v-show="showTable">
        <ul class="show-month-content"
            @touchstart.stop="onTouchStart"
            @touchmove.stop="onTouchMove"
            @touchend.stop="onTouchEnd"
            ref="monthCalender"
        >
          <li class="month-wrapper prevMonth">
            <ul class="week-in-month" v-for="(week, index) in prevMonthDays">
              <li class="calender-day"
                  v-for="(day) in week"
                  :class="{'active': isActive(day)}"
                  @click="changeActiveDay(day, index)"
                  :style="!isActive(day) ? currMonthStyle(day) : ''"
              >
                <div class="day-text">{{day.format('D')}}</div>
                <div class="day-lunar">{{day.lunar}}</div>
              </li>
            </ul>
          </li>
          <li class="month-wrapper currMonth">
            <ul class="week-in-month" v-for="(week, index) in currMonthDays">
              <li class="calender-day"
                  v-for="(day) in week"
                  :class="{'active': isActive(day)}"
                  @click="changeActiveDay(day, index)"
                  :style="!isActive(day) ? currMonthStyle(day) : ''"
              >
                <div class="day-text">{{day.format('D')}}</div>
                <div class="day-lunar">{{day.lunar}}</div>
              </li>
            </ul>
          </li>
          <li class="month-wrapper nextMonth">
            <ul class="week-in-month" v-for="(week, index) in nextMonthDays">
              <li class="calender-day"
                  v-for="(day) in week"
                  :class="{'active': isActive(day)}"
                  @click="changeActiveDay(day, index)"
                  :style="!isActive(day) ? currMonthStyle(day) : ''"
              >
                <div class="day-text">{{day.format('D')}}</div>
                <div class="day-lunar">{{day.lunar}}</div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <week-calendar v-show="!showTable"></week-calendar>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import moment from 'moment'
  import {chunck} from "@/util/utilMethods"
  import calendar from '@/util/getLunar'
  import WeekCalendar from '@/components/week-calendar'

  export default {
    props: {
      currMonth: {
        type: Number,
        default: moment().month(),
      },
      currYear: {
        type: Number,
        default: moment().year(),
      },
      showTable: {
        type: Boolean,
        default: false,
      }
    },
    data () {
      return {
        isActiveDay: moment(),
        currMonthDays: [],
        prevMonthDays: [],
        nextMonthDays: [],
      }
    },
    created () {
      this.currMonthDays = this.initDays(this.currYear, this.currMonth)
      this.prevMonthDays = this.initDays(this.currYear, this.currMonth - 1)
      this.nextMonthDays = this.initDays(this.currYear, this.currMonth + 1)
      this.touch = {}
      this.$emit('initActiveWeek', this.activeWeek())
    },
    methods: {
      activeWeek () {
        return this.currMonthDays.findIndex(week => {
          return week.some(day => {
            return day.date() === moment().date()
          })
        })
      },
      changeActiveDay (day, index) {
        this.isActiveDay = day
        this.$emit('changeCurrWeek', index)
      },
      onTouchStart (e) {
        if (this.touch.initialed) {
          return
        }
        this.touch.initialed = true
        this.touch.moved = false
        const touches = e.touches[0]
        this.touch.x1 = touches.pageX
        this.touch.y1 = touches.pageY
      },
      onTouchMove (e) {
        // 判断是否准备后移动
        if (!this.touch.initialed) {
          return
        }
        // 判断是否是一次移动
        if (!this.touch.moved) {
          this.touch.moved = true
        }
        // 取得每次移动的距离
        const touches = e.touches[0]
        this.touch.deltaX = touches.pageX - this.touch.x1
        this.touch.deltaY = touches.pageY - this.touch.y1
        // 判读是否是一次横向移动 如果不是就return
        if (Math.abs(this.touch.deltaX) < Math.abs(this.touch.deltaY)) {
          return
        }
        // 取得每次位移相对于窗口的百分比
        this.touch.percent = Math.abs(this.touch.deltaX / window.innerWidth)
        this.$refs.monthCalender.style.transform = `translate3d(${this.touch.deltaX}px, 0, 0)`
        this.$refs.monthCalender.style.transitionDuration = '0ms'
      },
      onTouchEnd () {

        if (!this.touch.moved) {
          return
        }

        let offset
        let count

        if (this.touch.deltaX > 0) {
          if (this.touch.percent > 0.2) {
            offset = window.innerWidth
            count = -1
          } else {
            offset = 0
            count = 0
          }
        }

        if (this.touch.deltaX < 0) {
          if (this.touch.percent > 0.2) {
            count = 1
            offset = -window.innerWidth
          } else {
            count = 0
            offset = 0
          }
        }

        this.$refs.monthCalender.style.transform = `translate3d(${offset}px, 0, 0)`
        this.$refs.monthCalender.style.transitionDuration = '300ms'

        setTimeout(() => {
          if (!count) {
            return
          }
          this.touch = {}
          this.$emit('changeMonth', this.currMonth + count)
          this.$refs.monthCalender.style.transitionDuration = '0ms'
          this.$refs.monthCalender.style.transform = `translate3d(0, 0, 0)`
        }, 300)
      },
      // 初始化日历
      initDays (year, month) {
        // 获取当前月的moment对象
        const currday = moment(`${year}-${month + 1}-1`, 'YYYY-MM-DD')
        // 设置星期日为一周的第一天，传负值则会冒泡到上个月
        let momentday = moment(currday).weekday(-7)
        let days = []
        for (let i = 0; i < 42; i ++) {
          let props = {
            // 获取农历日期
            lunar: this.getLunarInfo(moment(momentday).year(), moment(momentday).month() + 1, moment(momentday).date()),
            isCurrMonth: moment(momentday).month() === currday.month(),
          }

          momentday = Object.assign(momentday, props)
          days.push(momentday)
          // 每次循环完把天数加1
          momentday = moment(momentday).add(1, 'day')
        }

        return chunck(days, 7)
      },
      // 获取农历信息
      getLunarInfo(y,m,d){
        let lunarInfo=calendar.solar2lunar(y,m,d)
        let lunarValue=lunarInfo.IDayCn
        // console.log(lunarInfo)

        return lunarValue
      },
      currMonthStyle (day) {
        if (!day) {
          return false
        }
        if (day.isCurrMonth) return {color: '#333'}
      },
      isActive (day) {
        if (!day) {
          return false
        }
        return day.date() === this.isActiveDay.date() && day.month() === this.isActiveDay.month()
      }
    },
    watch: {
      currMonth (newVal) {
        // 如果月份超过11则年份加一
        if (newVal > 11) {
          this.$emit('changeYear', this.currYear + 1, 0)
        }
        // 如果月份低于0则年份减一
        if (newVal < 0) {
          this.$emit('changeYear', this.currYear - 1, 11)
        }

        if (newVal <= 0) {
          this.prevMonthDays = this.initDays(this.currYear -1, 11)
        } else {
          this.prevMonthDays = this.initDays(this.currYear, this.currMonth - 1)
        }
        if (newVal >= 11) {
          this.nextMonthDays = this.initDays(this.currYear +1, 0)
        } else {
          this.nextMonthDays = this.initDays(this.currYear, this.currMonth + 1)
        }

        this.currMonthDays = this.initDays(this.currYear, this.currMonth)
      }
    },
    components: {
      WeekCalendar,
    }
  }

</script>
<style lang="stylus" scoped>
  .calender-table-content
    width 100%
    text-align center
    .show-month-calender
      position relative
      width 100%
      height 16.5rem
      overflow hidden
      .show-month-content
        position absolute
        top 0
        left -100%
        width 300%
        display flex
        flex-flow row nowrap
        .month-wrapper
          width 100%
          padding 0 0.625rem
          box-sizing border-box
          display flex
          flex-flow column nowrap
          .week-in-month
            width 100%
            display flex
            flex-flow row nowrap
            column-count 7
            height 2.75rem
            .calender-day
              flex 1
              border-radius 0.25rem
              padding-top 0.25rem
              box-sizing border-box
              color #ccc
              .day-lunar
                font-size 0.625rem
                margin-top 0.25rem
                color #ccc
            .calender-day
              &.active
                background orange
                color #fff
                .day-lunar
                  color #fff
</style>
