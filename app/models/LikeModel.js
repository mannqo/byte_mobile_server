const mongoose = require('mongoose');

const LikeAndStarSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    articleId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('likeAndStar', LikeAndStarSchema);