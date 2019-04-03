---
title: es6-promise
date: 2017-10-30 22:53:22
tags: promise
categories: 'es6'
---
#### resove and reject

使用 `es6` 回调函数的例子

```
let promise = new Promise(function (resolve, reject) {
  if (/* 如果异步操作成功 */) {
      resolve(value);
  } else {
      reject(error)
  }
})
```
在上面的函数中，调用promise 构造函数创建了一个 promise 对象, 这个构造函数接收一个函数作为参数, 在函数中存在两个参数 `resolve` 和 `reject` , 这两个参数是两个函数, 用来执行回调的作用

>resolve
>resove 是作为异步回调成功之后需要执行的函数
>reject
>reject 是作为异步回调失败之后需要进行执行的函数
>
>在 promise 的对象中, 可以通过进行判断来选择执行 resolve 或者 reject 函数  

使用 `promise` 进行 `ajax` 请求的函数如下:

```
/**
* @description promise 的 ajax 请求
* @param url {String} ajax 请求的地址
* @param method {String} ajax 请求的方法 'get' or 'method'
* @return promise 新的 promise 请求对象
**/
let ajax = function (url, method) {
  let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onreadystatechange = handler;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
    function handler() {
      if (this.readystate !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statuText));
      }
    };
  });
  return promise;
};

ajax(url, 'get').then((json) => {
  console.log('请求成功之后返回的数据', json);
}, (error) => {
  console.error('出现的错误' + error);
});
```



#### promise.then() 

在创建完成 promise 实例之后, 可以调用 promise.then() 中指定具体的回调成功或者失败的具体函数

> promise.then() 用于接收两个回调函数作为参数, 第一个回调函数是当 Promise 对象状态变为 resolve 的时候执行的函数,表示上面的 resolve 函数, 第二个回调函数是当 Promise 对象状态变为reject 的时候执行的函数, 也就是表示上面的 reject 函数,这两个函数都可以接收 promise 传入的值作为函数参数

```
promise.then(function(value) {
  // when promise success do something
}, function(error) {
  // when promise failed do something
})
```

#### promise.all()

使用 promise.all() 方法用于将多个 `promise` 实例, 包装为一个 `promise` 实例

`Promise.all([promise1, promise2, promise3])`

使用 `Promise.all` 接收的是一个数组作为参数， 其中 `promise1` `promise2` `promise3` 分别是 `Promise` 的实例

关于使用 `Promise.all` 的状态:

1. 只有 `promise1 promise2 promise3` 的状态都变成了 `fullfilled` 的状态,  `Promise.all` 的状态才会变成 `fullfilled` 并且三个 `promise` 的返回值组成一个数组, 传递给 `Promise.all` 的回调函数。 
2. 当三个 `promise` 中存在一个为 `reject` 的时候, `Promise.all` 的状态就会变成 `reject` , 这个时候 ,  被  `reject`    实例 的返回值被传递给`Promise.all` 的回调函数.

```
const firstNamePromise = namePromise.then(getFirstName);
const lastNamePromise = namePromise.then(getLastName);
Promise.all([firstNamePromise, lastNamePromise]).then(([firstName, lastName]) => nextAction(firstName, lastName));
```

注意: 上面使用到了对于对象的解构赋值操作, 在上面的函数中 

firstNamePromise 的返回值被赋给 firstName,  lastNamePromise 的返回值被赋给 lastName

++++

对于对象的解构赋值而言,我们可以这样赋值

```
let a = 2;
let b = 3;
// 这样
let [a, b] = [2, 3];
```



++++

#### promise .race()

使用 `promise.race()` 类似于 `promise.all` 方法, 将多个 `promise` 实例包装为一个 `promise` 方法

`let p = promise.race([p1, p2, p3])`  

只要上面的 `p1, p2, p3` 中有一个的实例率先发生变化, 那么 `p` 的状态就会发生变化, 率先发生变化的返回值就会传递给 `p` 函数。

#### 其他方法

#####   `promise.finally`

使用 `promise.finally` 的方法的作用在于: 不管 `promise` 的最后的状态是什么, 使用 `promise.finally` 内的回调函数始终会被执行;

例如: 请求之前的指示器打开或者关闭：

```vue
this.indicator.show();
let promise = new Promise();
promise.then(
// callback success fn
).catch(e => {
  this.toast(e.message)
}).finally(() => {
  this.indicator.hide()
})
```





 