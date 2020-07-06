import { Direction } from '../lib/route'
declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    cache?: (data: {}) => boolean
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $chooRouter: { replace: boolean, direction: Direction }
  }
}
