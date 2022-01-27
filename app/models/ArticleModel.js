const mongoose = require('mongoose');


const ArticleSchema = mongoose.Schema({
    // 引用
    userId: {
        type: String,
        required: true,
        unique: true,
    },

    articleId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likeNum: {
        type: Number,
        default: 0
    },
    starNum: {
        type: Number,
        default: 0,
    },
    commentNum: {
        type: Number,
        default: 0,
    },
    date: {
        type: String,
        default: Date.now(),
    },
})

module.exports = mongoose.model("allArticle", ArticleSchema);