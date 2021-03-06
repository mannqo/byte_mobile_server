const mongoose = require('mongoose');

const ArticleSchema = mongoose.Schema({
    articleId: {
        type: Number,
        required: true,
        unique: true,
    },
    authorId: {
        type: Number,
        required: true,
    },
    images: {
        type: Array,
        default: [],
    },
    title: {
        type: String,
        default: '',
    },
    content: {
        type: String,
        default: '',
    },
    tags: {
        type: Array,
        default: [],
    },
    likes: {
        type: Number,
        default: 0
    },
    stars: {
        type: Number,
        default: 0
    },
    likerList: {
        type: Array,
        default: [],
    },
    starerList: {
        type: Array,
        default: [],
    },
    reviews: {
        type: Number,
        default: 0
    },
    reviewList: {
        type: Array,
        default: [],
    },
    postDate: {
        type: String,
        default: new Date().toISOString(), // 2022-01-26T15:19:39.663Z
    },
    available: {
        type: Boolean,
        default: true,
    },
})


module.exports = mongoose.model('article', ArticleSchema);