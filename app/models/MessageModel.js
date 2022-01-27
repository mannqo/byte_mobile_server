const mongoose = require('mongoose');
const { database } = require('../../config/config')

const MessageSchema = mongoose.Schema({
    messageId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String, 
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        default: new Date().toLocaleString() //2022/1/22 下午10:56:37 
    }

})

module.exports = mongoose.model("messageRecord", MessageSchema);
