import random from 'string-random'
import Vue, { PluginObject, PluginFunction } from 'vue'
import VueRouter, { Route, NavigationGuardNext, RouteRecord, RawLocation, NavigationGuard } from 'vue-router'
import ChooRoute, { Direction } from './route'

class InitOptions {
  public router!: VueRouter
  public key!: string
}

interface CacheComponent {
    data: {
      [key: string]: any
    },
    component: {
      [key: string]: CacheComponent
    }
}

class ChooRouter implements PluginObject<InitOptions> {

  private static setComponentCache(parentData: CacheComponent, rootComponent: Vue, key: string): void {
    rootComponent.$children.forEach((components: Vue) => {
      const keys: string = components.$attrs[key]
      if (keys) {
        parentData.component[keys] = {
          data: Object.assign({}, components.$data),
          component: {}
        }
        ChooRouter.setComponentCache(parentData.component[keys], components, key)
      }
    })
  }

  private static resetComponentData(this: Vue, data: CacheComponent, key: string) {
    const dataFun: () => void = (this.$options as any).__proto__.data
    const cacheFun: (data: {}) => {} | any = (this.$options as any).__proto__.cache
    const keys: string | undefined = key ? this.$attrs[key] : key
    const hookData: {} = {}

    Object.assign(
      Object.keys(this.$data).length ? this.$data : this,
      hookData,
      dataFun ? dataFun.call(this) : {},
      cacheFun ? (
        cacheFun.call(this, data.data) || data.data
      ) : data.data
    )

    this.$children.forEach((components: Vue) => {
      let componentData: CacheComponent | undefined
      componentData = data.component[keys]
      ChooRouter.resetComponentData.call(components, componentData || { data: {}, component: {} }, key)
    })
  }

  private router!: VueRouter
  private opt!: InitOptions

  private keyList: string[] = []
  private data: any = {}
  private route: ChooRoute = new ChooRoute()

  public getCache (): {} {
    return this.data
  }

  public install: PluginFunction<InitOptions> = (vue: typeof Vue, options?: InitOptions): void => {
    this.opt = options as InitOptions
    this.opt.key = this.opt.key || 'crk'
    const router: VueRouter = this.opt.router
    if (!router) {
      throw(new Error('router 为必要参数'))
    }
    if (!(router instanceof VueRouter)) {
      throw(new Error('router 必须为 VueRouter 实例'))
    }
    this.router = router
    Object.defineProperty(Vue.prototype, '$chooRouter', {
      get: () => this.route.$data
    })

    this.resetReplace()
    this.initRouter()

  }

  // 重写 router.replace
  private resetReplace() {
    const self: ChooRouter = this
    const { router } = this
    const oldReplace = router.replace
    const newReplace: (
      location: RawLocation,
      onComplete?: () => void,
      onAbort?: (err: Error) => void
    ) => void = function (
      this: any,
      location: RawLocation,
      onComplete?: () => void,
      onAbort?: (err: Error) => void
    ) {
      self.route.replace = true
      return oldReplace.call(this, location, onComplete, onAbort)
    }

    router.replace = (newReplace as any)
  }

  private initRouter() {
    const { router } = this

    router.beforeEach(this.createRouteKey())

    router.beforeEach(this.routerDirection())

    router.beforeEach(this.setRouterCache())

    router.beforeEach(this.getRouterCache())

    router.afterEach(this.endRouter())
  }

  // 创建 routerKey
  private createRouteKey(): NavigationGuard {
    const { opt } = this
    const key: string = opt.key
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      const query: { [ key: string ]: any } = to.query
      const keys: string = query[key]
      if (!keys) {
        const root: boolean = from.name === null
        const newQuery: { [ key: string ]: any } = Object.assign({}, query)
        newQuery[key] = random(6)
        next({
          path: to.path,
          query: newQuery,
          replace: root || this.route.replace
        })
      } else {
        next()
      }
    }
  }

  // 判定方向
  private routerDirection() {
    const { opt, keyList, route, data } = this
    const key: string = opt.key
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      const toQuery: { [ key: string ]: any } = to.query
      const toKeys = toQuery[key]
      const toIndex = keyList.indexOf(toKeys)
      const fromQuery: { [ key: string ]: any } = from.query
      const fromKeys = fromQuery[key]
      const fromIndex = keyList.indexOf(fromKeys)
      if (toIndex >= 0) {
        const removeRouteKeyList: string[] = keyList.splice(toIndex + 1, fromIndex - toIndex)
        removeRouteKeyList.forEach((keys: string) => {
          delete data[keys]
        })
        route.direction = Direction.back
      } else {
        if ( from.name === null ) {
          route.direction = Direction.enter
          keyList.push(toKeys)
        } else {
          route.direction = Direction.forward
          keyList.push(toKeys)
        }
      }
      next()
    }
  }

  // 存储缓存
  private setRouterCache() {
    const { opt, route, data } = this
    const key: string = opt.key
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      const query: { [ key: string ]: any } = from.query
      const keys: string = query[key]
      if ( route.direction !== Direction.back && !route.replace ) {
        if (!keys) {
          return next()
        }
        const rootData: Array<{}> = data[keys] = []
        from.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const matchedData: {[key: string]: CacheComponent} = rootData[matchedIndex] = {}
          const matchedKey: string[] = Object.keys(matched.instances)
          for (const instancesKey of matchedKey) {
            const instances: Vue = matched.instances[instancesKey]
            matchedData[instancesKey] = {
              data: Object.assign({}, instances.$data),
              component: {}
            }
            ChooRouter.setComponentCache(matchedData[instancesKey], instances, key)

            if ( to.path === from.path ) {
              ChooRouter.resetComponentData.call(instances, {data: {}, component: {}}, key)
            }
          }
        })
      } else if (route.replace && to.path === from.path) {
        from.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const matchedKey: string[] = Object.keys(matched.instances)
          for (const instancesKey of matchedKey) {
            const instances: Vue = matched.instances[instancesKey]
            ChooRouter.resetComponentData.call(instances, {data: {}, component: {}}, key)
          }
        })
      }

      next()
    }
  }

  // 读取缓存
  private getRouterCache() {
    const { opt, route, data } = this
    const key: string = opt.key
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      const { direction } = route
      if (direction !== Direction.back) {
        to.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const instancesList: string[] = Object.keys(matched.components)
          const instances: {[key: string]: Vue} = matched.instances
          matched.instances = {}
          instancesList.forEach((instancesKey: string) => {
            matched.instances[instancesKey] = instances[instancesKey];
          });
        })

        from.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const instancesList: string[] = Object.keys(matched.components)
          instancesList.forEach((instancesKey: string) => {
            const children = matched.instances[instancesKey].$children;
            (matched.instances[instancesKey].$children as Vue[]) = []
            children.forEach((components: Vue) => {
              matched.instances[instancesKey].$children.push(components)
            })
          });
        })
      }
      const query: { [ key: string ]: any } = to.query
      const keys: string = query[key]
      const rootData = data[keys]
      to.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
        const instancesList: string[] = Object.keys(matched.components)
        instancesList.forEach((instancesKey: string) => {
          const matchedData: CacheComponent = rootData ?
            rootData[matchedIndex][instancesKey] :
            {
              data: {},
              component: {}
            }
          let instances: Vue | undefined = matched.instances[instancesKey]
          if (instances !== undefined) {
            const children = instances.$children;
            (instances.$children as any) = new ChooChildrenArray<Vue>(this.setCreate(matchedData))
            children.forEach((item: Vue) => {
              instances!.$children.push(item)
            })
            ChooRouter.resetComponentData.call(instances, matchedData, key)
          } else {
            Object.defineProperty(matched.instances, instancesKey, {
              get: () => instances,
              set: (val?: Vue) => {
                instances = val
                if (instances) {
                  const prototype: any = (instances.$options as any).__proto__
                  if (!prototype.created) {
                    prototype.created = []
                  } else if (!(prototype.created instanceof Array)) {
                    prototype.created = [prototype.created]
                  }
                  prototype.created.splice(0, 0, this.routerCreateHook(matchedData, true));
                }
              }
            })
          }
        })
      })
      next()
    }
  }

  private endRouter() {
    return (): void => {
      this.route.replace = false
    }
  }

  private setCreate (data?: CacheComponent): any {
    const { opt: { key } } = this
    return ({ type }: { type: string }, item?: Vue): void => {
      if (type === 'add') {
        if (!item!.$el) {
          const prototype: any = (item!.$options as any).__proto__
          if (!prototype.created) {
            prototype.created = []
          } else if (!(prototype.created instanceof Array)) {
            prototype.created = [prototype.created]
          }
          prototype.created.splice(0, 0, this.routerCreateHook(data!))
        } else {
          const children = item!.$children || [];
          const keys = item!.$attrs[key]
          if (!keys || !data!.component[keys]) {
            return
          }
          (item!.$children as any) = new ChooChildrenArray<Vue>(this.setCreate(data!.component[keys]))
          children.forEach((components: Vue) => {
            item!.$children.push(components)
          })
        }
      }
    }
  }

  private routerCreateHook(cache: CacheComponent, root: boolean = false): () => void {
    const self = this
    const { opt: { key }, route: { direction } } = this
    const _CHOO_ROUTER_CREATE_ = function (this: Vue): void {
      const keys = this.$attrs[key]
      const cacheFun: (data: {} | null) => {} = (this.$options as any).__proto__.cache
      const hookData: {} = {}
      Object.assign(
        hookData,
        cacheFun ? cacheFun.call(
          this,
          root ? ( direction === Direction.back ? cache.data : null) : (
            direction === Direction.back ? cache.component[keys].data : null
          )
        ) : {}
      )
      this.$nextTick(() => {
        const created: Array<() => void> = (this.$options as any).__proto__.created
        const indexs: number[] = []
        created.forEach((fun: () => void, index: number) => {
          if ((fun as any).names === '_CHOO_ROUTER_CREATE_') {
            indexs.splice(0, 0, index)
          }
        })
        indexs.forEach((index: number) => {
          created.splice(index, 1)
        })
      })
      if (root) {
        Object.assign(Object.keys(this.$data).length ? this.$data : this, cache.data, hookData)
      } else if (keys) {
        Object.assign(
          Object.keys(this.$data).length ? this.$data : this,
          cache.component[keys] ? cache.component[keys].data : {},
          hookData
        )
      }
      (this.$children as any) = new ChooChildrenArray<Vue>(
        self.setCreate(
          root ? cache : cache.component[keys] || { data: {}, component: {} }
        )
      )
    }
    _CHOO_ROUTER_CREATE_.names = '_CHOO_ROUTER_CREATE_'
    return _CHOO_ROUTER_CREATE_
  }

}

class ChooChildrenArray<T> extends Array<T> {
  private callback!: ({}: { type: string, start?: number, deleteCount?: number }, item?: T) => void
  public constructor(callback: ({}: { type: string, start?: number, deleteCount?: number }, item?: T) => void) {
    super()
    this.callback = callback
  }
  public push(item: T): number {
    this.callback({type: 'add'}, item)
    return super.push(item)
  }
  public splice(start: number, deleteCount?: number) {
    this.callback({type: 'remove', start, deleteCount})
    return super.splice(start, deleteCount)
  }
}

const example: ChooRouter = new ChooRouter()

export default example
