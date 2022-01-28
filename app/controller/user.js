const ArticleModel = require('../models/ArticleModel');
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
const followUser = async (ctx) => {
    let { userId, followerId } = ctx.request.body;
    const user = await UserModel.findOne({ userId });
    const follower = await UserModel.findOne({ userId: followerId });

    if (!user || !follower) {
        ctx.body = { status: 400, msg: '参数错误' }
        return;
    }

    if (user.follows.includes(followerId)) {
        ctx.body = { status: 406, msg: '你已经关注过了' }
    } else {
        user.follows.push(followerId);
        follower.fans.push(userId);
        const userResult = await UserModel.updateOne({ userId }, { follows: user.follows });
        const followerResult = await UserModel.updateOne({ userId: followerId }, { fans: follower.fans });
        const success = userResult.modifiedCount && followerResult.modifiedCount;

        if (success) {
            ctx.body = { status: 200, msg: '关注成功' }
        } else {
            ctx.body = { status: 500, msg: '内部错误' }
        }
    }
}

// 取消关注
const cancelFollow = async ctx => {
    let { userId, followerId } = ctx.request.body;
    const user = await UserModel.findOne({ userId });
    const follower = await UserModel.findOne({ userId: followerId });

    if (!user || !follower) {
        ctx.body = { status: 400, msg: '参数错误' }
        return;
    }

    if (!user.follows.includes(followerId)) {
        ctx.body = { status: 406, msg: '你还没有关注过呢' }
    } else {
        const userResult = await UserModel.updateOne({ userId }, {
            follows: user.follows.filter(i => i != followerId)
        });
        const followerResult = await UserModel.updateOne({ userId: followerId }, {
            fans: follower.fans.filter(i => i != userId)
        });
        const success = userResult.modifiedCount && followerResult.modifiedCount;

        if (success) {
            ctx.body = { status: 200, msg: '取消关注成功' }
        } else {
            ctx.body = { status: 500, msg: '内部错误' }
        }
    }
}


// 获取用户关注的人
const getFollowerList = async ctx => {

}
// 获取关注用户的人
const getFanList = async ctx => {

}

module.exports = {
    getUserBaseInfo,
    getUserFullInfo,
    followUser,
    cancelFollow,
    getFollowerList,
    getFanList,
};