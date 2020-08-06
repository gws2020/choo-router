import random from 'string-random'
import Vue, { PluginObject, PluginFunction } from 'vue'
import VueRouter, { Route, NavigationGuardNext, RouteRecord, RawLocation, NavigationGuard } from 'vue-router'
import ChooRoute, { Direction } from './route'
import ChooRouterView from './choo-router-view'

class InitOptions {
  public router!: any
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

interface InstancesModel {
  [key: string]: Vue | undefined
}

type MatchedModel = InstancesModel[]

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

  private static getMatchedModel(matchedList: RouteRecord[]): MatchedModel {
    const model: InstancesModel[] = []
    matchedList.forEach((matched: RouteRecord, index: number) => {
      const keyList: string[] = Object.keys(matched.components)
      const instancesModel: InstancesModel = model[index] = {}
      keyList.forEach((key: string) => {
        instancesModel[key] = matched.instances[key]
      })
    })
    return model
  }

  private router!: VueRouter
  private key: string = 'crk'

  private keyList: string[] = []
  private data: any = {}
  private replace: boolean = false
  private route: ChooRoute = new ChooRoute()

  public getCache (): {} {
    return this.data
  }

  public install: PluginFunction<InitOptions> = (
    vue: typeof Vue,
    options: InitOptions = {
      router: null,
      key: 'crk'
    }
  ): void => {
    const router: VueRouter = options.router
    if (!router) {
      throw(new Error('router 为必要参数'))
    }
    if (!(router instanceof VueRouter)) {
      throw(new Error('router 必须为 VueRouter 实例'))
    }
    this.router = router
    this.key = options.key || this.key
    Object.defineProperty(Vue.prototype, '$chooRouter', {
      get: () => this.route.$data
    })

    this.regComponent(vue)
    this.resetReplace()
    this.initRouter()

  }

  private regComponent(vue: typeof Vue) {
    vue.component('choo-router-view', ChooRouterView)
  }

  // 重写 router.replace
  private resetReplace(): void {
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
      self.replace = true
      return oldReplace.call(this, location, onComplete, onAbort)
    }

    router.replace = (newReplace as any)
  }

  private initRouter(): void {
    const { router } = this

    router.beforeEach(this.createRouteKey())

    router.beforeEach(this.routerDirection())

    router.beforeEach(this.setRouterCache())

    router.beforeEach(this.getRouterCache())

    router.beforeEach(this.reuseCache())

    router.afterEach(this.recoveryAllChildrenArray())

    router.afterEach(this.endRouter())
  }

  // 创建 routerKey
  private createRouteKey(): NavigationGuard {
    const { key } = this
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
        this.router[root || this.replace ? 'replace' : 'push']({
          path: to.path,
          query: newQuery
        })
        return
      } else {
        return next()
      }
    }
  }

  // 判定方向
  private routerDirection(): NavigationGuard {
    const { key, keyList, route, data } = this
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
        if (!this.replace) {
          const removeRouteKeyList: string[] = keyList.splice(toIndex + 1, fromIndex - toIndex)
          removeRouteKeyList.forEach((keys: string) => {
            delete data[keys]
          })
          route.direction = Direction.back
        }
      } else {
        if ( from.name === null ) {
          route.direction = Direction.enter
          keyList.push(toKeys)
        } else {
          route.direction = Direction.forward
          keyList.push(toKeys)
        }
      }
      if (this.replace) {
        this.route.direction = Direction.replace
      }
      next()
    }
  }

  // 存储缓存
  private setRouterCache(): NavigationGuard {
    const { key, route, data } = this
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      const query: { [ key: string ]: any } = from.query
      const keys: string = query[key]
      if ( route.direction !== Direction.back ) {
        if (!keys) {
          return next()
        }
        const rootData: Array<{}> = data[keys] = []
        from.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const matchedData: {[key: string]: CacheComponent} = rootData[matchedIndex] = {}
          const matchedKey: string[] = Object.keys(matched.instances)
          for (const instancesKey of matchedKey) {
            const instances: Vue = matched.instances[instancesKey]
            const replaceCache: boolean = (instances.$attrs['replace-cache'] as any) === true
            if (this.replace && !replaceCache) {
              return
            }
            matchedData[instancesKey] = {
              data: Object.assign({}, instances.$data),
              component: {}
            }
            ChooRouter.setComponentCache(matchedData[instancesKey], instances, key)
          }
        })
      }
      next()
    }
  }

  // 读取缓存
  private getRouterCache(): NavigationGuard {
    const { key, data } = this
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
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
          Object.defineProperty(matched.instances, instancesKey, {
            get: () => instances,
            set: (val: Vue) => {
              instances = val
              const prototype: any = Object.getPrototypeOf(val.$options)
              if (!val.$el) {
                if (!prototype.created) {
                  prototype.created = []
                } else if (!(prototype.created instanceof Array)) {
                  prototype.created = [prototype.created]
                }
                prototype.created.splice(0, 0, this.routerCreateHook(matchedData, true))
              }
            }
          })
        })
      })
      next()
    }
  }

  // 缓存共享
  private reuseCache(): NavigationGuard {
    const { key, data } = this
    return (
      to: Route,
      from: Route,
      next: NavigationGuardNext
    ): void => {
      if (this.route.direction === Direction.back) {
        return next()
      }
      const toModel: MatchedModel = ChooRouter.getMatchedModel(to.matched)
      const toQuery: { [ key: string ]: any } = to.query
      const fromQuery: { [ key: string ]: any } = from.query
      const toKeys: string = toQuery[key]
      const fromKeys: string = fromQuery[key]

      const fromModel: MatchedModel = ChooRouter.getMatchedModel(from.matched)
      toModel.forEach((toMap: InstancesModel, toIndex: number) => {
        const toInstancesKeyList: string[] = Object.keys(toMap)
        for (const toInstancesKey of toInstancesKeyList) {
          if (toInstancesKey) {
            const toInstances: Vue | undefined = toMap[toInstancesKey]
            if (!toInstances) {
              return
            }
            let status = false
            for (const fromMap of fromModel) {
              const fromInstancesKeyList: string[] = Object.keys(fromMap)
              const fromIndex: number = fromModel.indexOf(fromMap)
              for (const fromInstancesKey of fromInstancesKeyList) {
                if (fromInstancesKey) {
                  const fromInstances: Vue | undefined = fromMap[fromInstancesKey]
                  if (toInstances === fromInstances) {
                    status = true
                    data[toKeys] = data[toKeys] || []
                    data[toKeys][toIndex] = data[toKeys][toIndex] || {}
                    data[toKeys][toIndex][toInstancesKey] = data[fromKeys][fromIndex][fromInstancesKey]
                    break
                  }
                }
                if (status) {
                  break
                }
              }
            }
          }
        }
      })
      next()
    }
  }

  private recoveryAllChildrenArray(): (to: Route, from: Route) => any {
    return (
      to: Route,
      from: Route
    ): void => {
      Vue.nextTick((): any => {
        to.matched.forEach((matched: RouteRecord, matchedIndex: number) => {
          const instances: {[key: string]: Vue} = matched.instances
          const instancesList: string[] = Object.keys(matched.components)
          matched.instances = {}
          instancesList.forEach((instancesKey: string) => {
            matched.instances[instancesKey] = instances[instancesKey]
            this.recoveryComponentChildrenArray(instances[instancesKey])
          });
        })
      })
    }
  }

  private endRouter(): (to: Route, from: Route) => any {
    return (): void => {
      this.replace = false
    }
  }

  private recoveryComponentChildrenArray(component: Vue): void {
    if (!component) {
      return
    }
    const children: Vue[] = component.$children;
    (component.$children as any) = []
    children.forEach((components: Vue) => {
      component.$children.push(components)
      this.recoveryComponentChildrenArray(components)
    })
  }

  private setCreate (data?: CacheComponent): ({ type }: { type: string }, item?: Vue) => void {
    return ({ type }: { type: string }, item?: Vue): void => {
      if (type === 'add') {
        if (!item!.$el) {
          const prototype: any = Object.getPrototypeOf(item!.$options)
          if (!prototype.created) {
            prototype.created = []
          } else if (!(prototype.created instanceof Array)) {
            prototype.created = [prototype.created]
          }
          prototype.created.splice(0, 0, this.routerCreateHook(data!))
        }
      }
    }
  }

  // 注入到组件的created的钩子
  private routerCreateHook(cache: CacheComponent, root: boolean = false): (this: Vue) => void {
    const self = this
    const { key, route: { direction } } = this
    const _CHOO_ROUTER_CREATE_: (this: Vue) => void = function (this: Vue): void {
      const keys = this.$attrs[key]
      const prototype = Object.getPrototypeOf(this.$options)
      const cacheFun: (data: {} | null) => {} = prototype.cache
      const hookData: {
        [key: string]: any
      } = {}
      this.$nextTick(() => {
        const created: Array<() => void> = prototype.created
        const index = created.indexOf(_CHOO_ROUTER_CREATE_)
        if (index >= 0) {
          created.splice(index, 1)
        }
      })
      if (prototype.name === 'ChooRouterView') {
        return
      }
      Object.assign(
        hookData,
        cacheFun ? cacheFun.call(
          this,
          root ? ( direction === Direction.back && cache ? cache.data : null) : (
            direction === Direction.back ? (
              cache.component[keys] ? cache.component[keys].data : (keys ? {} : null)
            ) : null
          )
        ) : {}
      )
      if (root) {
        Object.assign(Object.keys(this.$data).length ? this.$data : this, cache ? cache.data : {}, hookData)
      } else if (keys) {
        Object.assign(
          Object.keys(this.$data).length ? this.$data : this,
          cache.component[keys] ? cache.component[keys].data : {},
          hookData
        )
      }
      (this.$children as any) = new ChooChildrenArray<Vue>(
        self.setCreate(
          root ? (cache || { data: {}, component: {} }) : (cache.component[keys] || { data: {}, component: {} })
        )
      )
    }
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
