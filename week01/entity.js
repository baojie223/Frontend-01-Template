const res = []
Array.prototype.map.call(document.querySelectorAll('pre'), item => {
  return item.innerText
}).forEach(item => {
  const pattern = /<!ENTITY(\s*[a-z]+\s*)CDATA/ig
  item.replace(pattern, (match, p) => {
    res.push(p.trim())
  })
})
console.log(res.join('\n'))

