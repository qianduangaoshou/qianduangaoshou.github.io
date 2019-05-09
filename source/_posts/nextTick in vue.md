---
title: nextTick in vue.js
date: 2019-05-09 17:10:27
tags: vue 源码
categories: vue 源码阅读
---

### nextTick 方法

`nextTick` 方法是挂载到 vue 实例上面， 我们可以通过使用 `this.$nextTick` 来使用这个方法。

这个方法的作用是：

> 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 `Vue.nextTick` 一样，不同的是回调的 `this` 自动绑定到调用它的实例上。 

首先， 当我们在页面上面调用这个方法的时候， 在 `vue` 内部， 函数执行的路径是什么样的：

定义 `nextTick`:

```js
mounted() {
  this.$nextTick(() => {
    console.log('nextTick');
  });
}
```

查看调用栈：

{% asset_img 1.jpg %}

查看上面的调用栈得知， 当调用 `nextTick` 的时候，直到执行函数依次经历：

`nextTick`  `timeFunc`  `flushCallbacks`

那么 `nextTick` 方法在 `vue` 中是如何起作用的？

`nextTick` 方法定义：

```js
// cb: 回调函数
// ctx 上下文对象
function nextTick (cb, ctx) {
    var _resolve;
    // callbacks 中用来存放所有 nextTick 中的 cb 函数
    callbacks.push(function () {
      if (cb) {
        try {
          // 当 cb 存在的时候， 执行回调函数
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
        // 否则， 返回一个 promise
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    // 这里保证不会执行 两次 timeFunc
    if (!pending) {
      pending = true;
      timerFunc();
    }
    // $flow-disable-line
    // 当没有回调函数的时候， 返回一个 promise
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }
```

当我们调用 nextTick 的时候， 会将回调函数存入 `callbacks` 数组中， 这个数组用来存放当前组件中使用 `nextTick` 方法时的回调函数。

`timeFunc` 函数：

 这个函数用来在合适的时机调用 `nextTick` 中推入 `callback` 列表中的所有函数， 所有代码如下：

```js
// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Techinically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

上面的代码表明， `nextTick` 中的回调函数的执行时机优先在`microTask` 执行的时候执行， 否则， 在 宏任务的时候执行代码。

`flushCallbacks` 函数用来执行 `callbacks` 中存放的函数列表：

```js
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

