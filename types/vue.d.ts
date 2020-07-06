import { Direction } from '../lib/route'
declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    cache?: (data: {}) => {[key: string]: any} | undefined
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $chooRouter: { replace: boolean, direction: Direction }
  }
}
