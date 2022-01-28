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

const {
    getUserBaseInfo,
    getUserFullInfo
} = require('../controller/user.js')

const {
    getArticleById,
    getArticleByAuthor,
    postArticle,
    likeArticle,
    unlikeArticle,
    starArticle,
    unstarArticle,
} = require('../controller/article.js')

const {
    getReviewById,
    getReviewByArticle,
    postReview,
    likeReview,
    unlikeReview
} = require('../controller/review.js')

router.get("/", async (ctx) => {
    ctx.body = { msg: "Hello koa Interfaces" };
})

// login
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getLoginStatus", getLoginStatus);

// user
router.get("/user/baseInfo", getUserBaseInfo);
router.get("/user/fullInfo", getUserFullInfo);

// article
router.get("/article/byId", getArticleById);
router.get("/article/byAuthor", getArticleByAuthor);
router.post("/article", postArticle);
router.post("/article/like", likeArticle);
router.post("/article/unlike", unlikeArticle);
router.post("/article/star", starArticle);
router.post("/article/unstar", unstarArticle);

// review
router.get("/review/byId", getReviewById);
router.get("/review/byArticle", getReviewByArticle);
router.post("/review", postReview);
router.post("/review/like", likeReview);
router.post("/review/unlike", unlikeReview);

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