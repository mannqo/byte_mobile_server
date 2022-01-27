const mongoose = require('mongoose');

const LikeAndStarSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        db: 'koa_mine'
    },
    articleId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('likeAndStar', LikeAndStarSchema);