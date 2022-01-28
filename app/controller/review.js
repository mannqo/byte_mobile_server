const ArticleModel = require('../models/ArticleModel.js');
const ReviewModel = require('../models/ReviewModel.js');
const UserModel = require('../models/UserModel.js');


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

    if (reviews.length > 0) {
        ctx.body = { status: 200, msg: '成功', reviews };
    } else {
        ctx.body = { status: 404, msg: '找不到任何结果' };
    }
}

// 发布评论
const postReview = async (ctx) => {
    const { replyToUserId, replyToArticleId, parentReviewId, authorId, content } = ctx.request.body;
    const reviews = await ReviewModel.find({});
    const reviewId = reviews[reviews.length - 1].reviewId + 1;
    const newReview = new ReviewModel({
        reviewId,
        replyToUserId,
        replyToArticleId,
        parentReviewId,
        authorId,
        content,
    })

    try {
        // 对应文章的评论数+1
        const article = await ArticleModel.findOne({ articleId: replyToArticleId });
        await ArticleModel.updateOne({ articleId: replyToArticleId }, { reviews: article.reviews + 1 });

        if (parentReviewId) {
            // 如果有父评论，则把当前评论id添加到其父评论的reviews数组中
            const { reviewList } = await ReviewModel.findOne({ reviewId: parentReviewId });
            reviewList.push(reviewId);
            await ReviewModel.updateOne({ reviewId: parentReviewId }, { reviewList });
        } else {
            // 否则把评论id添加到对应文章的评论列表中
            const { reviewList } = article;
            reviewList.push(reviewId);
            await ArticleModel.updateOne({ articleId: replyToArticleId }, { reviewList });
        }
        await ReviewModel.create(newReview);
        ctx.body = { status: 200, msg: '发布成功' }
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '发布失败' }
    }
}

const deleteReview = async (ctx) => {
    const { reviewId } = ctx.request.body;
    const review = await ReviewModel.findOne({ reviewId });

    if (review) {
        // 递归删除
        review.reviewList.forEach(async (reviewId) => {
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
        // 删除review
        const result = await ReviewModel.remove({ reviewId });
        if (result.modifiedCount) {
            ctx.body = { status: 200, msg: '删除评论成功' };
        } else {
            console.error({ reviewId, result });
            ctx.body = { status: 500, msg: '内部错误' };
        }
    } else {
        ctx.body = { status: 404, msg: '找不到该评论' };
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
    deleteReview,
    likeReview,
    unlikeReview
};