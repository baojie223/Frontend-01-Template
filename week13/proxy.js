function reactive(object) {
  return new Proxy(object, {
    get(o, p) {
      return o[p]
    },
    set(o, p, v) {
      o[p] = v
      return o[p]
    },
  })
}

function effect(handler) {}

const o = { a: 1, b: 2 }

const proxy = reactive(o)
let dummy

effect(() => (dummy = proxy.a))

console.log(dummy)
proxy.a = 10
console.log(dummy)
