const ArticleModel = require('../models/ArticleModel');
const FollowerModel = require('../models/FollowerModel');
const LikeModel = require('../models/LikeModel');
const UserModel = require('../models/UserModel');



// 点赞/收藏
const likeOrStar = async ctx => {
    const { userId, articleId, type } = ctx.request.body;
    const data = await LikeModel.findOne({ userId, articleId, type });
    if (data) {
        ctx.body = { msg: `你已经${type}过了` }
        return;
    }
    const newLike = new LikeModel({
        userId,
        articleId,
        type
    })
    try {
        await LikeModel.create(newLike);
        ctx.body = { msg: `${type}成功` }
    } catch (err) {
        ctx.body = { msg: '请求失败' };
    }

}
// 取消点赞/收藏
const cancelLikeOrStar = async ctx => {
    const { userId, articleId, type } = ctx.request.body;
    const data = await LikeModel.findOne({ userId, articleId, type });
    if (!data) {
        ctx.body = { msg: '找不到这篇文章' };
        return;
    }
    try {
        await LikeModel.deleteOne({ userId, articleId, type });
        ctx.body = { msg: `取消${type}成功` };
    } catch (err) {
        ctx.body = { msg: '未知异常' };
    }

}
const likeStarMiddle = async (ctx, next) => {
    const { articleId, type } = ctx.request.body;
    const articleObj = await ArticleModel.findOne({ articleId });
    if (type !== 'like' && type !== 'star') {
        ctx.body = { msg: '请求错误' };
        return;
    }
    if (!articleObj) {
        ctx.body = { msg: '找不到这篇文章' };
        return;
    }
    await next();
    const likeList = await LikeModel.find({ articleId, type });
    const likeNum = likeList.length;
    if (type === 'like') {
        await ArticleModel.updateOne({ articleId, type }, { likeNum })
    } else {
        await ArticleModel.updateOne({ articleId, type }, { starNum: likeNum });
    }
} 


// 获取用户个人信息
const getUserInfo = async ctx => {
    const { userId } = ctx.query;
    let personInfo = await UserModel.findOne({ userId });
    personInfo.password = undefined;
    ctx.body = personInfo;
}

// 关注别人
const followUsers = async ctx => {
    let { userId, followerId } = ctx.request.body;
    if (userId === '' || followerId === '') {
        ctx.body = { msg: '请求错误' };
        return;
    }

    const data = await FollowerModel.findOne({ userId, followerId });
    if (data) {
        ctx.body = { msg: '你已经关注啦!' }
        return;
    }

    const newFollower = new FollowerModel({
        userId,
        followerId,
    })
    try {
        await FollowerModel.create(newFollower);
        userId = await UserModel.findOne({ userId });
        followerId = await UserModel.findOne({ followerId });
        ctx.body = userId && followerId ? { msg: '关注成功' } : { msg: '关注失败' }
    } catch (err) {
        ctx.body = { msg: '未知错误' };
    }
}
// 取消关注
const cancelFollow = async ctx => {
    const { userId, followerId } = ctx.request.body;
    const data = await FollowerModel.findOne({ userId, followerId });
    if (!data) {
        ctx.body = { msg: '你没有关注这个人!' }
        return;
    }
    try {
        const res = await FollowerModel.deleteOne({ userId, followerId });
        ctx.body = res.deletedCount ? { msg: '取消关注成功' } : { msg: '取消关注失败' };
    } catch (err) {
        ctx.body = { msg: '未知异常' };
    }
}


// 获取用户关注的人
const getFollowerList = async ctx => {
    const { userId } = ctx.query;
    let res = [];
    try {
        const followerList = await FollowerModel.find({ userId });
        for (let i = 0; i < followerList.length; i++) {
            const follower = await UserModel.findOne({ userId: followerList[i].followerId });
            console.log(follower);
            res = [...res, follower];
        }
        ctx.body = res;
    } catch (err) {
        ctx.body = { msg: '未知错误，可能是找不到这个用户' };
    }

}
// 获取关注用户的人
const getFanList = async ctx => {
    const { userId } = ctx.query;
    let res = [];
    try {
        const fanList = await FollowerModel.find({ followerId: userId });
        for (let i = 0; i < fanList.length; i++) {
            const fan = await UserModel.findOne({ userId: fanList[i].userId });
            res = [fan, ...res];
        }
        ctx.body = res;
    } catch (err) {
        res.body = { msg: '未知错误，可能是找不到这个用户' };
    }

}

module.exports = {
    likeOrStar,
    cancelLikeOrStar,
    getUserInfo,
    followUsers,
    cancelFollow,
    getFollowerList,
    getFanList,
    likeStarMiddle,
};