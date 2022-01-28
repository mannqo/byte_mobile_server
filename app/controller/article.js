const ArticleModel = require('../model/ArticleModel.js');
const UserModel = require('../model/UserModel.js');


// 通过文章ID查找文章
const getArticleById = async (ctx) => {
    const { articleId } = ctx.query;
    const article = await ArticleModel.findOne({ articleId });

    if (article) {
        ctx.body = { status: 200, msg: '成功', article };
    } else {
        ctx.body = { status: 404, msg: '找不到该文章' };
    }
}

// 通过文章作者ID查找文章
const getArticleByAuthor = async (ctx) => {
    const { authorId } = ctx.query;
    const articles = await ArticleModel.find({ authorId });

    if (articles) {
        ctx.body = { status: 200, msg: '成功', articles };
    } else {
        ctx.body = { status: 404, msg: '找不到任何结果' };
    }
}

// 发布文章
const postArticle = async (ctx) => {
    const { userId, images, title, content, tags } = ctx.request.body;
    const articles = await ArticleModel.find({});
    const articleId = articles.length + 1;
    const newArticle = new ArticleModel({
        articleId,
        userId,
        images,
        title,
        content,
        tags,
    })

    try {
        await ArticleModel.create(newArticle);
        ctx.body = { status: 200, msg: '发布成功' }
    } catch (err) {
        ctx.body = { status: 500, msg: '发布失败' }
    }
}

// 喜欢文章
const likeArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const article = await ArticleModel.findOne({ articleId });

    // 判断用户id和文章id是否有效
    if (user && article) {
        const { likedArticles } = user;
        if (likedArticles.includes(articleId)) {
            ctx.body = { status: 406, msg: '你已经喜欢过了' }
        } else {
            likedArticles.push(articleId);
            const result = await UserModel.updateOne({ userId }, { likedArticles });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, articleId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

// 取消喜欢文章
const unlikeArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const article = await ArticleModel.findOne({ articleId });

    // 判断用户id和文章id是否有效
    if (user && article) {
        const { likedArticles } = user;
        if (!likedArticles.includes(articleId)) {
            ctx.body = { status: 406, msg: '你还没有喜欢这篇文章' }
        } else {
            const result = await UserModel.updateOne({ userId }, {
                likedArticles: likedArticles.filter(i => i != articleId)
            });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, articleId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

// 收藏文章
const starArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const article = await ArticleModel.findOne({ articleId });

    // 判断用户id和文章id是否有效
    if (user && article) {
        const { staredArticles } = user;
        if (staredArticles.includes(articleId)) {
            ctx.body = { status: 406, msg: '你已经收藏过了' }
        } else {
            staredArticles.push(articleId);
            const result = await UserModel.updateOne({ userId }, { staredArticles });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, articleId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

// 取消收藏文章
const unstarArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const article = await ArticleModel.findOne({ articleId });

    // 判断用户id和文章id是否有效
    if (user && article) {
        const { staredArticles } = user;
        if (!staredArticles.includes(articleId)) {
            ctx.body = { status: 406, msg: '你还没有收藏这篇文章' }
        } else {
            const result = await UserModel.updateOne({ userId }, {
                staredArticles: staredArticles.filter(i => i != articleId)
            });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, articleId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

module.exports = {
    getArticleById,
    getArticleByAuthor,
    postArticle,
    likeArticle,
    unlikeArticle,
    starArticle,
    unstarArticle,
};