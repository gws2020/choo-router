<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <choo-router-view />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  props: {
    ddd: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      a: 'a321321',
      b: 'b321321',
      count: 0
    }
  },
  cache (data) {
    console.log(this, '===data')
    return {}
  },
  created() {
    console.log('===444')
  },
  components: {
    HelloWorld,
    Abc: {
      cache (data) {
        return {}
      },
      components: {
        BBB: {
          data() {
            return {
              ccc: 'ccc'
            }
          },
          render(h) {
            return h(
              'p',
              {},
              [
                '略略略'
              ],
            )
          }
        }
      },
      data() {
        return {
          a: 1
        }
      },
      render (h) {
        return h('p', {}, [
          `111--${this.a}`,
          h(
            'BBB',
            {
              attrs: {
                crk: 'dd'
              }
            }
          )
        ])
      }
    }
  }
}
</script>
