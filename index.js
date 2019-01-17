class Vue {
  constructor ({
    el,
    data,
    methods,
    mounted
  }) {
    this.dom = document.querySelector(el)
    this._html = this.dom.innerHTML

    this.observer(data)

    // 将 data 里的数据收集到 this
    Object.keys(this.data).forEach(k => {
      Object.defineProperty(this, k, {
        get: () => {
          return this.data[k]
        },
        set: newV => {
          this.data[k] = newV
          return newV
        }
      })
    })

    // 将 methods 里的方法收集到 this
    Object.keys(methods).forEach(method => this[method] = methods[method].bind(this))

    // 第一次渲染
    this.render()

    // 第一次渲染后调用 mounted 方法
    mounted.bind(this)()
  }

  observer (object) {
    // this.data = object
    // Object.keys(object).forEach(k => {
    //   this.defineReactive(object, k, object[k])
    // })
    const _this = this
    this.data = new Proxy(object, {
      get: function (target, key, receiver) {
        return Reflect.get(target, key, receiver)
      },
      set: function (target, key, value, receiver) {
        _this.render()
        return Reflect.set(target, key, value, receiver)
      }
    })
  }

  defineReactive (object, k, v) {
    Object.defineProperty(object, k, {
      get: () => {
        return v
      },
      set: newV => {
        v = newV
        this.render()
        return newV
      }
    })
  }

  render () {
    console.log('rendering')
    // 没有使用 VNode，性能很差的渲染，每次遍历整个 HTML 文档
    const regExp = /\{(.*)\}/g
    const matched = this._html.match(regExp)
    this.dom.innerHTML = this._html
    matched.forEach(m => {
      const k = m.replace(/^\{|\}$/g, '').trim()
      const v = this.data[k]
      this.dom.innerHTML = this.dom.innerHTML.replace(m, v)
    })
  }
}
