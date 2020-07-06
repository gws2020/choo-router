// import { Component, Vue } from 'vue-property-decorator'
import Vue from 'vue'


export enum Direction {
  enter = 'enter',
  forward = 'forward',
  back = 'back'
}

// @Component({
//   data() {
//     return {
//       replace: false,
//       direction: ''
//     }
//   }
// })
// export default class ChooRoute extends Vue {
//   public replace!: boolean
//   public direction!: Direction
//   public render (h: any) {
//     return h('template')
//   }
// }

// export default class ChooRoute extends Vue {

//   public replace!: boolean
//   public direction!: Direction

//   public data: {replace: boolean, direction: Direction | string} = {
//     replace: false,
//     direction: ''
//   }
// }

export default new Vue({
  data: {
    replace: false,
    direction: ''
  }
})

// export default {
//   data () {
//     return {
//       replace: false,
//       direction: ''
//     }
//   }
// }
