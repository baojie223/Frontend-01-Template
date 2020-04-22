function utf8Encoding(text) {
  const code = encodeURIComponent(text)
  const bytes = []
  for (let i = 0; i < code.length; i++) {
    const c = code.charAt(i)
    if (c === '%') {
      const hex = Number.parseInt(code.charAt(i + 1) + code.charAt(i + 2), 16)
      // const binary = hex.toString(2)
      bytes.push(hex)
      i += 2
    } else {
      bytes.push(c.charCodeAt(0))
    }
  }
  return bytes
}

console.log(utf8Encoding('包')) // [229, 140, 133]