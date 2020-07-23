import { Direction } from '../src/route'
declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    cache?: (data: {}) => {[key: string]: any} | undefined
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $chooRouter: { direction: Direction }
  }
}
