// Временный TCP-мост: маршрут по умолчанию уходит в мёртвый туннель Happ,
// поэтому соединения принудительно привязываем к Wi-Fi (en0).
const http = require('http');
const net = require('net');

const LOCAL = process.env.BRIDGE_LOCAL_ADDRESS || '192.168.0.189';
const PORT = Number(process.env.BRIDGE_PORT || 8799);

http
  .createServer((req, res) => {
    const url = new URL(req.url);
    const up = net.connect(
      { host: url.hostname, port: Number(url.port) || 80, localAddress: LOCAL },
      () => {
        up.write(`${req.method} ${url.pathname}${url.search} HTTP/1.1\r\n`);
        for (const [k, v] of Object.entries(req.headers)) up.write(`${k}: ${v}\r\n`);
        up.write('\r\n');
        req.pipe(up);
        up.pipe(res);
      },
    );
    up.on('error', () => res.destroy());
  })
  .on('connect', (req, cs, head) => {
    const [host, port] = req.url.split(':');
    const up = net.connect({ host, port: Number(port) || 443, localAddress: LOCAL }, () => {
      cs.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length) up.write(head);
      up.pipe(cs);
      cs.pipe(up);
    });
    up.on('error', () => cs.destroy());
    cs.on('error', () => up.destroy());
  })
  .listen(PORT, '127.0.0.1', () => console.log('bridge', PORT, LOCAL));
