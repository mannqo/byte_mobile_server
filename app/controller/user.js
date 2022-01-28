const ArticleModel = require('../models/ArticleModel');
const FollowerModel = require('../models/FollowerModel');
const UserModel = require('../models/UserModel');


// 根据userId查找用户基础信息（昵称+头像）
// 不需要权限
const getUserBaseInfo = async (ctx) => {
    const { userId } = ctx.query;
    const user = await UserModel.findOne({ userId });

    if (user) {
        const { nickname, avatar } = user;
        const userInfo = { nickname, avatar };
        ctx.body = { status: 200, msg: '查询成功', userInfo };
    } else {
        ctx.body = { status: 404, msg: '查找的用户不存在' };
    }
}

// 根据userId查找用户的完整信息（不包括敏感信息）
// 需要登录权限
const getUserFullInfo = async (ctx) => {
    const { userId } = ctx.query;
    const user = await UserModel.findOne({ userId });

    if (user) {
        const {
            nickname,
            avatar,
            likedArticles,
            staredArticles,
            likedReviews,
            follows,
            fans
        } = user;
        const userInfo = {
            nickname,
            avatar,
            likedArticles,
            staredArticles,
            likedReviews,
            follows,
            fans
        };
        ctx.body = { status: 200, msg: '查询成功', userInfo };
    } else {
        ctx.body = { status: 404, msg: '查找的用户不存在' };
    }
}

// 关注别人
const followUsers = async ctx => {
    let { userId, followerId } = ctx.request.body;
    if (userId === '' || followerId === '') {
        ctx.body = { status: 400, msg: '请求错误' };
        return;
    }

    const data = await FollowerModel.findOne({ userId, followerId });
    if (data) {
        ctx.body = { status: 406, msg: '你已经关注啦!' }
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
        ctx.body = userId && followerId ? { status: 200, msg: '关注成功' } : { status: 404, msg: '关注失败' }
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '未知错误' };
    }
}
// 取消关注
const cancelFollow = async ctx => {
    const { userId, followerId } = ctx.request.body;
    const data = await FollowerModel.findOne({ userId, followerId });
    if (!data) {
        ctx.body = { status: 406, msg: '你没有关注这个人!' }
        return;
    }
    try {
        const res = await FollowerModel.deleteOne({ userId, followerId });
        ctx.body = res.deletedCount ? { status: 200, msg: '取消关注成功' } : { status: 404, msg: '取消关注失败' };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '未知异常' };
    }
}


// 获取用户关注的人
const getFollowerList = async ctx => {
    const { userId } = ctx.query;
    try {
        const user = await UserModel.findOne({ userId });
        const { follows } = user;

        ctx.body = { status: 200, follows };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '未知错误，可能是找不到这个用户' };
    }

}
// 获取关注用户的人
const getFanList = async ctx => {
    const { userId } = ctx.query;
    try {
        const user = await UserModel.find({ userId });
        const { fans } = user;
        ctx.body = { status: 200, fans };
    } catch (err) {
        console.log(err);
        res.body = { status: 500, msg: '未知错误，可能是找不到这个用户' };
    }

}

module.exports = {
    getUserBaseInfo,
    getUserFullInfo,
    followUsers,
    cancelFollow,
    getFollowerList,
    getFanList,
};