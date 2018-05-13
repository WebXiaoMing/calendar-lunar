<template>
    <div class="week-calendar">
      <div class="week-calendar-wrapper">
        <ul class="week-calendar-list">
          <li class="week-calendar-item" v-for="(item, index) in currWeek">
            <span class="item-day">{{item.format('D')}}</span>
            <span class="item-lunar">{{item.lunar}}</span>
          </li>
        </ul>
      </div>
    </div>
</template>

<script type="text/ecmascript-6">
  import moment from 'moment'
  import calendar from '@/util/getLunar'
  export default {
    data () {
      return {
        currWeek: 0,
      }
    },
    created () {
      this.currWeek = this.initDays('2018-5-13')
    },
    methods: {
      // 初始化日历
      initDays (year, month, day) {
        // 获取当前月的moment对象
        const currday = moment(`${year}-${month + 1}-${day}`, 'YYYY-MM-DD')
        // 设置星期日为一周的第一天，传负值则会冒泡到上个月
        let momentday = moment(currday).weekday(0)
        let week = []
        for (let i = 0; i < 7; i ++) {
          let props = {
            // 获取农历日期
            lunar: this.getLunarInfo(moment(momentday).year(), moment(momentday).month() + 1, moment(momentday).date()),
            isCurrMonth: moment(momentday).month() === currday.month(),
          }

          momentday = Object.assign(momentday, props)
          week.push(momentday)
          // 每次循环完把天数加1
          momentday = moment(momentday).add(1, 'day')
        }

        return week
      },
      // 获取农历信息
      getLunarInfo(y,m,d){
        let lunarInfo=calendar.solar2lunar(y,m,d)
        let lunarValue=lunarInfo.IDayCn
        // console.log(lunarInfo)

        return lunarValue
      },
    }
  }
</script>

<style lang="stylus" scoped>
  .week-calendar
    width 100%
    height 2.75rem
    line-height 2.75ren
    overflow hidden
    .week-calendar-wrapper
      width 300%
      display flex
      .week-calendar-list
        width 100vw
        padding 0 0.625rem
        box-sizing border-box
        display flex
        column-count 7
        .week-calendar-item
          flex 1
          display flex
          flex-direction column
          .item-day
            font-size 1rem
          .item-lunar
            font-size 0.625rem
            margin-top 0.25rem
            color #ccc
</style>
