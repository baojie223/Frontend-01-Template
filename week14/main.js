function create(Cls, attributes, ...children) {
  let o
  if (typeof Cls === 'string') {
    o = new Wrapper()
  } else {
    o = new Cls()
  }
  for (let name in attributes) {
    o.setArrtibute(name, attributes[name])
  }
  for (let child of children) {
    o.appendChild(child)
  }
  return o
}

class Wrapper {
  constructor(config) {
    this.children = []
    this.root = document.createElement('div')
  }

  setArrtibute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(child) {
    this.children.push(child)
  }

  mountTo(parent) {
    console.log(parent)
    parent.appendChild(this.root)
    for (let child of this.children) {
      if (typeof child === 'string') {
      }
      child.mountTo(this.root)
    }
  }
}

class Text {
  constructor() {}

  mountTo(parent) {
    console.log(parent)
    parent.appendChild(this.root)
  }
}

const a = (
  <div id="id" class="class" style="width: 100px; height: 100px; background-color: pink">
    <div id="c1"></div>
    <div id="c2"></div>
  </div>
)

console.log(a)

a.mountTo(document.body)
