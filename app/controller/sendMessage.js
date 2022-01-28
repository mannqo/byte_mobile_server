
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel')


const sendMessage = async (ctx) => {
    const { userId, receiverId, message } = ctx.request.body;
    try {
        const messages = await MessageModel.find();
        const user = await UserModel.findOne({ userId });
        const receiver = await UserModel.findOne({ userId: receiverId });
        const charList = user.charList;  // 获取原来的聊天列表
        const receiver_charList = receiver.charList;
        let check = 0, receiver_check = 0;  // 假设不在 

        charList && charList.forEach((obj) => {
            console.log(obj.userId === receiverId);
            if (obj && obj.userId === receiverId) check = 1;
        });
        receiver_charList && receiver_charList.forEach((obj) => {
            if (obj && obj.userId === userId) receiver_check = 1;
        });
        const newCharList = [...charList, receiver];
        const newReceiverList = [...receiver_charList, user];
        console.log(check);
        if (!check) await UserModel.updateOne({ userId }, { charList: newCharList });
        if (!receiver_check) await UserModel.updateOne({ userId: receiverId }, { charList: newReceiverList })

        const messageId = messages.length + 1;
        const newMessage = new MessageModel({
            messageId,
            userId,
            receiverId,
            message
        })
        await MessageModel.create(newMessage);

        ctx.body = ('{ status: 0, msg: "发送成功" }');
    } catch (err) {
        console.log(err);
        ctx.body = ('{ status: 1, msg: "未知异常" }');
    }
}

const getChattingRecord = async (ctx) => {
    const { userId, receiverId } = ctx.request.query; 
    try {
        const record = await MessageModel.find({ $or: [{ userId, receiverId }, { userId: receiverId, receiverId: userId }] });
        ctx.body = record;
    } catch (err) {
        console.log(err);
        ctx.body = ('{ status: 1, msg: "未知异常" }')
    }
}

const getChatList = async (ctx) => {
    const { userId } = ctx.request.query;
    try {
        const user = await UserModel.findOne({ userId: Number(userId) });
        const charList = user.charList;
        ctx.body = (JSON.stringify(charList));
    } catch (err) {
        ctx.body = ("{ msg: '获取失败' }");
    }
}

// export { }

module.exports = {
    sendMessage,
    getChattingRecord,
    getChatList
}
