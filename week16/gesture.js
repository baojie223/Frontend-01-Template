function enableGesture(elememnt) {
  //抽象事件：监听事件
  let contexts = Object.create(null)

  let MOUSE_SYMBOL = Symbol('mouse')
  if (document.ontouchstart !== null) {
    //在移动端把鼠标事件关掉，不然会触发两次
    //鼠标事件如何监听
    elememnt.addEventListener('mousedown', (event) => {
      contexts[MOUSE_SYMBOL] = Object.create(null) //加的时候加在前面
      start(event, contexts[MOUSE_SYMBOL])
      let mousemove = (event) => {
        move(event, contexts[MOUSE_SYMBOL])
      }
      let mouseend = (event) => {
        end(event, contexts[MOUSE_SYMBOL])
        delete contexts[MOUSE_SYMBOL]
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseend)
      }
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseend)
    })
  }

  //touch如何监听
  //touch事件不需要像mouseevent那样在document上监听的，touch在哪个上启动，就会在哪个上面触发，天然的目标锁定
  //touchstart和touchmove中的event.changedTouches[0]未必是同一个元素，changedTouches中的identifier就是用来区分的
  //touchcancel（如中途突然有个弹窗/事件,或者手势被识别成了系统手势，因此实现的时候要考虑touchcancel被触发的情况，要为每种手势设计cancel的情况下会产生什么样的效果）和touchend只会触发其中一个
  elememnt.addEventListener('touchstart', (event) => {
    for (const touch of event.changedTouches) {
      //changedTouches是数组：可能触发多指操作
      contexts[touch.identifier] = Object.create(null)
      start(touch, contexts[touch.identifier])
    }
  })

  elememnt.addEventListener('touchmove', (event) => {
    for (const touch of event.changedTouches) {
      move(touch, contexts[touch.identifier])
    }
  })

  elememnt.addEventListener('touchend', (event) => {
    for (const touch of event.changedTouches) {
      end(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })

  elememnt.addEventListener('touchcancel', (event) => {
    for (const touch of event.changedTouches) {
      cancel(touch, contexts[touch.identifier])
      delete contexts[touch.identifier] //删的时候删在后面
    }
  })

  //合并mouse和touch的抽象：对start/move/end的行为做抽象
  let start = (point, context) => {
    elememnt.dispatchEvent(
      new CustomEvent('start', {
        detail: {
          startX: point.clientX,
          startY: point.clientY,
          clientX: point.clientX,
          clientY: point.clientY,
        },
      })
    )
    context.startX = point.clientX
    context.startY = point.clientY
    context.isTap = true
    context.isPan = false
    context.isPress = false
    context.timeoutHandler = setTimeout(() => {
      if (context.isPan) {
        //已经是pan了就不会再触发press了
        return
      }
      context.isTap = false
      context.isPan = false
      context.isPress = true
      elememnt.dispatchEvent(new CustomEvent('pressstart', {})) //press的时候没人会在一起点的位置
    }, 500)
    //计算离开前500ms内的速度
    context.moves = []
    //console.log('start',point.clientX,point.clientY)
  }
  let move = (point, context) => {
    //算出移动的距离起点的距离
    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY
    //判断什么时候变成pan
    if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
      //panstart只能触发一次
      if (context.isPress) {
        elememnt.dispatchEvent(new CustomEvent('presscancel', {}))
      }
      context.isTap = false
      context.isPan = true
      context.isPress = false
      console.log('panstart')
      elememnt.dispatchEvent(
        new CustomEvent('panstart', {
          detail: {
            startX: context.startX, //panstar的时候手已经挪动了一定的位置，因此此处应该传入context的起点
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
          },
        })
      )
    }
    //已经变成pan了，再挪动是没有用的
    if (context.isPan) {
      //flick至少是要ispan，可以是pan或者是press
      context.moves.push({
        dx,
        dy,
        t: Date.now(),
      })
      context.moves = context.moves.filter((record) => Date.now() - record.t < 300) //过了太久的move就不算了
      let e = new CustomEvent('panmove', {
        detail: {
          startX: context.startX, //panstar的时候手已经挪动了一定的位置，因此此处应该传入context的起点
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
        },
      })
      elememnt.dispatchEvent(e)
    }
  }
  let end = (point, context) => {
    if (context.isPan) {
      //比较move的首元素和当前的dx/dy比较
      let dx = point.clientX - context.startX
      let dy = point.clientY - context.startY
      let record = context.moves[0]
      let speed = Math.sqrt((record.dx - dx) ** 2 + (record.dy - dy) ** 2) / (Date.now() - record.t)
      let isFlick = speed > 2.5
      if (isFlick) {
        //assume2.5
        elememnt.dispatchEvent(
          new CustomEvent('flick', {
            detail: {
              startX: context.startX,
              startY: context.startY,
              clientX: point.clientX,
              clientY: point.clientY,
              speed,
              isFlick,
            },
          })
        )
      }
      elememnt.dispatchEvent(
        new CustomEvent('panend', {
          detail: {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            isFlick,
            speed, //panend的时候一般需要去判断是不是flick，因此把speed也加上去
          },
        })
      )
    }
    if (context.isTap) {
      // Dispatch the event.
      elememnt.dispatchEvent(new CustomEvent('tap', {}))
    }
    if (context.isPress) {
      elememnt.dispatchEvent(new CustomEvent('pressend', {}))
    }
    clearTimeout(context.timeoutHandler)
    //console.log('end',point.clientX,point.clientY)
  }
  let cancel = (point, context) => {
    //cancel情况下不触发任何事件
    elememnt.dispatchEvent(new CustomEvent('gesturecanceled', {}))
    clearTimeout(context.timeoutHandler)
  }
}
