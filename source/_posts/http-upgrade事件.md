---
title: 部分Http-upgrade事件学习
date: 2018-07-09 13:31:30
tags:
---

[谈谈 HTTP/2 的协议协商机制](https://imququ.com/post/protocol-negotiation-in-http2.html)
[nodejs-learning-guide](https://github.com/chyingp/nodejs-learning-guide/blob/master/%E6%A8%A1%E5%9D%97/http.client.md)

**1. 通用首部字段：Upgrade**

检测http协议及其他协议是否可使用更高的版本进行通信，其参数值可用来指定一个完全不同的通信协议

客户端请求：

GMT /index.htm HTTP/1.1

Upgrade: TLS/1.0

Connection: Upgrade

服务器响应:

HTTP/1.1 101 Switching Protocols

Upgrade: TLS/1.0, HTTP/1.1

Connection: Upgrade

上面的例子中，首部字段Upgrade指定的值为TLS/1.0，这里的两个首部字段的对应关系，

的值被指定为Upgrade。

Upgrade对象仅限于客户端和邻近服务器之间，因此，使用首部字段Upgrade时，还需要额外指定Connection Upgrade

对于附有首部字段Upgrade的请求，服务器可以用101Switch Protocols状态码作为响应返回



**2. MDN介绍**

[MDN中文Upgrage](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Protocol_upgrade_mechanism)
[MDN英文Upgrage](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism)

`Connection: Upgrade`

The `Connection` header is set to `"Upgrade"` to indicate that an upgrade is requested.

`Upgrade: *protocols*`

The `Upgrade` header specifies one or more comma-separated protocol names, in order of preference.



**3. NodeJs的upgrade事件**

http://docs.pythontab.com/nodejs/httpclient/

* Client: 

Event: 'upgrade'
 `function (request, socket, head)`

当服务器响应upgrade 请求时触发此事件，如果这个消息没有被监听，客户端接收到一个upgrade 头的话会导致 这个连接被关闭。



* Server:

Event: 'upgrade'

```
function (request, socket, head)```

。如果这个事件没有监听，那么请求upgrade 的客户端对
应的连接将被关闭。

1.参数“request”代表一个http 请求，和'request'事件的参数意义相同。

2.socket 是在服务器与客户端之间连接用的网络socket

3.head 是Buffer 的一个实例,是upgraded stream(升级版stream....应当就是http upgrade)所发出的第一个包，这个参数可以为空。

当此事件被触发后，该请求所使用的socket 并不会有一个数据事件的监听者,这意味着你如果需要处理通过这个
SOCKET 发送到服务器端的数据的话则需要自己绑定数据事件监听器
```



1：Server端收到upgrade事件(每当一个客户端请求一个http upgrade 时候发出此消息).客户端发送的要求就是Connection和Upgrade都需要有。



2： Client端，当服务器响应upgrade 请求时触发此事件，即返回101等。


```
const http = require('http');

// 创建一个 HTTP 服务器
const srv = http.createServer( (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');
});
srv.on('upgrade', (req, socket, head) => {
  console.log('req');
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               // 'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket);
});

// 服务器正在运行
srv.listen(1337, '127.0.0.1', () => {

  // 发送一个请求
  const options = {
    port: 1337,
    hostname: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  const req = http.request(options);
  req.end();
  console.log('lal');
  // 2. 当服务器响应upgrade 请求时触发此事件
  req.on('upgrade', (res, socket, upgradeHead) => {
    3. console.log('got upgraded!');
    socket.end();
    process.exit(0);
  });
});
```



**4. NodeJs的socket.io**
[socket.io 的详细工作流程是怎样的？--知乎](https://www.zhihu.com/question/31965911/answer/156849718)
在其中"如果支持，就会启动一个 WebSocket 连接"这一段时候启动WebSocket连接，并且触发connection事件

