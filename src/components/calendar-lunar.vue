import calendar from "../util/getLunar";
import calendar from "../util/getLunar";

<template>
    <div class="calendar-wrapper"
         @touchstart.prevent="onTouchStart"
         @touchmove.prevent="onTouchMove"
         @touchend.prevent="onTouchEnd"
    >
      <div class="calendar-months-wrapper" ref="monthsWrapper">
        <div class="calendar-year">{{currYear}}</div>
        <scroll class="months-list-content"
                :startX="startX"
                ref="monthsList"
        >
          <div class="month-list">
            <div class="month-item"
                 v-for="(item, index) in months"
                 :class="{'active': index === currMonth}"
                 ref="monthItem"
                 @click.stop="currMonth = index"
            >
              {{item}}
            </div>
          </div>
        </scroll>
      </div>
      <div class="calendar-table-wrapper" ref="calendarTable">
        <div class="calender-weeks">
          <ul class="calender-weeks-wrapper">
            <li v-for="week in weeks" class="week">{{week}}</li>
          </ul>
        </div>
        <div class="calendar-box" ref="calendarBox">
          <calendar-table
            :currMonth="currMonth"
            :currYear="currYear"
            :showTable="showCalendarTable"
            @changeMonth="changeMonth"
            @changeYear="changeYear"
            @initActiveWeek="initActiveWeek"
            @changeCurrWeek="changeCurrWeek"
            ref="calendar"
          />
        </div>
      </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import Scroll from '@/components/scroll'
    import CalendarTable from '@/components/calendar-table'
    import moment from 'moment'

    export default {
      name: "calendar-lunar",
      data () {
        return {
          weeks: ['日', '一', '二', '三', '四', '五', '六'],
          months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          currMonth: moment().month(),
          currYear: moment().year(),
          currWeek: 0,
          showCalendarTable: false,
        }
      },
      created () {
        this.touch = {}
      },
      computed: {
        startX () {
          return -(window.innerWidth * 0.8 / 5) * this.currMonth
        }
      },
      methods: {
        changeMonth (month) {
          if (this.currMonth === month) {
            return
          }
          this.currMonth = month
        },
        changeCurrWeek (index) {
          if (this.currWeek === index) {
            return
          }
          this.currWeek = index
        },
        initActiveWeek (index) {
          this.currWeek = index
        },
        changeYear (year, month) {
          console.log(year)
          this.currYear = year
          this.currMonth = month
        },
        onTouchStart (e) {
          if (this.touch.initialed) {
            return
          }
          this.showCalendarTable = true
          this.touch.initialed = true
          this.touch.moved = false
          const touches = e.touches[0]
          this.touch.x1 = touches.pageX
          this.touch.y1 = touches.pageY
          this.touch.currHeight = parseFloat(getComputedStyle(this.$refs.calendarTable).height)
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
          // 判读是否是一次纵向移动 如果不是就return
          if (Math.abs(this.touch.deltaX) > Math.abs(this.touch.deltaY)) {
            return
          }
          this.minHeight = parseFloat(getComputedStyle(this.$refs.monthsWrapper).height) * 2
          this.maxHeight = parseFloat(getComputedStyle(this.$refs.monthsWrapper).height) * 7
          this.touch.percent = this.touch.deltaY / this.maxHeight
          const maxTransform = 0
          const minTransform = -(this.minHeight/2) * (this.currWeek)

          let boxHeight = parseFloat(getComputedStyle(this.$refs.monthsWrapper).height) * 6
          let tranformPercent = Math.abs(minTransform / boxHeight)

          const offset = Math.max(this.minHeight, Math.min(this.maxHeight, this.touch.currHeight + this.touch.deltaY))
          let transformY
          if (this.touch.deltaY > 0) {
            transformY = Math.min(maxTransform, minTransform + this.touch.deltaY*tranformPercent)
          } else {
            transformY = Math.max(minTransform, this.touch.deltaY*tranformPercent)
          }
          this.$refs.calendarTable.style.height = `${offset}px`
          this.$refs.calendarBox.style.transform = `translate3d(0, ${transformY}px, 0)`
          this.$refs.calendarBox.style.transitionDuration = '0ms'
          this.$refs.calendarTable.style.transitionDuration = '0ms'

        },
        onTouchEnd () {
          if (!this.touch.moved) {
            return
          }

          let height = 0
          let translateY = 0
          let percent = Math.abs(this.touch.percent)

          if (this.touch.deltaY > 0) {
            if (percent > 0.2) {
              height = this.maxHeight
              this.showCalendarTable = true
              translateY = 0
            } else {
              height = this.minHeight
              this.showCalendarTable = false
              translateY = -(this.minHeight/2) * (this.currWeek)
            }
          }

          if (this.touch.deltaY < 0) {
            if (percent > 0.1) {
              height = this.minHeight
              this.showCalendarTable = false
              translateY = -(this.minHeight/2) * (this.currWeek)
            } else {
              this.showCalendarTable = true
              height = this.maxHeight
              translateY = 0
            }
          }

          this.$refs.calendarTable.style.height = `${height}px`
          this.$refs.calendarBox.style.transform = `translate3d(0, ${translateY}px, 0)`
          this.$refs.calendarBox.style.transitionDuration = '300ms'
          this.$refs.calendarTable.style.transitionDuration = '300ms'
          this.touch = {}
        }
      },
      watch: {
        currMonth (newVal) {
          this.$refs.monthsList.scrollToElement(this.$refs.monthItem[newVal], 300, false, false)
        },
        showCalendarTable (newVal) {
          if (newVal === false) {
            this.$refs.calendarBox.style.transform = `translate3d(0, 0, 0)`
          }
        }
      },
      components: {
        Scroll,
        CalendarTable,
      }
    }
</script>

<style lang="stylus" scoped>
  .calendar-wrapper
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background #fff
    .calendar-months-wrapper
      width 100%
      display flex
      height 2.75rem
      line-height 2.75rem
      .calendar-year
        width 20%
        text-align center
        font-size 1.5rem
      .months-list-content
        width 80%
        overflow hidden
        .month-list
          width calc(80vw / 5 * 12)
          display flex
          flex-flow row nowrap
          .month-item
            width calc(80vw / 5)
            height 100%
            z-index 1000
            text-align center
            &.active
              color orange
    .calendar-table-wrapper
      width 100%
      height 19.25rem
      overflow hidden
      .calender-box
        width 100%
        height 17rem
      .calender-weeks
        position relative
        background #fff
        width 100%
        z-index 10
        text-align center
        padding 0 0.625rem
        box-sizing border-box
        .calender-weeks-wrapper
          display flex
          flex-flow row nowrap
          .week
            width calc(100vw / 7)
            height 2.75rem
            line-height 2.75rem
</style>
