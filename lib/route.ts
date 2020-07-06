import Vue from 'vue'


export enum Direction {
  enter = 'enter',
  forward = 'forward',
  back = 'back'
}

class InitData {
  public replace: boolean = false
  public direction: Direction = Direction.enter
}

export default class ChooRoute extends Vue {

  private static initData: {replace: boolean, direction: Direction | string} = {
    replace: false,
    direction: ''
  }

  public replace!: boolean
  public direction!: Direction

  constructor () {
    super({
      data: new InitData()
    })
  }
}
