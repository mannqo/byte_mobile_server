const UserModel = require('../models/UserModel');



// 根据userId查找用户基础信息（昵称+头像）
// 不需要权限
const getUserBaseInfo = async (ctx) => { 
    const { userId } = ctx.query;
    try {
        if (isNaN(Number(userId))) {
            ctx.body = { status: 400, msg: '参数错误' };
            return;
        }
        const user = await UserModel.findOne({ userId }).
            select(`
            userId
            nickname
            avatar 
            description
            gender
            birthday
            area 
            backGroundPicture
            `);

        if (user) {
            ctx.body = { status: 200, msg: '查询成功', user };
        } else {
            ctx.body = { status: 404, msg: '查找的用户不存在' };
        }
    } catch (err) {
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 根据userId查找用户的完整信息（不包括敏感信息）
// 需要登录权限
const getUserFullInfo = async (ctx) => {
    const { userId } = ctx.query;
    try {
        if (isNaN(Number(userId))) {
            ctx.body = { status: 400, msg: '参数错误' };
            return;
        }
        const user = await UserModel.findOne({ userId })
            .select(`
                userId
                nickname
                avatar 
                likedArticles
                staredArticles
                likedReviews
                follows
                fans`);

        if (user) {
            ctx.body = { status: 200, msg: '查询成功', user };
        } else {
            ctx.body = { status: 404, msg: '查找的用户不存在' };
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 关注别人
const followUser = async (ctx) => {
    const { userId, followerId } = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        const follower = await UserModel.findOne({ userId: followerId });
        if (!user || !follower) {
            ctx.body = { status: 400, msg: '参数错误' }
            return;
        }
        if (userId === followerId) {
            ctx.body = { status: 406, msg: '人不能太自恋' }
            return;
        }

        if (user.follows.includes(follower.userId)) {
            ctx.body = { status: 406, msg: '你已经关注过了' }
        } else {
            user.follows.push(follower.userId);
            follower.fans.push(user.userId);
            const userResult = await UserModel.updateOne({ userId }, { follows: user.follows });
            const followerResult = await UserModel.updateOne({ userId: followerId }, { fans: follower.fans });
            const success = userResult.modifiedCount && followerResult.modifiedCount;

            if (success) {
                ctx.body = { status: 200, msg: '关注成功' }
            } else {
                ctx.body = { status: 500, msg: '内部错误' }
            }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }


}

// 取消关注
const cancelFollow = async ctx => {
    try {
        const { userId, followerId } = ctx.request.body;
        const user = await UserModel.findOne({ userId });
        const follower = await UserModel.findOne({ userId: followerId });

        if (!user || !follower || userId === followerId) {
            ctx.body = { status: 400, msg: '参数错误' }
            return;
        }

        if (!user.follows.includes(follower.userId)) {
            ctx.body = { status: 406, msg: '你还没有关注过呢' }
        } else {
            const userResult = await UserModel.updateOne({ userId }, {
                follows: user.follows.filter(i => i !== follower.userId)
            });
            const followerResult = await UserModel.updateOne({ userId: followerId }, {
                fans: follower.fans.filter(i => i !== user.userId)
            });
            const success = userResult.modifiedCount && followerResult.modifiedCount;

            if (success) {
                ctx.body = { status: 200, msg: '取消关注成功' }
            } else {
                ctx.body = { status: 500, msg: '内部错误' }
            }
        }
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }

}


// 获取用户关注的人
const getFollowerList = async ctx => {
    const { userId } = ctx.query;
    try {
        const user = await UserModel.findOne({ userId }).select('follows');
        const { follows } = user;
        const followsList = await UserModel.find({ userId: { $in: follows } }).select('userId nickname avatar')
        ctx.body = { status: 200, followsList };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '未知错误，可能是找不到这个用户' };
    }
}
// 获取关注用户的人
const getFanList = async ctx => {
    const { userId } = ctx.query;
    try {
        const user = await UserModel.findOne({ userId });
        const { fans } = user;
        const fansList = await UserModel.find({ userId: { $in: fans } }).select('userId nickname avatar')

        ctx.body = { status: 200, fansList };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '未知错误，可能是找不到这个用户' };
    }
}


// 修改个人资料
const path = require('path');
const edit = async ctx => {
    const { userId } = ctx.request.body;
    const editMes = ctx.request.body;
    try {
        const user = await UserModel.findOne({ userId });
        if (!user) {
            ctx.body = { status: 400, msg: '参数错误' };
            return;
        }
        const editResult = await UserModel.updateOne({ userId }, editMes);
        if (editResult.modifiedCount) ctx.body = { status: 200, msg: '修改成功' }
        else ctx.body = { status: 400, msg: '修改失败' };
    } catch (error) {
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

const upload = async ctx => {
    const { userId } = ctx.request.body;
    const { avatar, backGroundPicture } = ctx.request.files;
    const basename = avatar ? path.basename(avatar.path) : path.basename(backGroundPicture.path);

    try {
        const user = await UserModel.findOne({ userId });
        if (!user && !avatar && !backGroundPicture) {
            ctx.body = { status: 400, msg: '参数错误' };
            return;
        }
        if (avatar) {
            const avatarUrl = `http://localhost:8080/public/img/${basename}`;
            const editResult = await UserModel.updateOne({ userId }, { avatar: avatarUrl });
            if (editResult.modifiedCount) ctx.body = { 'status': 200, avatar: avatarUrl, msg: '上传成功' }
        } else if (backGroundPicture) {
            const backGroundPictureUrl = `http://localhost:8080/public/img/${basename}`;
            const editResult = await UserModel.updateOne({ userId }, { backGroundPicture: backGroundPictureUrl });
            if (editResult.modifiedCount) ctx.body = { status: 200, backGroundPicture: backGroundPictureUrl, msg: '上传成功' }
            else ctx.body = { status: 400, msg: "上传失败" }
        }
    } catch (error) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}



module.exports = {
    getUserBaseInfo,
    getUserFullInfo,
    followUser,
    cancelFollow,
    getFollowerList,
    getFanList,
    edit,
    upload
};
