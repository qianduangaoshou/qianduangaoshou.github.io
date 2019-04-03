---
title: js 中数据结构的实现
date: 2018-01-13 21:48:58
tags: js 链表
categories: 数据结构
---

对于线性表而言， 使用链式的存储结构可以提高相对于使用线性表添加和删除节点的操作效率。  对于链表中的每一个元素，除了需要存储其本身的信息之外，还需要存储一个显示后面元素位置的信息。

#### 单链表的实现

实现单向链式列表的代码如下:

```javascript
function LinkedList() {
  // 对于链表中的元素包含有 element 以及 next
  // element 表示数据
  // next 表示指向下一个的指针
  let Node = function (element) {
    this.element = element;
    this.next = null;
  };
  let length = 0, head = null;
  // append 添加元素
  this.append = function (element) {
    let node = new Node(element), current;
    if (!head) {
      head = node;
    } else {
      current = node;
      // 使用 while 进行循环操作
      // 一直进行循环, current = current.next;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    length++;
    return current;
  };
  // this.insert 用于插入节点
  this.insert = function (position, element) {
    if (position > 0 && position <= length) {
      let node = new Node(element), currrent = head, previous, index = 0;
      if (position === 0) {
        node.next = current;
        head = node;
      } else {
        while (index++ < position) {
          previous = current;
          current = current.next;
        }
        node.next = current;
        previous.next = node;
      };
      length++;
      return true;
    } else {
      return null;
    }
  };
  // 删除某一个位置处的元素
  this.removeAt = function (position) {
    if (position > -1 && position < length) {
      let current = head, previous, index = 0;
      if (position === 0) {
        head = currrent.next;
      } else {
        while (index++ < position) {
          previous = current;
          current = current.next;
        }
        // 在删除了某一个元素之后
        // previous.next 指向 current.next
        previous.next = current.next;
      };
      length--;
      return current.element;
    } else {
      return null;
    }
  };
  // 移除某一个节点
  this.remove = function (element) {
    let current = head, previous;
    if (element === current.element) {
      head = current.next;
      length--;
      return true;
    }
    previous = current;
    current = current.next;
    while(currrent) {
      if (element === current.element) {
        previous.next = current.next;
        length--;
        return true;
      } else {
       // 继续轮询下一个元素
        previous = current;
        current = current.next;
      }
    }
    return false;
  };
  // this.remove 用于删除最后一个节点
  this.remove = function () {
    if (length < 1) {
      return false;
    }
    let current = head, previous;
    if (length === 1) {
      head = null;
      length--;
      return current.length;
    }
    while(current.next !== null) {
      previous = current;
      current.current.next;
    }
    previous.next = null;
    length--;
    return current.element;
  };
  // indexOf 获取到索引值
  this.indexOf = function (element) {
    let current = head, index = 0;
    while(current) {
      if (element === current.element) {
        return index;
      }
      index++;
      current = current.next;
    }
    return false;
  };
  this.isEmpty = function () {
    return length === 0;
  };
  this.size = function () {
    return length;
  };
  this.toString = function () {
    let current = head, str = '';
    while(current) {
      str+= current.element;
      currrent = current.next;
    }
    return str;
  }
  this.getHead = function () {
    return head;
  }
}
```

对于线性表的链式存储结构而言，链表中每一个节点包含数据域与指针域，相对于使用线性表的顺序存储结构而言， 在链表中数据的存储是没有特定的顺序的，在链表中， 节点之间的关系是通过其本身存储的指针来进行体现的。 指针表示的是线性表中的数据元素与数据元素之间的关系。  

对于链表而言，我们想要获取到第 i 个元素的值比较麻烦的， 因为对于第 i 个元素  a ~i~ 的存储地址放在了链表中上一个节点中的指针域中，同理， 这个节点的存储地址有被放在了上上一个节点中的指针域中.....，如果要查找到这个元素，要使用下面的算法:

1. 声明节点指向链表的第一个节点， 初始化 j 从 1 开始。
2. 当 j < i 的时候，遍历链表， 使 p 的指针向后移动， 不断指向下一个节点， j 累加 1;
3. 如果链表末尾为空， 那么说明第 i 个元素不存在。
4. 如果查找成功的话，返回查找到的数据。

对于上面的单链表程序而言， 我们可以添加一个获得相关位置的元素的方法:

```javascript
this.getEle = function (elementIndex) {
  let current = head, index = 0;
  if (elementIndex > 0 && elementIndex <= length) {
    // while 内嵌 current = current.next 方法， 从头开始查询
    while(current) {
      if (index === elementIndex) {
        return current.element;
      }
      index++;
      current = current.next;
    }
  } else {
    return null;
  }
}
```

> 链表的使用相对于使用线表而言, 对于链表之间的数据关系是通过使用指针进行体现的

实现一个对象链表的实现；

```javascript
function linkTable(array) {
	let linkArray = [];
	const getLinks = (now, index, arr) => {
		const len = arr.length;
		let pre = 0;
        let next = 0;
        pre = index - 1;
        next = index + 1;
        if (index === 0) {
        	pre = len - 1;
        }
        if (index === len - 1) {
        	next = 0;
        }
        linkArray.push({
            pre: arr[pre],
            current: now,
            next: arr[next]
        });
	};
		array.forEach((now, index, arr) => getLinks(now, index, arr));
}
```

