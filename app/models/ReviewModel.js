const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    reviewId: {
        type: Number,
        required: true,
        unique: true,
    },
    replyToUserId: {
        type: Number,
        required: true,
    },
    replyToArticleId: {
        type: Number,
        required: true,
    },
    parentReviewId: {
        type: Number,
        default: '',
    },
    authorId: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    likes: {
        type: Number,
        default: 0,
    },
    likerList: {
        type: Array,
        default: [],
    },
    reviewList: {
        type: Array,
        default: [],
    },
    postDate: {
        type: String,
        default: new Date().toISOString(), // 2022-01-26T15:19:39.663Z
    },
})


module.exports = mongoose.model('review', ReviewSchema);