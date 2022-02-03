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
    followUser,
    cancelFollow,
    getFollowerList,
    getFanList,
    edit,
    upload
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
    getLikedArticles,
    getStaredArticles
} = require('../controller/article.js')

const {
    getReviewById,
    getReviewByArticle,
    postReview,
    deleteReview,
    likeReview,
    unlikeReview,
    getLikedReviews
} = require('../controller/review.js');
const { searchByArticle, searchByUser } = require('../controller/search');

const {
    getLikeUsersArticle,
    getStarUsersArticle,
    getLikeUsersComment,
} = require('../controller/notice');


router.get("/", async (ctx) => {
    ctx.body = { msg: "Hello koa Interfaces" };
})

// const setCookies = require('../middleware/setCookies');
// login
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getLoginStatus", getLoginStatus);

// user
router.get("/user/baseInfo", getUserBaseInfo);
router.get("/user/fullInfo", getUserFullInfo);
router.post("/user/follow", followUser);
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
router.get("/article/getLike", getLikedArticles);
router.get("/article/getStar", getStaredArticles);

// review
router.get("/review/byId", getReviewById);
router.get("/review/byArticle", getReviewByArticle);
router.post("/review", postReview);
router.post("/review/delete", deleteReview);
router.post("/review/like", likeReview);
router.post("/review/unlike", unlikeReview);
router.get("/review/getLike", getLikedReviews);

// chat
router.post('/chat/send', sendMessage);
router.get('/chat/getRecord', getChattingRecord);
router.get('/chat/getList', getChatList);

// search
router.get('/search/byArticle', searchByArticle);
router.get('/search/byUser', searchByUser);

// notice
router.get('/notice/article/like', getLikeUsersArticle);
router.get('/notice/article/star', getStarUsersArticle);
router.get('/notice/comment', getLikeUsersComment);

// edit
router.post("/user/edit", edit);
router.post("/user/upload", upload);

module.exports = router;