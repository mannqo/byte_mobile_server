const UserModel = require('../model/UserModel.js');


// 根据userId查找用户基础信息（昵称+头像）
// 不需要权限
const getUserBaseInfo = async (ctx) => {
    const { userId } = ctx.query;
    console.log(userId);
    const user = await UserModel.findOne({ userId });

    if (user) {
        const userInfo = { nickname, avatar } = user;
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
        const userInfo = {
            nickname,
            avatar,
            likedArticles,
            staredArticles,
            likedReviews,
            follows,
            fans
        } = user;
        ctx.body = { status: 200, msg: '查询成功', userInfo };
    } else {
        ctx.body = { status: 404, msg: '查找的用户不存在' };
    }
}

module.exports = {
    getUserBaseInfo,
    getUserFullInfo
};