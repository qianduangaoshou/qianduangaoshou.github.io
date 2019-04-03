---
title: 谈谈 window.location 对象
date: 2019-01-20 14:27:20
tags: window.location
categories: html5
---

## 谈谈 `window.location` 对象

`window.location` 是一个只读属性， 用于获取到页面文档的位置信息， 如果我们在浏览器控制台中打印， 那么打印出来的结果如下：

以我们在 页面 https://developer.mozilla.org/zh-CN/docs/Web/API/Window/location 下获取 `window.location` 为例：

```
ancestorOrigins: DOMStringList {length: 0}
assign: ƒ ()
hash: ""
host: "developer.mozilla.org"
hostname: "developer.mozilla.org"
href: "https://developer.mozilla.org/zh-CN/docs/Web/API/Window/location"
origin: "https://developer.mozilla.org"
pathname: "/zh-CN/docs/Web/API/Window/location"
port: ""
protocol: "https:"
reload: ƒ reload()
replace: ƒ ()
search: ""
toString: ƒ toString()
valueOf: ƒ valueOf()
Symbol(Symbol.toPrimitive): undefined
__proto__: Location
```

上面的这些值表明了在 `window.location` 中的一些属性和方法：

| 属性名   | 含义                                                      | 示例                                                      |
| -------- | --------------------------------------------------------- | --------------------------------------------------------- |
| href     | 当前页面的url                                             | https://example.com:8080/page/childpage?pageId=1#identify |
| host     | host  包含端口名                                          | example.com:8080                                          |
| hostname | 不包含端口名                                              | example.com                                               |
| pathname | 路径名                                                    | /page/childpage                                           |
| origin   | 源网址                                                    | https://example.com:8080 是 网址在第一个 '/' 之前的部分   |
| port     | 端口号                                                    | 8080                                                      |
| protocol | 协议名                                                    | https                                                     |
| search   | 截取到的链接的 ？ 之后的字符串, 不包含标识符 # 之后的内容 | ?pageId=1                                                 |
| hash     | 标识符                                                    | `#identify`                                               |

除了上面几种属性之外， 还包括一些方法：

```
window.location.reload() // 对于当前页面进行重载操作
window.location.replace(rul) // 对于当前页面进行替换
window.location.assign(url) // 会触发页面重载并且跳转到指定的 url
```

tips：

- 使用 replace 和 assign 不同的区别在于： 使用 replace 替换的当前页面不会保存到页面浏览会话历史中，因此当跳转完成之后， 点击浏览器的后退按钮， 是不会进入到使用 replace 的那个页面资源的。而使用 assign 会回到之前跳转的页面。

