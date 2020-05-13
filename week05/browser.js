const http = require('http');

const server = http.createServer((req, res) => {
	console.log('request received');
	console.log(req.headers);
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('X-Foo', 'bar');
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('ok');
});

server.listen(8088);


const net = require('net');

// 请求API
class Request {
	/**
	 * method, url = host + port + path
	 * body: key - value
	 * headers
	 */
	constructor(options) {
		this.method = options.method || 'GET';
		this.host = options.host;
		this.port = options.port || 80;
		this.path = options.path || '/';
		this.body = options.body || {};
		this.headers = options.headers || {};

		if (!this.headers['Content-Type']) {
			this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}
		if (this.headers['Content-Type'] === 'application/json') {
			this.bodyText = JSON.stringify(this.body);
		} else if (
			this.headers['Content-Type'] === 'application/x-www-form-urlencoded'
		) {
			this.bodyText = Object.keys(this.body)
				.map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
				.join('&');
		}
		this.headers['Content-Length'] = this.bodyText.length;
	}

	// 转换数据
	toString() {
		return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
	.map((key) => key + ': ' + this.headers[key])
	.join('\r\n')}\r
\r
${this.bodyText}`;
	}

	send(connection) {
		return new Promise((resolve, reject) => {
			const parser = new ResponseParser();
			if (connection) {
				connection.write(this.toString());
			} else {
				// 主动创建connection
				connection = net.createConnection(
					{
						host: this.host,
						port: this.port,
					},
					() => {
						// 成功回调
						connection.write(this.toString());
					}
				);
				connection.on('data', (data) => {
					parser.receive(data.toString());
					// 如果是结束, 则成功返回
					if (parser.isFinished) {
						resolve(parser.response);
					}
					connection.end();
				});
				connection.on('error', (err) => {
					reject(err);
					connection.end();
				});
			}
		});
	}
}

class ResponseParser {
	constructor() {
		this.WAITING_STATUS_LINE = 0;
		this.WAITING_STATUS_LINE_END = 1;
		this.WAITING_HEADER_NAME = 2;
		this.WAITING_HEADER_SPACE = 3;
		this.WAITING_HEADER_VALUE = 4;
		this.WAITING_HEADER_LINE_END = 5;
		this.WAITING_HEADER_BLOCK_END = 6;
		this.WAITING_BODY = 7;

		this.current = this.WAITING_STATUS_LINE;
		this.statusLine = '';
		this.headers = {};
		this.headerName = '';
		this.headerValue = '';

		// 初始化bodyParser, 会在解析完header之后创建
		this.bodyParser = null;
	}

	// 保证有 bodyParser 并且是最后一个
	get isFinished() {
		return this.bodyParser && this.bodyParser.isFinished;
	}

	// 处理返回数据
	get response() {
		// 正则匹配
		this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
		return {
			statusCode: RegExp.$1,
			statusText: RegExp.$2,
			headers: this.headers,
			body: this.bodyParser.content.join(''),
		};
	}

	receive(string) {
		for (let i = 0; i < string.length; i++) {
			this.receiveChar(string.charAt(i));
		}
	}
	receiveChar(char) {
		if (this.current === this.WAITING_STATUS_LINE) {
			if (char === '\r') {
				this.current = this.WAITING_STATUS_LINE_END;
			} else {
				this.statusLine += char;
			}
		} else if (this.current === this.WAITING_STATUS_LINE_END) {
			if (char === '\n') {
				this.current = this.WAITING_HEADER_NAME;
			}
		} else if (this.current === this.WAITING_HEADER_NAME) {
			// console.log(char.charCodeAt(0));
			if (char === ':') {
				this.current = this.WAITING_HEADER_SPACE;
			} else if (char === '\r') {
				this.current = this.WAITING_HEADER_BLOCK_END;
				// 判断使用哪个parser处理body
				if (this.headers['Transfer-Encoding'] === 'chunked') {
					this.bodyParser = new TrunkedBodyParser();
				}
			} else {
				this.headerName += char;
			}
		} else if (this.current === this.WAITING_HEADER_SPACE) {
			if (char === ' ') {
				this.current = this.WAITING_HEADER_VALUE;
			}
		} else if (this.current === this.WAITING_HEADER_VALUE) {
			if (char === '\r') {
				this.current = this.WAITING_HEADER_LINE_END;
				// 保存headers
				this.headers[this.headerName] = this.headerValue;
				// 清空操作
				this.headerName = '';
				this.headerValue = '';
			} else {
				this.headerValue += char;
			}
		} else if (this.current === this.WAITING_HEADER_LINE_END) {
			if (char === '\n') {
				this.current = this.WAITING_HEADER_NAME;
			}
		} else if (this.current === this.WAITING_HEADER_BLOCK_END) {
			if (char === '\n') {
				this.current = this.WAITING_BODY;
			}
		} else if (this.current === this.WAITING_BODY) {
			// 转发
			this.bodyParser.receiveChar(char);
		}
	}
}

// Response API
class Response {}

class TrunkedBodyParser {
	// 根据报文格式设计各个状态
	constructor() {
		this.WAITING_LENGTH = 0;
		this.WAITING_LENGTH_LINE_END = 1;
		this.READING_TRUNK = 2;
		this.WAITING_NEW_LINE = 3;
		this.WAITING_NEW_LINE_END = 4;
		this.length = 0; // 计数器
		this.isFinished = false; // 是否结束处理
		this.content = [];

		this.current = this.WAITING_LENGTH;
	}

	// 处理接受到的char
	receiveChar(char) {
		// console.log(JSON.stringify(char));
		if (this.current === this.WAITING_LENGTH) {
			if (char === '\r') {
				if (this.length === 0) {
					this.isFinished = true;
				} else {
					this.current = this.WAITING_LENGTH_LINE_END;
				}
			} else {
				// 计算length
				this.length *= 10; // 因为是在10进制的末尾＋, 要先乘以10
				// 处理字符串 0
				this.length += char.charCodeAt(0) - '0'.charCodeAt(0);
			}
		} else if (this.current === this.WAITING_LENGTH_LINE_END) {
			// 只吃掉一个'\n' 不需要处理操作
			if (char === '\n') {
				this.current = this.READING_TRUNK;
			}
		} else if (this.current === this.READING_TRUNK) {
			this.content.push(char);
			this.length--;
			if (this.length === 0) {
				this.current = this.WAITING_NEW_LINE;
			}
		} else if (this.current === this.WAITING_NEW_LINE) {
			if (char === '\r') {
				this.current = this.WAITING_NEW_LINE_END;
			}
		} else if (this.current === this.WAITING_NEW_LINE_END) {
			if (char === '\n') {
				// 最后回到第一个状态, 进行循环处理
				this.current = this.WAITING_LENGTH;
			}
		}
	}
}

// 模仿向服务端发送请求
void (async function () {
	let request = new Request({
		method: 'POST',
		host: '127.0.0.1',
		port: '8088',
		path: '/',
		headers: {
			['X-Foo2']: 'mine',
		},
		body: {
			name: 'xiaofan',
		},
	});

	let response = await request.send();
	console.log(response);
})();
