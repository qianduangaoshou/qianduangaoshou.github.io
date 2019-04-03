---
title: node.js基础.基本服务器构建
date: 2017-12-10 11:04:45
tags: node.js 基础
categories: node.js
---

`node.js` 是 `javascript` 对于后端的应用, 下面是使用`node.js` 构建的一个基础的图片上传应用:

应用地址[hello world](https://github.com/newPromise/node.js/tree/master/hello%20world): 

### 基本组成

这个基本的引用由下面几个部分组成:

`index.js` : 作为各个模块的入口。  

`server.js` 服务器模块。  

`router.js` 用于路由的存放。

`requireHandler.js` 用于路由相关的动作

### 模块分析

#### `server.js`

`server.js` 用于创建 `http` 服务器。

一个基础的 `http` 服务器的构成。

```javascript
let http = require('http');
// request 是浏览器向服务器进行请求的相关信息
function onRequest(request, response) {
  // response 用于向对于发送信息的浏览器响应请求
  // 规定返回响应的 头部信息
  // 返回一个 http 状态码为 200 Content-type 为 text/plain 的 http 信息
  response.writeHead(200, {"Content-type": "text/plain"});
  // 使用 response.write 向响应的主体中发送内容
  response.write();
  // 结束响应请求
  response.end();
}
http.createServer(onRequest).listen(8888);
```

上面的创建的基础的 `node.js` 服务器用于监听 8888 端口。

`node.js` 是基于事件驱动的, 也就是我们说的 `回调`， 上面的服务器中， 只要在  `8888` 端口处监听到事件发生, 则进行回调 `onRequest` 函数。

在这个应用中，这样构建服务器模块:

```javascript
// 引入 http 模块
let http = require('http');
// 引入 url 模块
let url = require('url');
// 创建一个 start 函数用于开启服务器
function start(route, handle) {
  function onRequest(request, response) {
    let pathname = url.parse(request.url).pathname;
    route(handle, pathname, response, request);
  }
  http.createServer(onRequest).listen(8888);
}
// 导出 start 模块
export.start = start;
```

#### `router.js`

在 `router.js` 存放在对于根据不同的路由切换函数。

```javascript
function route(handle, pathname, response, request) {
  if (typeof handle[pathname] === 'function') {
    // 执行 handle[pathname] 函数
    // handle[pathname] 函数接收两个参数 response, request
    // 这个启动的函数位于 requireHandler.js 中
    handle[pathname](response, request);
  } else {
    // http 状态 404 not found Content-type 设置 text/plain
    response.writeHead(404, { 'Content-type': 'text/plain' });
    response.write('404 not found');
    response.end();
  }
}
export.route = route;
```

#### `index.js`

使用 `index.js` 用于对于各个模块进行集中处理:

```javascript
// 导入 server, router, requestHandlers 模块
// server: 服务器模块
// router: 路由模块
// requestHandlers： 相应路由的处理函数模块
let server = require("./server.js");
let router = require("./router");
let requestHandlers = require("./requireHandlers");
let handle = {};

// 对于不同的路由进行不同的函数配置
handle['/'] = requestHandlers.start;
handle['/start'] = requestHandlers.start;
handle['/upload'] = requestHandlers.upload;
handle['/show'] = requestHandlers.show;

// 启动服务器
server.start(router.route, handle);
```

#### `requireHandler.js`

这个模块用来个根据不同的路由进行不同的函数处理:

对于上传数据的不同处理都是放在了这里面:

```javascript
let fs = require('fs');

// 使用 formidable 用于处理文件上传的问题
let formidable = require('formidable');

function start(response, request) {
	var body = '<html>'+
	'<head>'+
	'<meta http-equiv="Content-Type" '+
	'content="text/html; charset=UTF-8" />'+
	'</head>'+
	'<body>'+
	'<form action="/upload" enctype="multipart/form-data" '+
	'method="post">'+
	'<input type="file" name="upload">'+
	'<input type="submit" value="Upload file" />'+
	'</form>'+
	'</body>'+
	'</html>';
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
}
function upload(response, request) {
	let form = new formidable.IncomingForm();
	form.parse(request, function (error, fields, files) {
		var readStream=fs.createReadStream(files.upload.path);
		var writeStream=fs.createWriteStream(`./assets/${files.upload.name}`);
		imgname = files.upload.name;
        readStream.pipe(writeStream);
        readStream.on('end',function(){
	    fs.unlinkSync(files.upload.path);
	  });
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write('received image: <br/>');
		console.log(files.upload.name);
        // src='/show' 调用 show 函数
		response.write("<img src='/show'/>");
		response.end();
	});
}

// show 函数用于文件显示
function show(response, postData) {
	// 读取文件
	fs.readFile(`./assets/${imgname}`, "binary", function (error, file) {
		// 如果发生错误
		if (error) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/png"});
			response.write(file, "binary");
			response.end();
		}
	})
}

exports.start = start;
exports.upload = upload;
exports.show = show;
```

### 其他

关于使用 `response.write` 的问题:

```javascript
response.write(chunk, [encoding]);
// encoding 表示编码形式
```

