const ReviewModel = require('../model/ReviewModel.js');
const UserModel = require('../model/UserModel.js');


// 通过评论ID查找评论
const getReviewById = async (ctx) => {
    const { reviewId } = ctx.query;
    const review = await ReviewModel.findOne({ reviewId });

    if (review) {
        ctx.body = { status: 200, msg: '成功', review };
    } else {
        ctx.body = { status: 404, msg: '找不到该评论' };
    }
}

// 通过文章ID查找评论
const getReviewByArticle = async (ctx) => {
    const { articleId } = ctx.query;
    const reviews = await ReviewModel.find({ articleId });

    if (reviews) {
        ctx.body = { status: 200, msg: '成功', reviews };
    } else {
        ctx.body = { status: 404, msg: '找不到任何结果' };
    }
}

// 发布评论
const postReview = async (ctx) => {
    const { replyToUserId, replyToArticleId, parentReviewId, authorId, content } = ctx.request.body;
    const reviews = await ReviewModel.find({});
    const reviewId = reviews.length + 1;
    const newReview = new ReviewModel({
        reviewId,
        replyToUserId,
        replyToArticleId,
        parentReviewId,
        authorId,
        content,
    })

    try {
        await ReviewModel.create(newReview);
        ctx.body = { status: 200, msg: '发布成功' }
    } catch (err) {
        ctx.body = { status: 500, msg: '发布失败' }
    }
}

// 喜欢评论
const likeReview = async (ctx) => {
    const { userId, reviewId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const review = await ArticleModel.findOne({ reviewId });

    // 判断用户id和评论id是否有效
    if (user && review) {
        const { likedReviews } = user;
        if (likedReviews.includes(reviewId)) {
            ctx.body = { status: 406, msg: '你已经喜欢过了' }
        } else {
            likedReviews.push(reviewId);
            const result = await UserModel.updateOne({ userId }, { likedReviews });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, reviewId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

// 取消喜欢评论
const unlikeReview = async (ctx) => {
    const { userId, reviewId } = ctx.request.body;
    const user = await ArticleModel.findOne({ userId });
    const review = await ArticleModel.findOne({ reviewId });

    // 判断用户id和文章id是否有效
    if (user && review) {
        const { likedReviews } = user;
        if (!likedReviews.includes(reviewId)) {
            ctx.body = { status: 406, msg: '你还没有喜欢这篇文章' }
        } else {
            const result = await UserModel.updateOne({ userId }, {
                likedReviews: likedReviews.filter(i => i != reviewId)
            });
            if (result.modifiedCount) {
                ctx.body = { status: 200, msg: '成功' }
            } else {
                console.error({ userId, reviewId });
                ctx.body = { status: 500, msg: '内部错误' };
            }
        }
    } else {
        ctx.body = { status: 400, msg: '参数有误' }
    }
}

module.exports = {
    getReviewById,
    getReviewByArticle,
    postReview,
    likeReview,
    unlikeReview
};