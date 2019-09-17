---
title: decode & encode
date: 2019-09-15 10:53:26
tags: Base64
categories: Base64
---

[js-base64](<https://github.com/dankogai/js-base64>) 是用来对于字符编码和解码操作的一个包， 可以用这个包实现原始字符与 base64 编码后字符之间的转换；

核心代码：

获取base64 对应字符在字符表中十进制值：

```js
var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var b64tab = function(bin) {
  var t = {};
  for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
  return t;
}(b64chars);
```

字符解码：

```js
var cb_decode = function(cccc) {
  var len = cccc.length,
      padlen = len % 4,
      // 这里通过 << 移位操作，可以直接操作二进制值
      // n : 将各个字符解码之后的二进制值对应的十进制
      n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
  | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
  | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
  | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
      // 从二进制字符串中按照 8 位依次获取二进制的值
      // chars 即为解码之后的字符串原始值
      chars = [
        fromCharCode( n >>> 16),
        fromCharCode((n >>>  8) & 0xff),
        fromCharCode( n         & 0xff)
      ];
  chars.length -= [0, 0, 2, 1][padlen];
  return chars.join('');
};
var _atob = global.atob ? function(a) {
  return global.atob(a);
} : function(a){
  // 将base64 字符串按照 4 个字符长度剪切
  return a.replace(/\S{1,4}/g, cb_decode);
};
// 定义在 atob 上的方法用于字符解码
var atob = function(a) {
  // replace 方法将不属于 base64 字符集内的字符清空
  // 比如 base64 编码字符串中最后一位可能为 =， 这个符号不代表任何含义
  // base64 字符集正则范围 A-Za-z0-9\+\/
  return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
};
```

## 要点

### `String.replace`  方法

使用 `String.replace` 方法可以对于字符串中某些字符作替换操作：

```js
String.replace(searchStr | Regexp, replacedStr | replaceFn);
// searchStr: 匹配的字符
// Regexp: 正则表达式， 被正则表达式匹配到的都会被替换掉
// replacedStr: 用于替换的字符串
// replaceFn: 用于替换过程中的字符串
// return: 被替换掉的字符串
```

例如上面的：

```js
// 将非base64 的字符串清除
String(a).replace(/[^A-Za-z0-9\+\/]/g, '')
```

```js
// 替换正则表达式匹配的字符串， 在替换过程中应用 cb_decode 方法
a.replace(/\S{1,4}/g, cb_decode);
```

### 正则表达式相关

* 在正则中使用限定符 `{}` 可以限定字符的长度范围

  `\S{1,4}`： 匹配字符长度为 1 - 4 的字符串

  ```
  // 截取字符串按长度为 4 分段截取
  let strArr = [];
  str.replace(/\S{1,4}/g, (mStr) =>{
    strArr.push(mStr);
  });
  ```

  `replace` 方法接受函数参数如下图：

  {% asset_img replaceFn.png%}

* 正则中的描述符 `[]` 中使用 `^` 表示不匹配

  ```js
  // 正则表示不匹配base64 字符的字符
  String(a).replace(/[^A-Za-z0-9\+\/]/g, '')
  ```

### 位操作符相关

在 js 中， 包含下面几种操作符号， 它们用来在js 中操作二进制数据的位数

### 二进制与十进制的转换

