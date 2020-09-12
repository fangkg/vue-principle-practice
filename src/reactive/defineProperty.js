// 对象响应式原理 Object.defineProperty()

function defineReactive(obj, key, val) {
    // val 可能是对象 需要做递归处理
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

                // 执行更新
                update()
            }
        }
    })
}


// 对象响应式处理
function observe(obj) {
    // obj 必须为对象
    if (typeof obj !== 'object' || obj === null) {
        return
    }
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}


function update() {
    // app.innerHTML = obj.foo
}

function set(obj, key, val) {
    defineReactive(obj, key, val)
}
const obj = {}
defineReactive(obj, 'foo', 'foo')

obj.foo
obj.foo ="bar"

setInterval(() => {
    obj.foo = new Date().toLocaleTimeString()
}, 1000)


const observeObj = {
    mn: 'mn',
    obj: {
        nn: 'nn'
    }
}

observe(observeObj)

observeObj.mn
observeObj.obj.nn = 'hello'
observeObj.obj = { nn: 'yes' }
observeObj.obj.nn
observeObj.doo = 'doo'
observeObj.doo
set(observeObj, 'll', 'll')
observeObj.ll