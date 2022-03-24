
const Koa = require('koa');
const jwt = require('koa-jwt');
const SECRET = require('../config/jwt.js');
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
const jsonwebtoken = require('jsonwebtoken');
mongoose.connect(dbUrl)
    .then(() => { console.log('Mongodb Connected..'); })
    .catch((err) => { })

app.use(async (ctx, next) => {
    return next().catch((err) => {
        if (err) {
            ctx.status = 401;
            ctx.body = {
                status: 401,
                msg: '登录过期，请重新登录'
            }
        } else {
            console.log(err, '这是错误啊啊啊');
        }
    });
});

// 设置跨域
app.use(cors({
    origin: "http://localhost:3000",
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
    allowHeaders: ['sessionId', 'Content-Type', 'authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['SESSIONID', 'WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}))

// 引入验证 
app.use(jwt({ secret: SECRET }).unless(
    { path: [/^\/public/, /^\/login/, /^\/register/, /^\/logout/], },
))
app.use(async (ctx, next) => {
    const token = ctx.headers.authorization;
    if (!token) {
        await next();
    } else {
        jsonwebtoken.verify(token, SECRET, res => { });
        await next();
    }
})


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
    socket.on("online", userId => {
        socket.join(userId);
    })
    socket.on('send-message', (msg) => {
        const { userId, receiverId, message } = msg;
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