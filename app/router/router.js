const Router = require('koa-router');
const router = new Router();

const {
    login,
    logout,
    register,
    getLoginStatus
} = require('../controller/login')

const {
    sendMessage,
    getChattingRecord,
    getChatList
} = require('../controller/sendMessage');

const {
    likeOrStar,
    cancelLikeOrStar,
    getUserInfo,
    followUsers,
    cancelFollow,
    getFollowerList,
    getFanList,
    likeStarMiddle,
} = require('../controller/userInfo')

router.get("/", async (ctx) => {
    ctx.body = { msg: "Hello koa Interfaces" };
})

// login
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getLoginStatus", getLoginStatus);

// message
router.post('/sendMessage', sendMessage);
router.get('/getChattingRecord', getChattingRecord);
router.get('/getChatList', getChatList);

// 点赞收藏
router.post('/likeOrStar', likeStarMiddle, likeOrStar);
router.delete('/cancelLikeOrStar', likeStarMiddle, cancelLikeOrStar);
// 用户
router.get('/getUserInfo', getUserInfo);
router.post('/follow', followUsers);
router.delete('/cancelFollow', cancelFollow);
router.get('/getFollowerList', getFollowerList);
router.get('/getFanList', getFanList);

module.exports = router;