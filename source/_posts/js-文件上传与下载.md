---
title: js 文件上传与下载
date: 2018-10-31 00:04:40
tags: fileReader
categories: js
---

前端实现的文件上传与下载操作：

## 上传

在上传文件的操作中， 可以使用  `formData` 或者 `fileReader` 进行上传操作， 使用 `fileReader` 可以在本地将上传的文件转为二进制的数据格式； `formData` 是在 `XMLHttpRequest` 中的接口，可以用来实现模拟的表单提交， 当前端通过 `ajax` 向后端传递文件的时候， 使用 `ajax` 提交 `formData` 可以实现异步上传二进制文件

```react
<input type="file" onClick={ this.uploadFile.bind(this) } />
```

对于上传文件，可以通过两种方式进行上传，通过 `filereader` 或者通过 `formData` 都可以实现上传文件

### FileReader:

```react
uploadFile(fileInput) {
    const file = fileInput.target.files[0]; // 获取到文件对象
    const reader = new FileReader(); // 创建 fileReader 的实例
    reader.readAsArrayBuffer(file); // 将file 读取为 ArrayBuffer 
    reader.onload = function () { // 当文件加载成功的时候调用
        console.log("result", reader.result);
    }
}
```

在 MDN 上面， 对于  FileReader 的描述如下:

```
FileReader 对象允许Web应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，使用 File 或 Blob 对象指定要读取的文件或数据。

其中File对象可以是来自用户在一个<input>元素上选择文件后返回的FileList对象,也可以来自拖放操作生成的 DataTransfer对象,还可以是来自在一个HTMLCanvasElement上执行mozGetAsFile()方法后返回结果。  
```

使用 `fileReader` 接受的参数可以是一个 `File` 对象或者 `Blob` 对象， 使用上传文件的时候， 接收的是一个 `fileList` 对象。

#### 构造函数

```javascript
const reader = new FileReader(); // 创建一个新的 filereader 实例
```

#### 相关方法

`reader.readAsArrayBuffer(file)` : 将文件读取为 `ArrayBuffer` 的数据对象

`ArrayBuffer` 是一种二进制数组，通过 `ArrayBuffer` 中的一些语法可以实现使用数组的语法处理二进制数据

`reader.readAsText(file, [encode])` : 读取文件内的内容作为字符串的形式输出，这个方法读取的是文件内的内容，其中的 `encode` 用于将 `file` 对象进行转换的编码格式;

`reader.readAsDataURL(file)`: 将文件读取为 `DataUrl`

#### 相关属性

`reader.error`: 表示在读取文件的时候发生的错误；

`reader.readyState`: 表示当前上传文件的状态：

`0`: 表示当前文件尚未加载

`1`: 表示当前文件正在加载中

`2`: 表示当前文件已经完成加载

`reader.result` : 上传文件的内容，只有上传成功之后这个属性才有值

#### 事件处理

| 事件名         | 描述           |
| ----------- | ------------ |
| Onabort     | 当读取操作中断的时候触发 |
| Onerror     | 当操作发生错误的时候触发 |
| Onload      | 当读取操作完成的时候触发 |
| Onloadstart | 当开始进行读取的时候触发 |
| Onloadend   | 当读取操作结束的时候触发 |
| Onprogress  | 当读取的时候触发     |



### FormData:

```react
uploadFile(fileInput) {
    const file = fileInput.target.file[0];
    const formData = new FormData();
    formData.append("file", formData);
    axios({
        method: "post",
        url: '...',
        data: formData
    });
}
```



## 下载

常用的下载操作是创建一个 `a` 标签， 通过 `a` 标签的 `href` 指向下载的文件链接，通过使用 `download` 属性来说明下载的文件名称:

```html
<a href="" download="文件.txt">下载文件</a> // download 表明下载的文件名, href 指向下载的文件的地址
```

在后端传递的文件进行下载的时候， 因为后端传递的是一个二进制的数据格式文件， 前端这边需要将二进制数据转为 `a` 标签的链接进行下载操作， 通过使用 `window.URL.createObjectURL` 转为链接。

`window.URL.createObjectURL`:

接受参数为一个 file 对象或者一个 blob 对象， 最后生成一个 url, 这个url指向参数中给定的对象。这个 URL 的生命周期和创建它的窗口中的 document 绑定，当不需要使用 URL 对象的时候， 可以通过  ` URL.revokeObjectURL` 进行释放， 已获得最佳性能和内存使用情况。

在实际的开发中， 通常使用js 来创建下载标签， 代码如下:

```javascript
// name: 下载的文件名
// blob 下载的文件的blob 二进制数据格式的文件
function downloadFile (name, blob) {
    var downloadElement = document.createElement('a');
    var href = window.URL.createObjectURL(blob); //创建下载的链接
    downloadElement.href = href;
    downloadElement.download = `${name}.xlsx`; //下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click(); //点击下载
    document.body.removeChild(downloadElement); //下载完成移除元素
    window.URL.revokeObjectURL(href); //释放掉 URL 对象 
}
```

当接受到文件数据不为 blob 对象的时候, 可以通过使用 `new Blob([data])`  转换为 blob 对象。



## Blob

`blob` 是 js 中的对象，可以存储大量的二进制编码格式的数据， 使用 blob, 当 `input` 标签 `type` 设为 `file` 的时候提交的 `fileList` 中的每一个 `file` 对象就是基于 `blob` 对象的；

#### 构造函数

` new Blob(array, [,options]) `:

`array` 中的值可能是 `ArrayBuffer`, `ArrayBufferView`, `Blob`, `DOMString` 对象， 或者这些对象的混合。

`options` 字段是可选的字段， 包含下面两种值：

- `type`: 表明将要放入 `blob` 中的数组内容的 `MIME` 类型
- endings: 决定第一个参数的数据格式，可以取值为 "transparent" 或者 "native"（transparent的话不变，是默认值，native 的话按操作系统转换

#### 方法

`Blob.slice([start[, end[, contentType]]])`

用于对 `Blob` 进行"切割"， 返回一个新的 `Blob` 对象， 包含特定字节范围内的数据

#### 属性

`Blob.size`: 在 `Blob` 数据对象中的字节大小。

`Blob.type`: `Blob` 数据对象中的 `MIME` 类型。

使用 `Blob` 存储的数据对象读取的唯一方式是通过使用 `FileReader` 进行读取， 通过使用 `FileReader` 中的 `readAsDataURL` 或者 `readAsArrayBuffer` 将 `Blob` 中的数据类型读取为 `ArrayBuffer` 或者 `dataurl` 的格式。

