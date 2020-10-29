# vue-principle-practice

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# MVVM模式 数据响应式、模板引擎及渲染
 数据响应式：监听数据变化并在视图中更新
   Object.defineProperty()
   Proxy
 模板引擎：提供描述视图的模板语法
    插值： {{}}
    指令：v-bind, v-on, v-model, v-for, v-if
 渲染：如何将模板转换为html
    模板 => vdom => dom


# Vue中数据响应化
 1、new Vue()首先执行初始化，对data执行响应化处理，这个过程发生在Observe中
 2、同时对模板执行编译，找到其中动态绑定的数据，从data中获取并初始化视图，这个过程发生在Compile中
 3、同时定义一个更新函数和Watcher,将来对应数据变化时Watcher会调用更新函数
 4、由于data的某个key在一个视图中可能出现多次，所以每个key都需要一个管家Dep来管理多个Watcher
 5、将来data中数据一旦发生变化，会首先找到对应的Dep,通知所有Watcher执行更新函数

 Vue：框架构造函数，执行初始化 
 Observer：执行数据响应化(分辨数据时对象还是数组)
 Compile：编译模板，初始化视图，收集依赖(更新函数、watcher创建)
 ![image text](img-floder/vue-compile.png)
 Watcher：执行跟新函数(更新dom)
 Dep: 管理多个Watcher，批量更新

# Vue依赖收集：
视图中会用到data中某个key，这称为依赖。同一个key可能出现多次，每次都需要收集出来用一个Watcher来维护它们，此过程称为依赖收集。多个Watcher需要一个Dep来管理，需要更新时由Dep统一通知。
# 实现思路
1、defineReactive时为每一个key创建一个Dep实例
2、初始化视图时读取某个key,例如nanme1,创建一个watcher1
3、由于触发name1的getter方法，便将watcher1添加到name1对应的Dep中
4、当name1更新，setter触发时，便可通过对应Dep通知其管理所有watcher更新