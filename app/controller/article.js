const ArticleModel = require('../models/ArticleModel.js');
const ReviewModel = require('../models/ReviewModel.js');
const UserModel = require('../models/UserModel.js');
const { deleteReview } = require('./review');


// 通过文章ID查找文章
const getArticleById = async (ctx) => {
    const { articleId } = ctx.query;
    try {
        const article = await ArticleModel.findOne({ articleId });
        if (article) {
            if (article.available) {
                const { reviewList } = article;
                const list = await ReviewModel.find({ _id: { $in: reviewList } });
                for (const review of list) {
                    review.reviewList = await ReviewModel.find({ _id: { $in: review.reviewList } });
                }
                article.reviewList = list;

                ctx.body = { status: 200, msg: '成功', article };
            } else {
                ctx.body = { status: 406, msg: '文章已被删除' };
            }
        } else {
            ctx.body = { status: 404, msg: '找不到该文章' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 通过文章作者ID查找文章
const getArticleByAuthor = async (ctx) => {
    const { authorId } = ctx.query;
    try {
        const articles = await ArticleModel.find({ authorId, available: true });

        if (articles.length > 0) {
            ctx.body = { status: 200, msg: '成功', articles };
        } else {
            ctx.body = { status: 404, msg: '找不到任何结果' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 发布文章
const postArticle = async (ctx) => {
    const { userId, images, title, content, tags } = ctx.request.body;
    try {
        const articles = await ArticleModel.find({});
        const articleId = articles.length > 0 ? articles[articles.length - 1].articleId + 1 : 1;
        const newArticle = new ArticleModel({
            articleId,
            authorId: userId,
            images,
            title,
            content,
            tags,
            postDate: new Date().toISOString(),
        })

        try {
            await ArticleModel.create(newArticle);
            ctx.body = { status: 200, msg: '发布成功' }
        } catch (err) {
            ctx.body = { status: 500, msg: '发布失败' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 根据id删除文章（把文章设为失效）
const deleteArticle = async (ctx) => {
    const { articleId } = ctx.request.body;
    try {
        const article = await ArticleModel.findOne({ articleId, available: true });

        if (article) {
            // 递归删除article中的每一条评论
            article.reviewList.forEach(async (reviewId) => {
                // 假装请求
                const fakeCtx = { request: { body: { reviewId } }, body: {} };
                await deleteReview(fakeCtx);
                if (fakeCtx.body.status !== 200) {
                    // 删除失败
                    console.error({ fakeCtx });
                    ctx.body = { status: 500, msg: '内部错误' };
                    return;
                }
            })
            // 设置article失效
            const result = await ArticleModel.updateOne({ articleId }, { available: false });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '删除文章成功' };
            } else {
                console.error({ articleId, result });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        } else {
            ctx.body = { status: 404, msg: '找不到该文章' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 喜欢文章
const likeArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const article = await ArticleModel.findOne({ articleId });

        // 判断用户id和文章id是否有效
        if (user && article && article.available) {
            const { likedArticles } = user;
            if (likedArticles.includes(article._id)) {
                ctx.body = { status: 406, msg: '你已经喜欢过了' }
            } else {
                likedArticles.push(article._id);
                article.likerList.push(userId);
                const userResult = await UserModel.updateOne({ userId }, { likedArticles });
                const articleResult = await ArticleModel.updateOne({ articleId }, { likes: article.likes + 1, likerList: article.likerList });
                const success = userResult.modifiedCount && articleResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, articleId });
                    ctx.body = { status: 500, msg: '内部错误' };
                }
            }
        } else {
            ctx.body = { status: 400, msg: '参数有误' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 取消喜欢文章
const unlikeArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const article = await ArticleModel.findOne({ articleId });

        // 判断用户id和文章id是否有效
        if (user && article && article.available) {
            const { likedArticles } = user;
            if (!likedArticles.includes(article._id)) {
                ctx.body = { status: 406, msg: '你还没有喜欢这篇文章' }
            } else {
                const userResult = await UserModel.updateOne({ userId }, {
                    likedArticles: likedArticles.filter(i => i.toString() !== article._id.toString())
                });
                const likerList = article.likerList.filter(i => i !== userId);
                const articleResult = await ArticleModel.updateOne({ articleId }, { likes: article.likes - 1, likerList });
                const success = userResult.modifiedCount && articleResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, articleId });
                    ctx.body = { status: 500, msg: '内部错误' };
                }
            }
        } else {
            ctx.body = { status: 400, msg: '参数有误' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 收藏文章
const starArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const article = await ArticleModel.findOne({ articleId });

        // 判断用户id和文章id是否有效
        if (user && article && article.available) {
            const { staredArticles } = user;
            if (staredArticles.includes(article._id)) {
                ctx.body = { status: 406, msg: '你已经收藏过了' }
            } else {
                staredArticles.push(article._id);
                article.starerList.push(userId);
                const userResult = await UserModel.updateOne({ userId }, { staredArticles });
                const articleResult = await ArticleModel.updateOne({ articleId }, { stars: article.stars + 1, starerList: article.starerList });
                const success = userResult.modifiedCount && articleResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, articleId });
                    ctx.body = { status: 500, msg: '内部错误' };
                }
            }
        } else {
            ctx.body = { status: 400, msg: '参数有误' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 取消收藏文章
const unstarArticle = async (ctx) => {
    const { userId, articleId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const article = await ArticleModel.findOne({ articleId });

        // 判断用户id和文章id是否有效
        if (user && article && article.available) {
            const { staredArticles } = user;
            if (!staredArticles.includes(article._id)) {
                ctx.body = { status: 406, msg: '你还没有收藏这篇文章' }
            } else {
                const userResult = await UserModel.updateOne({ userId }, {
                    staredArticles: staredArticles.filter(i => i.toString() !== article._id.toString())
                });
                const starerList = article.starerList.filter(i => i !== userId);
                const articleResult = await ArticleModel.updateOne({ articleId }, { stars: article.stars - 1, starerList });
                const success = userResult.modifiedCount && articleResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, articleId });
                    ctx.body = { status: 500, msg: '内部错误' };
                }
            }
        } else {
            ctx.body = { status: 400, msg: '参数有误' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 获取点赞文章
const getLikedArticles = async (ctx) => {
    const { userId } = ctx.query;
    try {
        const res = await UserModel.findOne({ userId }).select('likedArticles');
        const { likedArticles } = res;
        const articles = await ArticleModel.find({ _id: { $in: likedArticles } });
        ctx.body = { status: 200, msg: '成功', likedArticles: articles };
    } catch (err) {
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 获取收藏文章
const getStaredArticles = async (ctx) => {
    const { userId } = ctx.query;
    try {
        const res = await UserModel.findOne({ userId }).select('staredArticles');
        const { staredArticles } = res;
        const articles = await ArticleModel.find({ _id: staredArticles });
        ctx.body = { status: 200, msg: '成功', staredArticles: articles };
    } catch (err) {
        ctx.body = { status: 500, msg: '内部错误' }
    }
}





module.exports = {
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
};