
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel')


const sendMessage = async (ctx) => {

    const { userId, receiverId, message } = ctx.request.body;
    try {
        const messages = await MessageModel.find();
        const user = await UserModel.findOne({ userId }).select('chatList');
        const receiver = await UserModel.findOne({ userId: receiverId }).select('chatList');
        const chatList = user.chatList;  // 获取原来的聊天列表
        const receiver_chatList = receiver.chatList;

        !chatList.includes(receiver._id) && chatList.push(receiver._id);
        !receiver_chatList.includes(user._id) && receiver_chatList.push(user._id);

        await UserModel.updateOne({ userId }, { chatList });
        await UserModel.updateOne({ userId: receiverId }, { chatList: receiver_chatList })

        const messageId = messages.length + 1;
        const newMessage = new MessageModel({
            messageId,
            userId,
            receiverId,
            message
        })
        await MessageModel.create(newMessage);

        ctx.body = { status: 200, msg: "发送成功" };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: "未知异常" };
    }
}

const getChattingRecord = async (ctx) => {
    const { userId, receiverId } = ctx.request.query;
    try {
        const record = await MessageModel.find({ $or: [{ userId, receiverId }, { userId: receiverId, receiverId: userId }] });
        ctx.body = { status: 200, record };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '获取失败' }
    }
}

const getChatList = async (ctx) => {
    const { userId } = ctx.request.query;
    try {
        const user = await UserModel.findOne({ userId })
        const chats = user.chatList;
        const chatList = await UserModel.find({ _id: { $in: chats } }).select('userId nickname avatar description');
        ctx.body = { status: 200, chatList };
    } catch (err) {
        console.log(err);
        ctx.body = { status: 500, msg: '获取失败' };
    }
}

// export { }

module.exports = {
    sendMessage,
    getChattingRecord,
    getChatList
}
