<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script type="text/ecmascript-6">
  import Bscroll from 'better-scroll'
  const DIRECTION_H = 'horizontal'
  const DIRECTION_V = 'vertical'
  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      scrollY: {
        type: Boolean,
        default: false,
      },
      scrollX: {
        type: Boolean,
        default: true,
      },
      startX: {
        type: Number,
        default: 0,
      },
      click: {
        type: Boolean,
        default: true,
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      data: {
        type: Array,
        default: null
      },
      refreshDelay: {
        type: Number,
        default: 20
      },
      bounce: {
        type: Boolean,
        default: true
      },
    },
    mounted () {
      setTimeout(() => {
        this._initScroll()
        this.scroll.refresh()
      }, 20)
    },
    methods: {
      _initScroll () {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new Bscroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click,
          bounce: this.bounce,
          scrollY: this.scrollY,
          scrollX: this.scrollX,
          startX: this.startX,
        })

        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos)
          })
        }

        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }

        this.scroll.on('scrollEnd', () => {
          this.$emit('onScrollEnd')
        })
      },
      disable () {
        this.scroll && this.scroll.disable()
      },
      enable () {
        this.scroll && this.scroll.enable()
      },
      refresh () {
        this.scroll && this.scroll.refresh()
      },
      scrollTo () {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement () {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data () {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>
