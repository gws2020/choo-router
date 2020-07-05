<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <p>{{count}}</p>
    <p>
      <button @click="() => {count ++}">add</button>
    </p>
    <HelloWorld :crk="a" msg="Welcome to Your Vue.js App">
      <Abc :crk="'d321'"></Abc>
    </HelloWorld>
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
      count: 0
    }
  },
  created() {
    // console.log(this, '====333')
  },
  components: {
    HelloWorld,
    Abc: {
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
