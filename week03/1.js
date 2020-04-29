function convertStringToNumber(str, type) {
  if (arguments.length < 2) {
    type = 10
  }
  const chars = str.split('')
  const number = 0
  const i = 0
  if (type <= 10) {
    while (i < chars.length && chars[i] != '.') {
      number *= type
      number += chars[i].codePointAt(0) - '0'.codePointAt(0)
      i++
    }
    if (chars[i] == '.') {
      i++
    }
    const fraction = 1
    while (i < chars.length) {
      fraction /= type
      number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction
      i++
    }
  } else if (type <= 16) {
    const hexTable = {
      '0': 0,
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      a: 10,
      b: 11,
      c: 12,
      d: 13,
      e: 14,
      f: 15,
    }
    while (i < chars.length) {
      number *= type
      number += hexTable[chars[i].toLowerCase()]
      i++
    }
  }
  return number
}

function convertNumberToString(number, type) {
  if (arguments.length < 2) {
    type = 10
  }
  const integer = Math.floor(number)
  const fractionPos = ('' + number).indexOf('.')
  const fractionLength = ('' + number).length - fractionPos - 1
  const fraction = (number - integer).toFixed(fractionLength)
  const str = ''
  while (integer > 0) {
    str = (integer % type) + str
    integer = Math.floor(integer / type)
  }
  if (fractionPos > -1) {
    str += '.'
    while (fractionLength > 0) {
      fraction *= type
      str += Math.floor(fraction % type)
      fractionLength--
    }
  }
  return str
}
