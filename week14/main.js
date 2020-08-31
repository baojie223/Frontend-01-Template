function create(Cls, attributes, ...children) {
  let o
  if (typeof Cls === 'string') {
    o = new Wrapper(Cls)
  } else {
    o = new Cls()
  }
  for (let name in attributes) {
    o.setArrtibute(name, attributes[name])
  }
  for (let child of children) {
    if (typeof child === 'string') child = new Text(child)
    o.appendChild(child)
  }
  return o
}

class Wrapper {
  constructor(type) {
    this.children = []
    this.root = document.createElement(type)
  }

  setArrtibute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(child) {
    this.children.push(child)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
    for (let child of this.children) {
      child.mountTo(this.root)
    }
  }
}

class MyComponent {
  constructor(config) {
    this.children = []
  }

  setArrtibute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(child) {
    this.children.push(child)
  }

  render() {
    return (
      <article>
        <header>header</header>
        {this.slot}
        <footer>footer</footer>
      </article>
    )
  }

  mountTo(parent) {
    this.slot = <div></div>
    for (let child of this.children) {
      this.slot.appendChild(child)
    }
    this.render().mountTo(parent)
  }
}

class Text {
  constructor(text) {
    this.root = document.createTextNode(text)
  }

  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

const component = (
  <MyComponent>
    <div>text</div>
  </MyComponent>
)

component.mountTo(document.body)

console.log(component)
