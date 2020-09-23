---
title: axios + vue 实现页面销毁时请求取消
date: 2020-09-22 21:28:39
tags: cancel request
categories: 代码
---

在日常的开发中，会遇到这样的需求：

我们想要当离开当前页面的时候， 这个页面上的请求的接口不会继续请求

使用 `vue` + `axios` 来实现手动取消请求的功能：

代码如下：

`cancelRequest.js`

```js
import axios from 'axios'

class Collector {
  constructor(axiosIns, cancelList) {
    this.axiosIns = axiosIns
    this.cancelList = cancelList || []
    const handlersCount = this.getAllHandlers().length
    this.handlerIndex = handlersCount ? handlersCount - 1 : 0
    this.insertInterceptors = {}
  }
  getCancelKeys() {
    return this.cancelList.map(({ key }) => key)
  }
  hasKey(key) {
    return this.getCancelKeys().includes(key)
  }
  get(cancelKey) {
    return this.cancelList.find(({ key }) => cancelKey === key)
  }
  getAllHandlers() {
    return this.cancelList.reduce((allHandlers, { handlerList }) => {
      allHandlers = [...allHandlers, ...handlerList]
      return allHandlers
    }, [])
  }
  getHandlers(cancelKey) {
    if (!this.hasKey(cancelKey)) {
      return []
    }
    return this.get(cancelKey).handlerList
  }
  removeInsertInterceptors() {
    const interceptors = this.axiosIns.interceptors
    Object.entries(this.insertInterceptors).forEach(([type, incpts]) => {
      const handlers = interceptors[type].handlers
      incpts.forEach(interceptor => {
        const incptIndex = handlers.indexOf(interceptor)
        if (incptIndex !== -1) {
          interceptors[type].handlers.splice(incptIndex, 1)
        }
      })
    })
    this.insertInterceptors = {}
  }
  removeHandler(removeKey, handlerIndex) {
    const handlerList = this.getHandlers(removeKey)
    handlerList.length && handlerList.splice(handlerIndex, 1)
    if (!handlerList.length) {
      this.remove(removeKey)
    }
  }
  remove(key) {
    if (!this.hasKey(key)) return
    const keyIndex = this.getCancelKeys().indexOf(key)
    this.cancelList.splice(keyIndex, 1)
  }
  cancel(key) {
    if (key !== undefined) {
      let handlerList = this.getHandlers(key)
      for (let i = 0; i < handlerList.length; i++) {
        handlerList[i]()
      }
      this.remove(key)
    } else {
      const handlerList = this.getAllHandlers()
      handlerList.forEach(handler => handler())
      this.cancelList = []
    }
  }
  add(cancelObj) {
    const { key, handler } = cancelObj
    this.handlerIndex++
    if (!this.hasKey(key)) {
      this.cancelList.push({ key, handlerList: [handler] })
    } else {
      const existHandlers = this.getHandlers(key)
      this.get(key).handlerList = [...existHandlers, handler]
    }
  }
}

class CancelRequest {
  constructor(config) {
    const defaultConfig = {
      vm: null,
      includes: []
    }
    this.config = Object.assign({}, defaultConfig, config)
    this.cancelReqCollectorList = []
    if (this.config.vm) {
      this._vmDestroyedCancel()
    } else {
      console.warn('config vm is null, request will not be canceld when component destroyed')
    }
  }
  getAllAxiosInstance() {
    return this.cancelReqCollectorList.map(({ axiosIns }) => axiosIns)
  }
  getCollector(instance) {
    let existCollector = this.cancelReqCollectorList.find(({ axiosIns }) => axiosIns === instance)
    if (!existCollector) {
      existCollector = new Collector(instance)
      this.cancelReqCollectorList.push(existCollector)
    }
    return existCollector
  }
  // 拦截 vue 中的 _isDestroyed 属性， 当组件销毁时，取消请求
  _vmDestroyedCancel() {
    let isDestroyed = this.config.vm._isDestroyed
    Object.defineProperty(this.config.vm, '_isDestroyed', {
      set: val => {
        isDestroyed = val
        if (val) this.cancel(true)
      },
      get() {
        return isDestroyed
      }
    })
  }
  getTokenKey(config) {
    const { baseURL, url } = config
    if (url.startsWith('http')) {
      return url
    }
    return `${baseURL}${url}`
  }
  getSource() {
    const cancelToken = axios.CancelToken
    let source = cancelToken.source()
    return source
  }
  insertInterceptor(interceptors, collector) {
    const { request, response } = interceptors
    const requestInt = {
      fulfilled: config => {
        const setKey = this.getTokenKey(config)
        const source = this.getSource()
        const isValidIncludes = Array.isArray(this.config.includes) && this.config.includes.length
        const isMatch = isValidIncludes && this.config.includes.some(includeKey => setKey.includes(includeKey))
        if (!isValidIncludes || isMatch) {
          config.cancelToken = source.token
          collector.add({ key: setKey, handler: source.cancel })
          config.cancelHandlerIndex = collector.handlerIndex
        }
        return config
      },
      rejected: null
    }
    const successRespInt = {
      fulfilled: resp => {
        const handlerIndex = resp.config.cancelHandlerIndex
        const removeKey = this.getTokenKey(resp.config)
        collector.remove(removeKey, handlerIndex)
        return resp
      },
      rejected: null
    }
    const errorRespInt = {
      fulfilled: null,
      rejected: error => {
        const isCancel = axios.isCancel(error)
        if (!isCancel) {
          const handlerIndex = error.config.cancelHandlerIndex
          collector.remove(this.getTokenKey(error.config), handlerIndex)
        }
        return Promise.reject(error)
      }
    }
    collector.insertInterceptors = {
      request: [requestInt],
      response: [successRespInt, errorRespInt]
    }
    request.handlers.unshift(requestInt)
    response.handlers.unshift(successRespInt, errorRespInt)
  }
  // 向 axios 实例中注入token
  insertToken(axiosInstance) {
    const collector = this.getCollector(axiosInstance)
    const interceptors = axiosInstance.interceptors
    this.insertInterceptor(interceptors, collector)
    return collector
  }
  cancel(isDestroyed) {
    this.cancelReqCollectorList.forEach(collector => {
      collector.cancel()
      if (isDestroyed) {
        collector.removeInsertInterceptors()
      }
    })
    if (isDestroyed) {
      this.cancelReqCollectorList = []
    }
  }
}

export default CancelRequest

```

使用方法如下：在组件中

```js
let http = axios.create()
// this 为当前组件对象
// 在使用 http 来请求时，调用下面的方法
const cancelRes = new CancelRequest({ vm: this })
const cancelCollector = cancelRes.insertToken(http)

// 当需要取消请求时：
// 使用 cancel 方法来取消使用 http axios 实例来发起的请求
cancelCollector.cancel() 
// 或者传入配置 vm: this 时
// 当当前页面销毁时，会自动将当前页面正在发起的请求 cancel 掉
```

