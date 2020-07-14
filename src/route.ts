import Vue from 'vue'


export enum Direction {
  enter = 'enter',
  replace = 'replace',
  forward = 'forward',
  back = 'back'
}

class InitData {
  public direction: Direction = Direction.enter
}

export default class ChooRoute extends Vue {

  public replace!: boolean
  public direction!: Direction

  constructor () {
    super({
      data: new InitData()
    })
  }
}
