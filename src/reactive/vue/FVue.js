
function defineReactive(obj, key, val) {
    // val为对象时
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            return val
        },
        set(newVal) {
            if (newVal !== val) {
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
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}

class FVue{

}

class Observer{

}