const ArticleModel = require('../models/ArticleModel.js');
const UserModel = require('../models/UserModel.js');


// 获取喜欢和收藏用户文章的人
const getLikeUsersArticle = async ctx => {
    try {
        const { userId } = ctx.query;
        const articles = await ArticleModel.find({ userId }).select('articleId likerList postDate');
        const like = [];
        for (const article of articles) {
            const { likerList, postDate } = article;
            for (let userId of likerList) {
                const userInfo = await UserModel.findOne({ userId });
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
        const articles = await ArticleModel.find({ userId }).select('articleId starerList postDate');
        const star = [];
        for (const article of articles) {
            const { starerList, postDate } = article;
            for (let userId of starerList) {
                const userInfo = await UserModel.findOne({ userId });
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
    const { userId } = ctx.query;

}

module.exports = {
    getLikeUsersArticle,
    getStarUsersArticle,
    getLikeUsersComment,
}