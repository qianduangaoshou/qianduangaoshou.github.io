---
title: promise中的错误捕获
date: 2019-09-27 17:02:31
tags: promise catch
categories: promise
---

在代码中， 我们对于不能预知的代码通常会使用 `try catch` 来捕获代码错误，当代码内部发生错误时， 对于错误进行捕获， 可以防止代码的错误阻塞后续代码的执行，并且我们可以对于代码的错误进行后续处理；

在 `promise` 中， 对于错误的处理或许稍有不同， 需要注意下面几点：

* 使用 `try catch` 只能捕获同步代码， 不能捕获异步代码， 在 `async` 函数内， 使用 `await` 可以捕获异步代码，这里实际上是异步代码变成了同步代码
* `promise` 内部代码的错误会沿着 `promise` 代码链传递， 直到被 `promise` 的 `catch` 方法或者上一层 `async`  函数内的  `try catch` 方法捕获到, 如果没有使用 `catch` 方法指定错误处理的回调函数， `Promise` 对象抛出的错误不会传递到外层的 `promise`；这个时候会报： `UnhandledPromiseRejectionWarning:`

#### `try catch` 处理`async` 函数内异步

使用 `try catch` 只能处理同步的代码， 对于异步代码中的代码错误， 使用 `try catch` 是无法捕获到的：

```js
function promise() {
  return new Promise(() => {
    throw new Error('error');
  });
}

function tryError() {
  try {
    promise();
  } catch (error) {
    console.log('error');
  }
}

tryError();
// UnhandledPromiseRejectionWarning: Error: error
```

在 `async ` 函数内部使用 `try catch`可以捕获到异步错误：

```js
async function tryError() {
  try {
    await promise();
  } catch (error) {
    console.log('error');
  }
}
tryError();
// error
```

#### `promise.catch 错误捕获`

使用 `promise.catch` 方法可以对于当前 `promise` 链上的代码进行错误捕获，当 `promise` 内部发生错误的时候， 错误会沿着 `promise` 链向后传递， 直到被 `promise` 后面的 `catch` 方法捕获到：

```js
function apromise() {
  return new Promise(() => {
    console.log(b);
  })
}

apromise().then(() => {
  throw new Error('error');
}).catch(err => {
  console.log('error', err);
});
// error: b is not defined
```

当在 `promise` 链中没有 `catch` 方法的时候， `promise` 中发生的错误不会被上层的 `promise` 中的catch 捕获, 即使我们使用了 `throw new Error` 的方式对错误进行抛出也是如此；

因为 `async` 函数返回一个 `promise` 对象， 我们在 `async` 函数内部定义一个 `Error`

```js
function promise() {
  return new Promise(async () => {
    throw new Error('error');
  }).catch(err => {
    console.log('error');
  });
}
promise();
// UnhandledPromiseRejectionWarning: Error: error
// 这里 async 函数内部抛出的错误不会被外部的 catch 方法捕获到， 因为错误不能传递到外层
// 的 `promise`
```

