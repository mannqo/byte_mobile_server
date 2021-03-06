const ArticleModel = require('../models/ArticleModel.js');
const ReviewModel = require('../models/ReviewModel.js');
const UserModel = require('../models/UserModel.js');


// 通过评论ID查找评论
const getReviewById = async (ctx) => {
    const { reviewId } = ctx.query;
    try {
        const review = await ReviewModel.findOne({ reviewId });

        if (review) {
            ctx.body = { status: 200, msg: '成功', review };
        } else {
            ctx.body = { status: 404, msg: '找不到该评论' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 通过文章ID查找评论（分页）
const getReviewByArticle = async (ctx) => {
    let { articleId, pages } = ctx.query;

    try {
        pages = Number(pages);
        if (isNaN(pages) || pages < 0) {
            ctx.body = { status: 400, msg: '参数有误' };
            return;
        }

        const article = await ArticleModel.findOne({ articleId });
        if (!article) {
            ctx.body = { status: 404, msg: '不存在这篇文章' };
            return;
        }
        if (!article.available) {
            ctx.body = { status: 406, msg: '文章已被删除' };
            return;
        }

        const { reviewList } = article;
        const reviews = await ReviewModel.find({ _id: { $in: reviewList } }).sort({ 'likes': -1, '_id': -1 }).skip(pages * 10).limit(10);
        for (const review of reviews) {
            review.reviewList = await ReviewModel.find({ _id: { $in: review.reviewList } });
        }

        ctx.body = { status: 200, msg: '成功', reviews };
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 发布评论
const postReview = async (ctx) => {
    const { replyToUserId, replyToArticleId, parentReviewId, authorId, content } = ctx.request.body;
    try {
        const reviews = await ReviewModel.find({});
        const reviewId = reviews.length > 0 ? reviews[reviews.length - 1].reviewId + 1 : 1;
        const newReview = new ReviewModel({
            reviewId,
            replyToUserId,
            replyToArticleId,
            parentReviewId,
            authorId,
            content,
            postDate: new Date().toISOString(),
        })

        try {
            // 对应文章的评论数+1
            const article = await ArticleModel.findOne({ articleId: replyToArticleId });
            await ArticleModel.updateOne({ articleId: replyToArticleId }, { reviews: article.reviews + 1 });

            if (parentReviewId) {
                // 如果有父评论，则把当前评论id添加到其父评论的reviews数组中
                const { reviewList } = await ReviewModel.findOne({ reviewId: parentReviewId });
                reviewList.push(newReview._id);
                await ReviewModel.updateOne({ reviewId: parentReviewId }, { reviewList });
            } else {
                // 否则把评论id添加到对应文章的评论列表中
                const { reviewList } = article;
                reviewList.push(newReview._id);
                await ArticleModel.updateOne({ articleId: replyToArticleId }, { reviewList });
            }
            await ReviewModel.create(newReview);
            ctx.body = { status: 200, msg: '发布成功' }
        } catch (err) {
            console.log(err);
            ctx.body = { status: 500, msg: '发布失败' }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 根据id删除评论
const deleteReview = async (ctx) => {
    const { reviewId } = ctx.request.body;
    try {
        const review = await ReviewModel.findOne({ reviewId });

        if (review) {
            // 递归删除
            review.reviewList.forEach(async (_id) => {
                const { reviewId } = await ReviewModel.findOne({ _id });
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
            const result = await ReviewModel.deleteOne({ reviewId });

            if (result.deletedCount) {
                // 对应文章的评论数-1，reviewList移除
                const article = await ArticleModel.findOne({ articleId: review.replyToArticleId });
                await ArticleModel.updateOne({ articleId: review.replyToArticleId }, {
                    reviews: article.reviews - 1,
                    reviewList: article.reviewList.filter(i => i.toString() !== review._id.toString())
                });
                ctx.body = { status: 200, msg: '删除评论成功' };
            } else {
                console.error({ reviewId, result });
                ctx.body = { status: 406, msg: '似乎是重复请求' };
            }
        } else {
            ctx.body = { status: 404, msg: '找不到该评论' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 喜欢评论
const likeReview = async (ctx) => {
    const { userId, reviewId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const review = await ReviewModel.findOne({ reviewId });

        // 判断用户id和评论id是否有效
        if (user && review) {
            const { likedReviews } = user;
            if (likedReviews.includes(review._id)) {
                ctx.body = { status: 406, msg: '你已经喜欢过了' }
            } else {
                likedReviews.push(review._id);
                review.likerList.push(userId);
                const userResult = await UserModel.updateOne({ userId }, { likedReviews });
                const reviewResult = await ReviewModel.updateOne({ reviewId }, { likes: review.likes + 1, likerList: review.likerList });
                const success = userResult.modifiedCount && reviewResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, reviewId });
                    ctx.body = { status: 406, msg: '似乎是重复请求' };
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

// 取消喜欢评论
const unlikeReview = async (ctx) => {
    const { userId, reviewId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const review = await ReviewModel.findOne({ reviewId });

        // 判断用户id和文章id是否有效
        if (user && review) {
            const { likedReviews } = user;
            if (!likedReviews.includes(review._id)) {
                ctx.body = { status: 406, msg: '你还没有喜欢这个评论' }
            } else {
                const userResult = await UserModel.updateOne({ userId }, {
                    likedReviews: likedReviews.filter(i => i.toString() !== review._id.toString())
                });
                const likerList = review.likerList.filter(i => i !== userId);
                const reviewResult = await ReviewModel.updateOne({ reviewId }, { likes: review.likes - 1, likerList });
                const success = userResult.modifiedCount && reviewResult.modifiedCount;

                if (success) {
                    ctx.body = { status: 200, msg: '成功' }
                } else {
                    console.error({ userId, reviewId });
                    ctx.body = { status: 406, msg: '似乎是重复请求' };
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
const getLikedReviews = async (ctx) => {
    const { userId } = ctx.query;
    try {
        const res = await UserModel.findOne({ userId }).select('likedReviews');
        const { likedReviews } = res;
        const reviews = await ReviewModel.find({ _id: { $in: likedReviews } });
        ctx.body = { status: 200, msg: '成功', likedReviews: reviews };
    } catch (err) {
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

module.exports = {
    getReviewById,
    getReviewByArticle,
    postReview,
    deleteReview,
    likeReview,
    unlikeReview,
    getLikedReviews,
};