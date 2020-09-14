function defineReactive(obj, key, val) {
    // val为对象时
    observe(val)

    // 每执行一次就会创建一个Dep实例
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            console.log('get:', val)
            // 依赖收集
            Dep.target && dep.addDep(Dep.target)
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                console.log('set:', newVal)
                observe(newVal)
                val = newVal

                // 通知更新
                // watchers.forEach(watcher => {
                //     watcher.updateFn()
                // })
                dep.notify()
            }
        }
    })
}

// 对象响应式处理
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }

    new Observer(obj)

    // Object.keys(obj).forEach(key => {
    //     defineReactive(obj, key, obj[key])
    // })
}

// 代理的作用：将$data中的Key代理到FVue的实例上
function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(v) {
                vm.$data[key] = v
            }
        })
    })
}

class FVue{
    constructor(options) {
        // 保存选项
        this.$options = options
        this.$data = options.data

        // 响应化处理
        observe(this.$data)

        // 代理
        proxy(this)

        // 编译
        new Compile('#app', this)
    }
}


// 每个响应式对象就伴生一个observer实例
class Observer{
    constructor(value) {
        this.value = value

        // 判断value是obj还是数组
        this.walk(value)
    }

    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
    
}


// 编译过程
// new Compile(el, vm)
class Compile {
    constructor(el, vm) {
        this.$vm = vm
        this.$el = document.querySelector(el)

        // 编译模板
        if (this.$el) {
            this.compile(this.$el)
        }
    }

    compile(el) {
        // 递归编译el 
        // 判断el类型
        el.childNodes.forEach(node => {
            // 判断其类型
            if (this.isElement(node)) {
                console.log('编译元素：', node.nodeName)
                this.compileElement(node)
            } else if (this.isInter(node)) {
                console.log('编译插值表达式：', node.textContent)
                // 编译插值文本
                this.compileText(node)
            }

            // 递归
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }

    // 判断节点是否是元素
    isElement(node) {
        return node.nodeType === 1
    }

    // 判断是否是插值表达式
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }

    // 编译元素型节点
    compileElement(node) {
        // 获取节点属性
        const nodeAttrs = node.attributes
        // 节点类数组转成数组
        Array.from(nodeAttrs).forEach(attr => {
            const attrName = attr.name
            const exp = attr.value
            // 判断这个属性类型
            if (this.isDirective(attrName)) {
                // 截取指令
                const dir = attrName.substring(2)
                // 执行指令
                this[dir] && this[dir](node, exp)
            }
        })
    }

    // 编译插值文本
    compileText(node) {
        // 获取匹配的表达式的值
        // node.textContent = this.$vm[RegExp.$1]

        this.update(node, RegExp.$1, 'text')
    }

    // 文本指令
    text(node, exp) {
        // node.textContent = this.$vm[exp]

        this.update(node, exp, 'text')
    }

    // html指令
    html(node, exp) {
        // node.innerHTML = this.$vm[exp]

        this.update(node, exp, 'html')
    }

    // 所有动态绑定都需要创建更新函数以及对应watcher实例
    update(node, exp, dir) {
        // textUpdater() 初始化
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])

        // 更新
        new Watcher(this.$vm, exp, function(val) {
            fn && fn(node, val)
        })
    }

    textUpdater(node, value) {
        node.textContent = value
    }

    htmlUpdater(node, value) {
        node.innerHTML = value
    }

    // 判断是否是指令
    isDirective(attrName) {
        return attrName.indexOf('k-') === 0
    }
}


// watcher小秘书 界面中的一个依赖对应一个小秘书
// const watchers = []
class Watcher {
    constructor(vm, key, updateFn) {
        this.vm = vm
        this.key = key
        this.updateFn = updateFn

        // watchers.push(this)

        // 读一次数据触发defineReactive里的get()
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
    }

    // 管家调用
    updateFn() {
        // 传入当前的最新的值
        this.updateFn.call(this.vm, this.vm[this.key])
    }
}


// dep 管理watcher
class Dep {
    constructor() {
        this.deps = []
    }

    addDep(watcher) {
        this.deps.push(watcher)
    }

    // 通知
    notify() {
        this.deps.forEach(watcher => {
            watcher.updateFn()
        })
    }
}
