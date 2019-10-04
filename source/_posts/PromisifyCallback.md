---
title: promisify callback-style function
date: 2019-10-03 22:47:16
tags: promisify
categories: promsie
---

将一个回调函数转换为 `promise` 类函数，在  `promisify` 化的函数的 `then` 方法里面执行回调函数， 避免回调地狱。

这样相当于我们日常代码开发中，对于某个函数返回一个 `promise`, 以期在函数的 `then` 方法里面处理数据的方法的一个封装。

```js
function process() {
  return new Promise((resolve, reject) => {
    // some data process code...
    try () {
      resolve(data);      
    } catch (err) {
      reject(err);
    }
  });
}

process().then(data => {...});
```

在 node.js 中， 存在一个工具方法为 `utils.promisfy` 的工具方法， 这个方法将回调转换为 `promise` 类方法：

```js
// error-first 类型回调
// 回调cb 的第一个参数为 error， 如果没有传 false
function fn(cb) {
  return cb(false, 'hello');
}
const utils = require('util');

const promiseFn = utils.promisify(fn);

promiseFn().then((data) => {
  console.log(data);
});
// 使用这个方法， 可以将 node 中的一些异步的回调
// 比如： readFile 等
const fs = require('fs');


const promiseReadFile = utils.promisify(fs.readFile);

promiseReadFile('./.gitignore', 'utf-8').then(data => {
  console.log(data);
});
// 等同于
fs.readFile('./.gitignore', 'utf-8', function (err, data) {
  console.log(data);
});
```

在 `promisify` 出现之前，使用 [pify](<https://github.com/sindresorhus/pify>) 实现相同的功能

`pify` 模块的核心代码不多,  下面是全部的代码：

```js
'use strict';

// 核心处理方法
// fn：将要被 promise 化的函数
// options: 相关配置选项
// args: 传入函数的相关参数
// 实际执行的时候， 执行这个方法返回的方法， 其中 args 为传入的参数
// 这里 args 是一个数组， 通过 push 回调的方法
const processFn = (fn, options) => function (...args) {
	const P = options.promiseModule;

	return new P((resolve, reject) => {
    // multiArgs： 是否传入多个参数
		if (options.multiArgs) {
      // push 一个方法函数， 这个函数就是我们在原函数中手动
      // 调用的回调函数 cb， 参数是我们手动写入回调函数中的参数
			args.push((...result) => {
        // errorFirst: 是否包含错误， 适配 node 如 fs.exists() 类的方法
				if (options.errorFirst) {
					if (result[0]) {
						reject(result);
					} else {
						result.shift();
						resolve(result);
					}
				} else {
					resolve(result);
				}
			});
		} else if (options.errorFirst) {
			args.push((error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		} else {
			args.push(resolve);
		}
    // 这个时候， args 中传入了相关的回调方法
		fn.apply(this, args);
	});
};

module.exports = (input, options) => {
	options = Object.assign({
		exclude: [/.+(Sync|Stream)$/],
    // errorFirst: 回调函数中是否第一个参数为 error
		errorFirst: true,
		promiseModule: Promise
	}, options);

	const objType = typeof input;
	if (!(input !== null && (objType === 'object' || objType === 'function'))) {
		throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${input === null ? 'null' : objType}\``);
	}

	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
    // options 中的 include 和 exclude 属性分别表示
    // 模块中可以被序列化的方法
		return options.include ? options.include.some(match) : !options.exclude.some(match);
	};

	let ret;
  // 当传入的 input 为函数的时候
	if (objType === 'function') {
		ret = function (...args) {
      // excludeMain：是否对于一些 module 内部方法 做 promise 化
			return options.excludeMain ? input(...args) : processFn(input, options).apply(this, args);
		};
  // 否则 ret 为包含有 input 上面的属性的对象
	} else {
		ret = Object.create(Object.getPrototypeOf(input));
	}

  // 对于 input 参数对象或者函数上面的每一个方法都做 promise 化
	for (const key in input) { // eslint-disable-line guard-for-in
		const property = input[key];
		ret[key] = typeof property === 'function' && filter(key) ? processFn(property, options) : property;
	}

	return ret;
};

```

`utils.promisify` 方法

`promisify` 方法是 node 内置的 `promise` 化回调函数的工具方法