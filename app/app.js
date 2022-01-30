
const Koa = require('koa');
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = require('./router/router');
const server = require('http').createServer(app.callback());

// 连接数据库
const mongoose = require('mongoose');
const { dbUrl } = require('../config/config');
mongoose.connect(dbUrl)
    .then(() => { console.log('Mongodb Connected..'); })
    .catch((err) => { console.log(err); })

 

app.use(cors({
    origin: "http://localhost:3000",
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
    allowHeaders: ['sessionId', 'Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['SESSIONID', 'WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}))
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

// 引入websocket模块 
const io = require('socket.io')(server, { cors: true });
io.of('/home/chat').on('connection', (socket) => {
    socket.on('get-chatList', (userId) => {
        console.log(userId);

        socket.join(userId);
    })
})

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log('server started on port 8080');
});