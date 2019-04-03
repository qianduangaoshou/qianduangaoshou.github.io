---
title: blob 对象
date: 2019-01-12 16:44:49
tags: blob
categories: js
---

js 中的 blob 数据类型：

### Blob

###### 什么是 blob ？

blob 代表了一个存放文d件数据的字节包， 使用 blob 可以代替 file， 我们可以在使用 file 的地方使用 blob 作为代替。同样， blob也有和 文件 file 类似的 size 和 MIME 属性。

在 blob 中可以存放二进制数据， 同时我们可以使用 arrayBuffer 进行读取数据。



###### 创建 blob：

```javascript
new Blob(array, [,options]);
// array is an Array of ArrayBuffer, ArrayBufferView, Blob, DOMString objects, or a mix // of any of such objects, that will be put inside the Blob. DOMStrings are encoded as // UTF-8.
// options 是可选的额外参数， 比如， 可以传递一个 type， 表示放入 blob 中的数据的 MIME 类型
```

如下， 将字符串保存到 blob 中， type 为 “text／plain”

```
const blob = new Blob(["hello world"], { type: 'text/plain' });
```



###### 读取blob

如果我们直接打印出 blob 是不能打印出来的

```javascript
Blob(11) {size: 11, type: "text/plain"}
```

我们可以通过使用 FileReader 读取 blob 中的数据：

> FileReader 是 web 用来异步读取电脑上的文件或者blob数据的对象， 其对于从web端操作文件提供了一系列的方法， 具体内容查看 [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)

```javascript
const reader = new FileReader();
reader.readAsText(blob);
rader.onloadend = () => {
  console.log("result", reader.result);
};
// result "hello world"
```



###### 我们可以使用 blob来做什么？

blob 提供了用于操作二进制数据的一些接口， 一些可以用来操作二进制数据的api 比如 file 对象， 都是建立在blob的对象基础之上的， 继承了blob 的一些属性和方法。