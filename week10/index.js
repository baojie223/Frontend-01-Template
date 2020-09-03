/**
 * matrix 一围数组
 * 0 代表空
 * 1 代表⭕ circle
 * 2 代表❌ cross
 */
const matrix = new Array(9).fill(0)
let type = 1

function draw(matrix) {
  const boxList = document.getElementsByClassName('box')
  for (let i = 0, len = matrix.length; i < len; i += 1) {
    let cls = 'box'
    if (matrix[i] !== 0) {
      cls += matrix[i] === 1 ? ' circle' : ' cross'
    }
    boxList[i].className = cls
  }
}

function bindEvent() {
  const boxList = document.getElementsByClassName('box')
  for (let i = 0, len = boxList.length; i < len; i += 1) {
    boxList[i].addEventListener('click', () => {
      if (matrix[i] !== 0) return
      matrix[i] = type
      draw(matrix)
      // 判断玩家是否已经赢了
      if (check(matrix, type)) {
        alert(`${type === 1 ? '⭕' : '❌'} is the winner!`)
      } else {
        // 机器人行动
        type = 3 - type
        computerMove(matrix, type)
      }
    })
  }
}

function computerMove(matrix) {
  const choice = bestChoice(matrix, type)
  matrix[choice.index] = type
  draw(matrix)
  if (check(matrix, type)) {
    alert(`${type === 1 ? '⭕' : '❌'} is the winner!`)
  } else {
    type = 3 - type
  }
}

function check(matrix, type) {
  let len = matrix.length
  // 三条横向检查
  for (let i = 0; i < len; i += 3) {
    let win = true
    for (let j = 0; j < 3; j += 1) {
      if (matrix[i + j] !== type) win = false
    }
    if (win) return true
  }
  // 三条竖向检查
  for (let i = 0; i < 3; i += 1) {
    let win = true
    for (let j = 0; j < len; j += 3) {
      if (matrix[i + j] !== type) win = false
    }
    if (win) return true
  }
  // 斜线检查
  {
    let win = true
    for (let i = 0; i < 3; i += 1) {
      if (matrix[i + i * 3] !== type) win = false
    }
    if (win) return true
  }
  // 斜线检查
  {
    let win = true
    for (let i = 0; i < 3; i += 1) {
      const n = i + 1
      if (matrix[3 * n - n] !== type) win = false
    }
    if (win) return true
  }

  return false
}

function willWin(matrix, type) {
  for (let i = 0, len = matrix.length; i < len; i += 1) {
    if (matrix[i] !== 0) continue
    const _m = matrix.slice()
    _m[i] = type
    if (check(_m, type)) {
      return i
    }
  }
  return -1
}

function bestChoice(matrix, type) {
  let index = willWin(matrix, type)
  if (index > -1) {
    return {
      index,
      result: 1,
    }
  }
  let result = -1
  for (let i = 0, len = matrix.length; i < len; i += 1) {
    if (matrix[i] !== 0) continue
    let _m = matrix.slice()
    _m[i] = type
    let opp = bestChoice(_m, 3 - type)
    if (-opp.result >= result) {
      index = i
      result = -opp.result
    }
  }

  return {
    index,
    result: index > -1 ? result : 0,
  }
}

bindEvent()
