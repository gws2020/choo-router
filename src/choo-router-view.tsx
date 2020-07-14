import { Vue, Component, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import { VNode } from 'vue/types/vnode'

@Component
export default class ChooRouterView extends Vue {

  public name: string = 'choo-router-view'
  public path: string = ''

  private get attrs(): {} {
    return Object.assign({}, this.$props, this.$attrs)
  }

  public render(h: CreateElement): VNode {
    const { attrs, path } = this
    // return h('router-view', {
    //   attrs,
    //   key: path
    // })
    return <router-view attrs={attrs} key={path}></router-view>
  }

  @Watch('$route.fullPath', {
    immediate: true
  })
  private routerPathWatch(path: string = '', oldPath: string = '') {
    const paths: string = this.path.split('?')[0]
    path = path.split('?')[0]
    oldPath = oldPath.split('?')[0]
    if (!paths || paths.indexOf(oldPath) !== -1) {
      this.path = path !== oldPath ? this.path : this.$route.fullPath
    }
  }
}
