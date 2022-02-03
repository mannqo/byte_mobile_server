
const Koa = require('koa');
const cors = require('koa2-cors')
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const app = new Koa();
const router = require('./router/router');
const server = require('http').createServer(app.callback());

// 连接数据库
const mongoose = require('mongoose');
const { dbUrl } = require('../config/config');
mongoose.connect(dbUrl)
    .then(() => { console.log('Mongodb Connected..'); })
    .catch((err) => { })

app.use(cors({
    origin: "http://localhost:3000",
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
    allowHeaders: ['sessionId', 'Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['SESSIONID', 'WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}))

// 存放静态资源
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/img'),
        keepExtensions: true,
        maxFieldsSize: 10 * 1024 * 1024,
    }
}))
app.use(koaStatic(path.join(__dirname), 'public'));
app.use(router.routes()).use(router.allowedMethods());

// 引入websocket模块 
const io = require('socket.io')(server, { cors: true });
io.of('/chat').on('connection', socket => {
    socket.on('online', userId => {
        socket.join(userId);
    })
    socket.on('send-message', (userId, receiverId, message) => {
        console.log(userId, receiverId, message);
        socket.to(receiverId).emit('receive-message', {
            userId,
            receiverId,
            message
        })
    })
})

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log('server started on port 8080');
});