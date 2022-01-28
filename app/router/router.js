const Router = require('koa-router');
const router = new Router();


const {
    login,
    logout,
    register,
    getLoginStatus
} = require('../controller/login.js')

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
// router.all('/sendMessage', sendMessage);
// router.all('/getChattingRecord', getChattingRecord);
// router.all('/getChatList', getChatList);

// export { };

module.exports = router;