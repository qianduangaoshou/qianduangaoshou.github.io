---
title: 使用 browserify 处理virtual-dom模块的一个例子
date: 2020-09-13 21:38:20
tags: js-module	
categories: 源码阅读
---

使用 browserify 来实现程序在node环境和浏览器环境的适配： 适配不同的模块加载方式

有的时候js文件需要在 node 和 浏览器环境下都能执行，除了兼容性问题之外，还有一点是 node 和 浏览器平台引入文件时的模块机制是不同的 ：

Node 中使用 `Commonjs` 的模块加载机制，Commonjs 模块加载机制如下：

使用：使用 `require` 加载模块， 使用 `module.exports` 向外部暴露模块

特定： 模块同时加载，这种特点在 node 环境下是不存在问题的， 因为 node 环境下模块都是在本地磁盘，加载比较快， 但是在浏览器环境下时会出现阻塞渲染的问题

为了解决异步加载模块的问题，`AMD(https://github.com/amdjs/amdjs-api/wiki)`  和 `CMD` 通过不同的方式实现异步加载模块：

AMD   :  相关库： `requireJs`

写法：

```js
define("module", ["dep1", "dep2"], function(d1, d2) {
  return someExportedValue;
});
require(["module", "../file"], function(module, file) { /* ... */ });
```

CMD:  相关库： `seaJs`

``` js
define(function(require, exports, module) {
  var add = require('math').add;
  exports.increment = function(val) {
    return add(val, 1);
  };
});
```

除了 `AMD` 和 `CMD` 两个规范之外，使用`es6`  的模块加载是浏览器的另一种模块加载机制，也是未来的主流

使用 `es6` 模块加载实现动态加载的方法： `import(module)`

```
// 导入 dayJs 模块
// import(...) 返回 promise
const dayJs = await import('dayjs');
```

使用 `browserify` 是如何实现的适配各种模块加载的呢 ？

具体代码如下：

按照 [`virtual-dom`](https://github.com/Matt-Esch/virtual-dom) 这个包为例：这个包的作用是生成虚拟dom对象

执行 `package.json` 中的命令：

```js
"dist": "browserify  virtual-dom index.js > dist/virtual-dom.js",
```

打包时，使用 `browserify` 来处理， 最终打包完成后的文件输出到 `dist/virtual-dom.js` 中， 在打包后的代码中，我们可以看到如下的代码结构：

处理之后的代码中：将原来文件中 `require(...)` 这样的文件引用替换为具体的执行函数

```js
// 自执行方法 f 为下面的 函数1
(function (f) {
    // 这里根据不同的模块加载方式来导出 virtual-dom 这个包的代码
    // 如果是 CommonJs 规范，比如在 node 中使用
    // 这里当执行 f() 之后，执行路径是：
    // 函数1 作为参数 f 传入， 执行 f 函数1 执行 ==>
    // 函数1 执行 ==> 返回函数 e （为自执行函数）
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        // 在不同环境下，给不同全局变量挂载 virtualDom 变量值为 f 函数执行后的结果
        g.virtualDom = f()
    }

})(
  // 函数1 作为参数 f 传入上面的参数
  function () {
    var define, module, exports;
    // 函数 e 也是一个自执行函数，接受三个参数：
    // 这里参数的各个部分
    // t: 表示下面的对象1
    // n: 表示下面的对象2
    // r: 表示下面的对象3
    // 这里返回的结构为 (function e(t, n, r) {})(对象1,对象2,对象3)(4)
    // 函数e为自执行函数，执行后返回函数 s， s 接受 4 作为参数，最终这里 return
    // 的结果为 s(4) 之后的返回值
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                // 这里的 t[o]0 表示每个模块的方法
                // 这里的 t[o]1 表示文件对象，文件对象的键名为引用的文件地址，建值为该文件在对象1中的key
                // 这里使用 call 会立即执行 t[o]0 这个方法
                t[o][0].call(l.exports, function (e) {
                    // 这里的 function (e) {}, l, l.exports 
                    // 分别表示 function (require, module, exports) 中的 require, module,         
                    // exports 这三个参数
                    // 所以当调用 module.exports 的时候， 实际上 module.exports === l.exports
                    var n = t[o][1][e];
                    // 获取到文件地址对象对应的值
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            // 这里是 s 方法的返回值
            return n[o].exports
        }
        var i = typeof require == "function" && require; 
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })(
      // 对象1
      {
      ===== 从之前的代码中抽取出来的一些代码 =====
      这个对象中的元素的结构都是一样的：
      对象的键key为数字，表示当前文件的标识
      对象的值是一个数组， 这个数组中有两个元素，一个元素是 `function(require, module, exports) {}` 			方法包裹的文件内的方法，另外一个元素是上面文件中使用 require 引用的文件路径和文件标识对象
      ...
      // 为什么这里要先进行处理呢 ？ 因为可以认为这里是程序的主入口
      // 分析程序先从这里进入开始分析
      4: [function (require, module, exports) {
        var diff = require("./diff.js")
        var patch = require("./patch.js")
        var h = require("./h.js")
        var create = require("./create-element.js")
        var VNode = require('./vnode/vnode.js')
        var VText = require('./vnode/vtext.js')

        module.exports = {
          diff: diff,
          patch: patch,
          h: h,
          create: create,
          VNode: VNode,
          VText: VText
        }

      }, {
        "./create-element.js": 1,
        "./diff.js": 2,
        "./h.js": 3,
        "./patch.js": 13,
        "./vnode/vnode.js": 31,
        "./vnode/vtext.js": 33
      }],
      ...
    }, 
    // 对象2
    {}, 
    // 对象3
    [4]
    // 这里的参数 （4） 实际上是 上面函数 s 接受的参数
   )(4)
  }
);
```

