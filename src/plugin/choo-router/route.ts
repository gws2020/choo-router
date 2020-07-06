import { Component, Vue } from 'vue-property-decorator'


export enum Direction {
  create = 'create',
  forward = 'forward',
  back = 'back'
}

@Component({
  data() {
    return {
      replace: false,
      direction: ''
    }
  }
})
export default class ChooRoute extends Vue {
  public replace!: boolean
  public direction!: Direction
}
