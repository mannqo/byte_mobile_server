const ArticleModel = require("../models/ArticleModel");
const UserModel = require("../models/UserModel");

// 根据关键字搜索文章
const searchByArticle = async (ctx) => {
    const { keyWord } = ctx.query;
    try {
        const articles = await ArticleModel.find({
            $and: [
                {
                    $or: [
                        { title: { $regex: `.*${keyWord}.*`, "$options": "i" } },
                        { content: { $regex: `.*${keyWord}.*`, "$options": "i" } },
                        { tags: { $all: keyWord } }
                    ]
                },
                { available: true }
            ]
        })

        ctx.body = { status: 200, msg: '成功', articles };
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 根据关键字搜索用户
const searchByUser = async (ctx) => {
    const { keyWord } = ctx.query;
    try {
        const numberKeyWord = Number(keyWord);
        let users = [];
        if (!isNaN(numberKeyWord)) {
            users = await UserModel.find({
                $or: [
                    { nickname: { $regex: `.*${keyWord}.*`, "$options": "i" } },
                    { userId: Number(keyWord) }
                ]
            }).select(`
                userId
                nickname
                avatar
                description`);
        } else {
            users = await UserModel.find({
                nickname: { $regex: `.*${keyWord}.*`, "$options": "i" }
            }).select(`
                userId
                nickname
                avatar
                description`);
        }

        ctx.body = { status: 200, msg: '成功', users };
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

module.exports = {
    searchByArticle,
    searchByUser
};