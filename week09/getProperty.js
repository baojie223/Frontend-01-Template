let allAttr = []
let arr = []
let dom = document.getElementById('container').children
for (let element of dom) {
  if (element.dataset.tag.match(/css/))
    arr.push({
      name: element.children[1].children[0].innerHTML,
      url: element.children[1].children[0].href,
    })
}
let frame = document.createElement('iframe')
document.body.innerHTML = ''
document.body.appendChild(frame)
function happend(element, event) {
  return new Promise((resolve) => {
    let handler = () => {
      resolve()
      element.removeEventListener(event, handler)
    }
    element.addEventListener(event, handler)
  })
}
function collectAttr() {
  return new Promise((resolve) => {
    if (frame.contentDocument.querySelectorAll('.property').length != 0)
      Array.from(frame.contentDocument.querySelectorAll('.property')).reduce((init, item) => {
        if (
          allAttr.indexOf(item.innerHTML) == -1 &&
          !item.innerHTML.match(/‘|--|^-|\*|^</) &&
          item.innerHTML.length >= 3
        ) {
          allAttr.push(item.innerHTML)
          return allAttr
        }
      })
    resolve()
  })
}
void (async function () {
  for (let el of arr) {
    frame.src = el.url
    await happend(frame, 'load')
    await collectAttr()
  }
})()
frame.src = 'https://www.w3.org/TR/2020/WD-css-sizing-4-20200526/'
