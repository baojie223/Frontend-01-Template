let state = 'abc123'
let client_id = 'Iv1.ed16e883v2feshk'
let client_secret = 'd88b754e21c9fdcbg404e58cf22131f28b826805'
let redirect_uri = encodeURIComponent('http://localhost:8000')

/**
 * 1. 唤起浏览器
 */
let authURI = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
  'http://localhost:8000'
)}`

/**
 * 2. 服务端
 */
let code = '382b7fe2e92f78cac71e'
let params = `code=${code}&state=${state}&client_secret=${client_secret}&client_id=${client_id}&redirect_uri=${redirect_uri}`

let xhr = new XMLHttpRequest()

xhr.open('POST', `https://github.com/login/oauth/access_token?${params}`, true)
xhr.send(null)

xhr.addEventListener('readystatechange', function (event) {
  if (xhr.readyState === 4) {
    console.log(xhr.responseText)
  }
})

/**
 * 3. 客户端/服务器
 */

let token = '78e716c8442802be3385a420f70a75c8c2070b47'
xhr.open('GET', `https://api.github.com/user`, true)
xhr.setRequestHeader('Authorization', `token ${token}`)
xhr.send(null)

xhr.addEventListener('readystatechange', function (event) {
  if (xhr.readyState === 4) {
    console.log(xhr.responseText)
  }
})
