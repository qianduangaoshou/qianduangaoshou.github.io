---
title: Base64 基础知识
date: 2019-09-13 17:41:19
tags: Base64
categories: 基础知识
---

Base64 作为一种编码方式， 可以将对于一些数据使用Base64 编码， 那么， 为什么使用 Base64 编码， 使用 Base64 编码的原理是什么以及 Base64 编码在前端的应用，下面的文章将会涉及这些内容：

## what is Base64?

在计算机中， 一个字节通常有8位字符， 这些字符使用二进制表示共有 256 种组合， 这些组合形成了 ascii（American Standard Code for Information Interchange，美国信息交换标准代码） 码：一种字节组合和字符的对应表,  基础的 ascii 码共有 128 种组合， 因为不同国家语言字符的需要， 现在很多是扩展的 ascii码，但不同的 扩展ascii 码的前 127 位是基本相同的， 这一部分称为基础 ascii 码： 

{% asset_img  ascii.png%}

假如我们不通过 Base64 编码， 而是直接向不同设备传输二进制数据，因为一些老旧设备或者软件对于某些二进制值字符的处理方式可能不同， 因就有可能被错误处理，为了解决这种问题， 我们使用Base64 编码将数据统一编码为可见字符，而可见字符在大多设备上的表现行为是一致的，这样就使得数据在不同设备之间的处理出错的可能被降低了。

Base64 码共用 64 种对应字符， 对应字符如下:

{% asset_img  base64.jpg%}

Base64 码由下面这些字符组成：

1. 0 - 25 为大写英文字符 A - Z
2. 26 - 51 为小写英文字符 a - z
3. 52 - 61 为数字 0 -9
4. 另外两个字符 + 和 /

## Base64编码原理

Base64 本质上是将二进制数据转为文本的形式， 当遇到十进制数据的时候， 需要将十进制转为二进制， 对于二进制数据以连续 6 比特计算其十进制值， 在根据这个值查找上图 Base64表中的字符， 最终我们得到的这段文本即是我们编码后的数据：

比如我们对于 `myname` 进行Base64 编码：

|    原始字符    |    m     |    y     |    n     |    a     |    m     |    e     |        |        |
| :------------: | :------: | :------: | :------: | :------: | :------: | :------: | :----: | :----: |
| ASCII码十进制  |   109    |   121    |   110    |    97    |   109    |   101    |        |        |
|     二进制     | 01101101 | 01111001 | 01101110 | 01100001 | 01101101 | 01100101 |        |        |
| Base64码二进制 |  011011  |  010111  |  100101  |  101110  |  011000  |  010110  | 110101 | 100101 |
| Base64码十进制 |    27    |    23    |    37    |    46    |    24    |    22    |   53   |   37   |
|  对应 Base64   |    b     |    X     |    l     |    u     |    Y     |    W     |   1    |   l    |

最终使用 Base64 编码之后的字符串为  `bXluYW1l`

在上面的编码过程中， 我们将六个字符的字符串编码为八个字符的字符串， 编码长度前后对比为 4 ：3， 也即是说， 当原始字符长度为 3 的倍数时， 编码之后长度为 4 的相应倍数， 如果， 原始字符长度不能被 3 整除怎么办？ 这时候， 我们需要对原始字符的二进制进行补零操作：

例如， 我们对于 `my` 进行编码：

| 原始字符       | m        | y        |          |        |
| -------------- | -------- | -------- | -------- | ------ |
| ASCII码十进制  | 109      | 121      |          |        |
| 二进制         | 01101101 | 01111001 | 00000000 |        |
| Base64码二进制 | 011011   | 010111   | 100100   | 000000 |
| Base64码十进制 | 27       | 23       | 36       | 0      |
| 对应 Base64    | b        | X        | k        | A      |

因为原始字符中补充的 0 没有任何意义， 因此编码后的 A 不带有任何的意义，标准的 ascii 码中将 A 替换为 `=`

`my` 的编码字符串为 `bXk=`;

对于解码过程， 首先观察编码字符串长度， 如果字符串长度不能被 4 整除，那么，需要给编码字符串补充 = 来使得字符串长度可以被 4 整除， 然后在进行解码操作。

解码过程是编码过程的逆向操作，将编码字符串的 `=` 转为 `A`, 然后转为十进制的 Base64 码， 后转为二进制的6位比特值，将字符串末尾的相应 `A` 的二进制比特0值丢弃，因为他们不携带任何的信息。

最后将8位二进制转为原始字符.



## 前端应用 Base64

Base64 在前端应用比较常见的是将图片的二进制数据转为 Base64， 嵌套入 html 中。

现代浏览器对于图片的 src 属性支持一种 `dataUrl` 的特性，格式为：

`url(data:文件类型;编码方式,编码后的文件内容)`

例如百度搜索的dataURL：

{% asset_img  image-20190914095537734.png%}

使用这种方式的优点是可以减少外部资源请求， 加快页面加载时间， 缺点是对于色彩丰富的图片， 二进制数据编码之后的 Base64 字符串会比较大， 会影响页面的加载速度

## 其他：Data URLs

Data URLs 是以 `data:` 协议为前缀的一种 url，使用 data url 实现了可以将一些小的文件嵌入到文档中的一种方法

data url 的组成结构如下：

 `data:[<mediatype>][;base64],<data>`

 data url 由下面三种结构组成:

 `mediatype` 表示当前文件的 `MIME type`, 例如： `image/jpeg`, `text/plain` 等

当数据 `data` 为非文本的格式的时候， 使用一个 `base64` 标志表示当前的数据为使用 `base64` 编码之后的数据，对于文字格式， 也是可以使用 `base64` 进行编码操作

`data`: 数据本身

我们经常会遇到的是经过 `base64` 编码过后的图片，除了图片之外， 我们还可以对于文字进行转为 `data url` 的形式：

`data:,Hello%2C%20World!`

`data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D`
// 经过 base64 编码过的上面的文本： Hello World!

`data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E`
// html 文本： `<h1>Hello World!<h1>`

注意：在 data url 中数据本身是 `data`,当我们需要对于数据进行操作的时候， 我们需要获取到 `data urls` 中的数据：

```js
// 在 node 中下载 data urls 形式的图片
const fs = require('fs');
function downloadImage(dataUrl) {
  dataUrl = dataUrl.replace(/^data:image\/png;base64,/, "");
  fs.writeSync('image.jpg', dataUrl, { encoding: 'base64' });
}

```

参考链接：[data urls](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)