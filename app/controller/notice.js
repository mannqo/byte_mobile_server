const ArticleModel = require('../models/ArticleModel');
const UserModel = require('../models/UserModel');
const ReviewModel = require('../models/ReviewModel');


// 获取喜欢和收藏用户文章的人
const getLikeUsersArticle = async ctx => {
    try {
        const { userId } = ctx.query;
        const articles = await ArticleModel.find({ userId }).select('articleId likerList postDate images');
        const like = [];
        for (const article of articles) {
            const { likerList, postDate } = article;
            for (let userId of likerList) {
                const userInfo = await UserModel.findOne({ userId }).select('userId nickname avatar');
                const articleInfo = article;
                like.push({ articleInfo, userInfo, postDate })
            }
        }
        ctx.body = { status: 200, like };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 200, msg: '内部错误' };
    }
}


const getStarUsersArticle = async ctx => {
    try {
        const { userId } = ctx.query;
        const articles = await ArticleModel.find({ userId }).select('articleId starerList postDate images');
        const star = [];
        for (const article of articles) {
            const { starerList, postDate } = article;
            for (let userId of starerList) {
                const userInfo = await UserModel.findOne({ userId }).select('userId nickname avatar');
                const articleInfo = article;
                star.push({ articleInfo, userInfo, postDate });
            }
        }
        ctx.body = { status: 200, star };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }


}

const getLikeUsersComment = async ctx => {
    try {
        const { userId } = ctx.query;
        const reviews = await ReviewModel.find({ userId }).select('replyToUserId replyToArticleId parentReviewId postDate');
        const like = [];
        for (const item of reviews) {
            const userInfo = await UserModel.findOne({ userId: item.replyToUserId }).select('userId nickname avatar');
            const articleInfo = await ArticleModel.findOne({ articleId: item.replyToArticleId }).select('articleId images');
            like.push({ reviews: { parentReviewId: item.parentReviewId, postDate: item.postDate }, userInfo, articleInfo })
        }
        ctx.body = { status: 200, like };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 200, msg: '内部错误' };
    }
}

module.exports = {
    getLikeUsersArticle,
    getStarUsersArticle,
    getLikeUsersComment,
}