const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: 'https://s3.bmp.ovh/imgs/2022/01/e0eba06fda436f82.jpg'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: Number, // 0登录， 1未登录
        default: 1
    },
    chatList: {
        type: Array,
        default: []
    },
    likedArticles: {
        type: Array,
        default: []
    },
    staredArticles: {
        type: Array,
        default: []
    },
    likedReviews: {
        type: Array,
        default: []
    },
    follows: {
        type: Array,
        default: []
    },
    fans: {
        type: Array,
        default: []
    },
    gender: {
        type: String,
        default: '1',
    },
    birthday: {
        type: String,
        default: ''
    },
    area: {
        type: String,
        default: ''
    }, 
    backGroundPicture: {
        type: String,
        default: ''
    }
})

// export { }

module.exports = mongoose.model('user', UsersSchema);