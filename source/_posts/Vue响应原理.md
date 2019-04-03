---
title: Vue.js学习（一）
date: 2017-09-09 11:32:30
tags: vue 响应原理
categories: Vue
---

### Vue的响应原理

![](https://cn.vuejs.org/images/data.png)

上面这张图表示的就是 vue 的响应原理:

当我们将数据添加入 vue 实例中的 `data` 选项中的时候, vue 将遍历data 中数据的所有属性，并且调用 `Object.defineProperty` 方法将属性记录为依赖。当数据发生改变的时候,就会调用 `object.defineProperty` 中的 `setter` 方法,

在组件实例中存在一个 `watcher` 对象，这个对象的目的是：当被记录的依赖被调用的时候,也就是属性的 `setter` 被调用的时候，会通知`watcher` 对象进行重新渲染组件

### Object.defineProperty

```
Object.defineProperty(Object, property, {
  get () {
  	// 读取对象Object 的属性 property 的时候调用的函数
  },
  set (newVal) {
   // 设置对象 Object 的属性 property 的时候调用的函数
  }
})
```

通过使用这种方法，调用 `getter` 和 `setter` 可以实现追踪对象属性的变化  

### `vue.js` 中的 生命周期

在 `vue.js` 中

