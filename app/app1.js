
const Koa = require('koa');
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = require('./router/router');
const ws_router = require('./router/ws_router');


// 连接数据库
const mongoose = require('mongoose');
const { dbUrl } = require('../config/config.js');
mongoose.connect(dbUrl)
    .then(() => { console.log('Mongodb Connected..'); })
    .catch((err) => { console.log(err); })


// 引入websocket模块 
const websockify = require('koa-websocket');
const ws_app = websockify(app);
ws_app.ws.use((ctx, next) => {
    console.log('websocket连接成功');
    return next(ctx);
})

app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
ws_app.ws.use(ws_router.routes()).use(ws_router.allowedMethods());


const PORT = process.env.PORT || 8080;
ws_app.listen(PORT, () => {
    console.log('server started on port 8080');
});