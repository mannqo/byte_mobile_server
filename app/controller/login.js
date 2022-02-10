const UserModel = require('../models/UserModel.js');
const mongoose = require('mongoose');


// 注册
const register = async (ctx) => {
    const { username, password } = ctx.request.body;
    const user = await UserModel.findOne({ username });

    if (user) ctx.body = { status: 400, msg: '该用户名已存在' };
    else {
        const users = await UserModel.find({});
        const userId = users.length > 0 ? users[users.length - 1].userId + 1 : 1;
        const newUser = new UserModel({
            userId,
            user,
            username,
            password,
            nickname: username,
        })

        try {
            await UserModel.create(newUser);
            ctx.body = { status: 200, msg: '注册成功, 请前往登录' }
        } catch (err) {
            console.log(err);
            ctx.body = { status: 500, msg: '内部错误' }
        }
    }

}

// 登录 每个操作都要检查一下cookies
// const cookies = require('../../config/cookies');
const login = async (ctx) => {
    const body = ctx.request.body;
    const { username, password } = body;
    try {
        const data = await UserModel.updateOne({ username, password }, { status: 0 });
        const { userId } = await UserModel.findOne({ username });

        if (data.modifiedCount) {
            ctx.body = { status: 200, msg: '登录成功', userId };
        } else if (!data.matchedCount) {
            ctx.body = { status: 400, msg: '账号或密码错误', userId };
        } else {
            ctx.body = { status: 406, msg: '你已经登录了', userId };
        }
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '内部错误' }
    }
}

// 退出登录
const logout = async (ctx) => {
    const { userId } = ctx.request.body;
    try {
        const data = await UserModel.updateOne({ userId }, { status: 1 });
        if (data.modifiedCount) {
            ctx.body = { status: 200, msg: '登出成功' };
        } else if (!data.matchedCount) {
            ctx.body = { status: 404, msg: '找不到该用户' };
        } else {
            ctx.body = { status: 406, msg: '你还未登录' };
        }
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '内部错误' }
    }
}

// 查看登录状态
const getLoginStatus = async (ctx) => {
    const { userId } = ctx.query;
    const result = await UserModel.findOne({ userId });
    if (result) {
        ctx.body = { status: 200, result: result.status, msg: '0表示登录, 1表示未登录' }
    } else {
        ctx.body = { status: 404, msg: '你还没注册呢' };
    }
}

// export { };


module.exports = {
    login,
    logout,
    register,
    getLoginStatus
};