let data = [
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
]

class Carousel {
  constructor() {
    this.root = null
    this.data = null
  }

  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')

    for (const d of data) {
      let element = document.createElement('img')
      element.src = d
      // 禁用系统脱妆功能
      element.addEventListener('dragstart', (event) => event.preventDefault())

      this.root.appendChild(element)
    }

    let position = 0

    let nextPic = () => {
      let nextPosition = (position + 1) % this.data.length
      let current = this.root.childNodes[position]
      let next = this.root.childNodes[nextPosition]

      current.style.transition = 'ease 0s'
      next.style.transition = 'ease 0s'

      current.style.transform = `translateX(${-100 * position}%)`
      next.style.transform = `translateX(${100 - 100 * nextPosition}%)`

      // 浏览器会自动合并量测CSS操作，因此需要用计时器等待下一帧的时候再执行。
      // 也可以用requestAnimationFrame(requestAnimationFrame(() => {}))
      setTimeout(() => {
        current.style.transition = '' // means use css rule: ease 1s
        next.style.transition = ''

        // 终止位置
        current.style.transform = `translateX(${-100 - 100 * position}%)`
        next.style.transform = `translateX(${-100 * nextPosition}%)`

        position = nextPosition
      }, 16)

      // 暂停轮播，处理拖拽功能
      // setTimeout(nextPic, 3000);
    }
    // 暂停轮播，处理拖拽功能
    // setTimeout(nextPic, 3000);

    this.root.addEventListener('mousedown', () => {
      let startX = event.clientX

      let nextPosition = (position + 1) % this.data.length
      let lastPosition = (position - 1 + this.data.length) % this.data.length

      let current = this.root.childNodes[position]
      let last = this.root.childNodes[lastPosition]
      let next = this.root.childNodes[nextPosition]

      current.style.transition = 'ease 0s'
      last.style.transition = 'ease 0s'
      next.style.transition = 'ease 0s'

      current.style.transform = `translateX(${-500 * position}px)`
      last.style.transform = `translateX(${-500 - 500 * lastPosition}px)`
      next.style.transform = `translateX(${500 - 500 * nextPosition}px)`

      let move = (event) => {
        // console.log(event.clientX - startX, event.clientY - startY);
        current.style.transform = `translateX(${event.clientX - startX - 500 * position}px)`
        last.style.transform = `translateX(${event.clientX - startX - 500 - 500 * lastPosition}px)`
        next.style.transform = `translateX(${event.clientX - startX + 500 - 500 * nextPosition}px)`
      }

      let up = (event) => {
        let offset = 0

        if (event.clientX - startX > 250) {
          offset = 1
        } else if (event.clientX - startX < -250) {
          offset = -1
        }

        current.style.transition = '' // 打开transition
        last.style.transition = ''
        next.style.transition = ''

        current.style.transform = `translateX(${offset * 500 - 500 * position}px)`
        last.style.transform = `translateX(${offset * 500 - 500 - 500 * lastPosition}px)`
        next.style.transform = `translateX(${offset * 500 + 500 - 500 * nextPosition}px)`

        position = (position - offset + this.data.length) % this.data.length

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      // document绑定的事件，在浏览器外部，如控制台中，也会继续触发
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })
  }
}

// create
let carousel = new Carousel()

// update
carousel.data = data
carousel.render()

// mount
document.getElementById('container').appendChild(carousel.root)
