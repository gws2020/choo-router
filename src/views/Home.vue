<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld :crk="a" msg="Welcome to Your Vue.js App" />
    <HelloWorld :crk="b" msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data() {
    return {
      a: 'a321321',
      b: 'b321321',
      count: 0
    }
  },
  cache (data) {
    console.log('home cache data:', data)
    return {}
  },
  created() {
    // console.log(this, '====333')
  },
  components: {
    HelloWorld,
    Abc: {
      cache (data) {
        console.log('abc=====', data)
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
