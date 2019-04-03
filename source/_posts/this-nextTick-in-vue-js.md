---
title: this.nextTick in vue.js
date: 2018-01-21 17:50:07
tags: this.nextTick
categories: Vue
---

### `this.nextTick` 的作用

在 `Vue.js` 的官方文档中是这样描述 `this.nextTick` 的:

>为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用 `Vue.nextTick(callback)` 。这样回调函数在 DOM 更新完成后就会调用.

在 `vue.js` 中, 使用 `this.nextTick` 的作用是更新 `dom` , 在 涉及关于在 `vue.js` 中 `Dom` 的操作中, 当我们想要操作被更新后的 `DOM`的时候，可以使用 `this.nextTick` 进行操作。

### 为什么采用   `this.nextTick`  

>Vue **异步**执行 DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部尝试对异步队列使用原生的 `Promise.then` 和 `MessageChannel`，如果执行环境不支持，会采用 `setTimeout(fn, 0)` 代替。

使用 `this.nextTick` 的两种情况:

1.  在 `created` 阶段的时候， 这个时候 `DOM` 元素尚未挂载, 在这个钩子函数内操作 `DOM` 是无法找到 `DOM` 元素的， 这个时候使用 `this.nextTick` 类似于使用 `mounted` 的钩子函数， 这个时候所有的 `DOM` 元素挂载和渲染均已经完成，这个时候可以执行对于 `DOM` 元素的操作。

2.  当我们想要对于数据发生变化之后的 `DOM` 元素之后执行一些操作的时候， 我们可以使用 `this.nextTick(callback)` 那么 `callback` 回调函数就会当 `DOM` 元素被更新之后被触发。

   ​

   ![https://cn.vuejs.org/images/lifecycle.png](https://cn.vuejs.org/images/lifecycle.png) 

上图是 `vue` 实例的生命周期图。

