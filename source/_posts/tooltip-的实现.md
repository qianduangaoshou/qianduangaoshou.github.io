---
title: tooltip 的实现
date: 2018-05-09 00:45:46
tags: toolTip
categories: 代码集
---

在业务上实现了一个类似于 `el-tooltip` 的方法，类似于下面这种情况：

业务需求是对于弹窗的文字标签字段， 如果文字标签说明太长的时候， 而这个时候文字标签说明又有宽度限制， 这个时候需要实现一个类似于 `el-tooltip` 的实现方法，但是对于每一个标签上都添加上 `el-tooltip` 是不现实的，因此想要通过使用指令的方法，对于表单中的标签字段进行动态添加，实现这个指令的 `toolTip.js` 的具体代码如下：

```javascript
// 对于出现dialog 的情况， 都是在 el-dialog__wrapper 上进行滚动的
import Util from "./util";
const getScrollRoot = () => {
    return document.documentElement.querySelector(".el-dialog__wrapper");
};
let instancePool = [];

// 定义 tip instance 方法
const instanceAction = () => {
    const push = (instance) => {
        instancePool.push(instance);
    };
    return {
        pushInstance: push
    };
};
// 获取到绑定元素在当前页面上距离左边的距离
const getElementViewLeft = (element) => {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent;

    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
};

// 获取到绑定元素在当前页面上位置高度
const getElementViewTop = (element) => {
    let actualTop = element.offsetTop;
    let current = element.offsetParent;

    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
};

function tooltip(el, opt) {
    const items = el.querySelectorAll(".el-form-item");
    for (const item of items) {
        const target = item.firstChild;
        // 如果定义了一个 label 为空的时候的 form-item， label 部分为 before 元素， 但是还是可以这个时候 			className 为 null
        if (target.className) {
            // 将每一个需要显示标签的实例信息压入
            instanceAction().pushInstance({ tip: null, target, message: target.innerText, offset: 0, class: "vk-tooltip" });
        }
    }
    this.scrollListener = null;
    this.mouseenterListener = null;
    this.mouseleaveListener = null;
    this.init();
    // target：传入的DOM
    // this.target = el;
    // tip：用来放初始化创建的tip元素
    // this.tip = null;
    // this.message = (opt && opt.msg) || this.target.innerText;
    // this.offset = (opt && +opt.offset) || 0;
    // this.class = "vk-tooltip";
    // instanceAction.push();
    // this.init();
}

tooltip.prototype = {
    // 初始化tip，添加事件监听
    init: function () {
        const me = this;
        const root = getScrollRoot();
        // 鼠标进入才创建标签
        for (let instance of instancePool) {
            const { target, tip, message, offset } = instance;
            // 滚动监听事件
            // 鼠标移入监听事件
            // 鼠标移除监听事件
            if (message.length < 6) continue;
            this.mouseenterListener = Util.listener(target, "mouseenter", () => {
                instance = me.createTip(instance);
                instance.tip.style.opacity = 1;
                this.scrollListener = Util.listener(root, "scroll", () => {
                    me.setTipPlace(instance.tip, instance.target, instance.offset);
                    instance.tip.style.opacity = 0;
                });
                this.scrollListener.listen();
            });
            this.mouseenterListener.listen();
            this.mouseleaveListener = Util.listener(target, "mouseleave", () => {
                instance.tip.style.opacity = 0;
                this.scrollListener.remove();
            });
            this.mouseleaveListener.listen();
        }
    },

    createTip(instance) {
        const me = this;
        const poppup = "<div class='triangle-down'></div>";
        const cache = document.getElementsByClassName(instance.class);
        // 如果存在一个tip标签则使用该标签
        instance.tip = cache.length ? cache[0] : document.createElement("div");
        instance.tip.className = instance.class;
        instance.tip.innerHTML = `${instance.message}${poppup}`;
        document.body.appendChild(instance.tip);
        if (!me.tip) {
            me.tip = instance.tip;
        }
        me.setTipPlace(instance.tip, instance.target, instance.offset);
        return instance;
    },

    // 设置tip显示的位置
    setTipPlace: function (tip, target, offset) {
        const root = getScrollRoot();
        const distance = (tip.clientWidth - target.clientWidth) / 2;
        const pageX = `${getElementViewLeft(target) - root.scrollLeft - distance + offset}px`;
        const pageY = `${getElementViewTop(target) - target.clientHeight - root.scrollTop}px`;
        tip.style.left = pageX;
        tip.style.top = pageY;
    },
    clear: function () {
        instancePool = [];
        if (this.tip) {
            this.tip.parentNode.removeChild(this.tip);
        }
        this.mouseenterListener.remove();
        this.mouseleaveListener.remove();
        this.mouseenterListener = null;
        this.mouseleaveListener = null;
        this.scrollListener = null;
    }
};

export default tooltip;


// /**
//  * @description 因为el的tooltip展示需要用到组件，这里用指令进行tooltip展示
//  * @example <div v-tips>此处为被缩略的文本内容</div>
//  * @param opt v-tips="opt" 可以传入配置对象, msg 展示信息, offset X轴偏移量
//  * 在元素插入DOM时，创建tooltip实例。
//  */
// Vue.directive("tips", {
//     bind: (el) => {
//         console.log(el);
//     },
//     // 当绑定元素插入到 DOM 中。
//     inserted: (el, { value }) => {
//         // 暂时针对el-form的label标签，所以指定firsChild
//         this.instance = new VkTooltip(el.firstChild, value);
//     },
//     // 解除绑定的时候清除实例以及标签,清除事件监听
//     unbind: (el) => {
//         this.instance.clear();
//     }
// });
// Util listen 函数
Util.listen = (target, eventType, callback) => {
    if (target.addEventListener) {
      return {
          listen: {
            target.addEventListener(eventType, callback, false);
          },
          remove: {
            target.removeEventListener(eventType, callback, false);
      	  }
      }
    } else if (target.attachEvent) {
      listen: {
          target.attachEvent('on' + eventType, callback);
      },
      remove: {
          target.detachEvent('on' + eventType, callback);
      }
    }
}
```

使用的时候， 这个函数被作为指令在 `main.js` 中引入：

```javascript
import VKTooltip from "@/assets/js/tooltip";
Vue.directive("tips", {
  bind: (el) => {
  },
  inserted: (el, { value }) => {
    this.instance = new VKTooltip(el, value);
  },
  unbind: (el) => {
    this. instance.clear();
  }
});
```

关于在 `vue.js` 中自定义指令的使用， 可以查看`vue.js` 官网， [自定义指令](https://cn.vuejs.org/v2/guide/custom-directive.html#ad)

需要注意的知识点：

1. 对于页面元素各个位置的理解
2. js 基础一定要熟悉