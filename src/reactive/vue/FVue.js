function defineReactive(obj, key, val) {
    // val为对象时
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            console.log('get:', val)
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                console.log('set:', newVal)
                observe(newVal)
                val = newVal
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

    // 编译插值文本
    compileText(node) {
        // 获取匹配的表达式的值
        node.textContent = this.$vm[RegExp.$1]
    }
}