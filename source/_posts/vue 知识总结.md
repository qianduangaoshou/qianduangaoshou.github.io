---
title: vue 知识总结
date: 2018-04-29 12:13:38
tags: vue 知识总结（一）
categories: vue
---

在项目开发中，发现对于 `vue` 的使用还有一些新的认识，在这段时间中使用到的知识点做一个总结：

###  计算属性和侦听器 

在  `vue.js` 中，通过使用 `watch` 以及 `computed` 这两个方法来进行侦听数据的变化，但是这两种方式对于数据侦听的处理是不同的，应用的场景也是不同的， 之前应用的时候总是习惯性的时候用 `watch`, 但是在一些情况下，使用 `comnputed` 要更好一些，这里先简单的介绍这两种方法的使用， 具体可见 `vue.js` 官方文档：[计算属性和侦听器](https://cn.vuejs.org/v2/guide/computed.html#%E4%BE%A6%E5%90%AC%E5%99%A8) 

`watch`:

`watch`侦听器相对于 `computed` 而言更为通用，使用 `watch` 用来监听数据的变化， 定义在数据变化之后的行为，基本使用用法如下：

```javascript
// 监听某一个数据
watch: {
    value: function (newVal, oldVal) {
        // some action
    }
}
// 监听对象中的某一个属性
watch: {
    "object.value"： function (newVal, oldVal) {
        // some action
    }
}
```

注意： 使用 `watch` 不能监听到对象的变化， 如果想要对于对象进行监听， 可以使用 `deep: true`:

```javascript
watch: {
  object: {
      handler: function (newVal, oldVal) {
          // somn action
      },
      deep: true
  }
}
```

如果想要回调在监听之后立即被调用， 可以设置 `immediate:true` ：

```vue
watch: {
  object: {
    // 回调函数立即被调用不管监听对象有没有被调用
    handler: function (newVal, oldVal) {
      // some action
    },
    deep: true,
    immediate: true
  }
}
```



`computed`:

在有些地方， 我们使用 `computed` 要比单纯的监听数据的变化要方便很多， 比如下面这种情况：

```javascript
data() {
    person: {
        name: "",
        age: "",
        sex: ""
    }
},
computed: {
    personMsg: function () {
      // 这里可以监听到对象的变化
        const { name, age, sex } = this.person;
        return `${name} is a ${age} ${sex}`;
    }
}
```

当上面代码中的 `this.person` 中的数据发生变化的时候， `personMsg` 就会实时的发生变化：

对于 `computed` 的使用， 注意下面两点：

1. 对于上面代码中的计算属性： `personMsg` 的取值决定于 `this.person` 的值， 这里计算函数实际上拦截了计算属性的 `getter` 函数， 计算属性可以在模版中像其他 `data` 中的数据一样被使用

   ```html
   <div>{{ personMsg }}<div>
   ```

2. 使用函数调用可以实现类似于计算属性相同的作用：不同的是计算属性可以进行缓存数据，之后只有当计算属性的依赖选项发生变化的时候， 计算属性才会求值， 如果依赖项没有发生变化，那么计算属性就不会发生再次求职。

   ```javascript
   methods: {
     personMsg () {
       return this.msg;
     }
   }
   ```