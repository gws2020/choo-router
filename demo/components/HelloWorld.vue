<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>{{count}}</p>
    <p><button @click="count++">add</button></p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import v from 'vue'

@Component({
  cache(data) {
    return {}
  },
  components: {
    abc: {
      components: {
        BBB: {
          data() {
            return {
              ccc: 'ccc'
            }
          },
          render(h: any) {
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
      render(h: any) {
        return h('p', {}, ['3333', h('BBB', {attrs: {crk: 'ddss'}})])
      }
    }
  }
})
export default class HelloWorld extends Vue {
  public d: string = 'ddddsssss'
  public ddd: string = 'bbbb'
  public count: number = 0
  @Prop() private msg!: string
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
