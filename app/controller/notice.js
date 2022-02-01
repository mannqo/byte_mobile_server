const ArticleModel = require('../models/ArticleModel.js');


// 获取喜欢和收藏用户文章的人
const getLikeUsersArticle = async ctx => {
    try {
        const { userId } = ctx.query;
        const articles = await ArticleModel.find({ userId }).select('articleId likerList postDate');
        const like = [];
        articles.forEach((item) => {
            const { articleId, likerList, postDate } = item;
            for (let userId of likerList) {
                like.push({ articleId, userId, postDate })
            }
        })
        ctx.body = { status: 200, like };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 200, msg: '内部错误' };
    }
}


const getStarUsersArticle = async ctx => {
    try {
        const { userId } = ctx.query;
        const articles = await ArticleModel.find({ userId }).select('articleId starerList postDate');
        const star = [];
        articles.forEach((item) => {
            const { articleId, starerList, postDate } = item;
            for (let userId of starerList) {
                star.push({ articleId, userId, postDate });
            }
        })
        ctx.body = { status: 200, star };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }


}

const getLikeUsersComment = async ctx => {
    const { userId } = ctx.query;

}

module.exports = {
    getLikeUsersArticle,
    getStarUsersArticle,
    getLikeUsersComment,
}