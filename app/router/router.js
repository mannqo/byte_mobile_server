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
    getUserBaseInfo,
    getUserFullInfo,
    followUsers,
    cancelFollow,
    getFollowerList,
    getFanList,
} = require('../controller/user.js')

const {
    getArticleById,
    getArticleByAuthor,
    postArticle,
    deleteArticle,
    likeArticle,
    unlikeArticle,
    starArticle,
    unstarArticle,
} = require('../controller/article.js')

const {
    getReviewById,
    getReviewByArticle,
    postReview,
    deleteReview,
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
router.post("/user/follow", followUsers);
router.post("/user/cancelFollow", cancelFollow);
router.get("/user/followerList", getFollowerList);
router.get("/user/fanList", getFanList);

// article
router.get("/article/byId", getArticleById);
router.get("/article/byAuthor", getArticleByAuthor);
router.post("/article", postArticle);
router.post("/article/delete", deleteArticle);
router.post("/article/like", likeArticle);
router.post("/article/unlike", unlikeArticle);
router.post("/article/star", starArticle);
router.post("/article/unstar", unstarArticle);

// review
router.get("/review/byId", getReviewById);
router.get("/review/byArticle", getReviewByArticle);
router.post("/review", postReview);
router.post("/review/delete", deleteReview);
router.post("/review/like", likeReview);
router.post("/review/unlike", unlikeReview);

// message
router.post('/sendMessage', sendMessage);
router.get('/getChattingRecord', getChattingRecord);
router.get('/getChatList', getChatList);

module.exports = router;