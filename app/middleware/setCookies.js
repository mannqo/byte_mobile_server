
const cookies = require('../../config/cookies');
const UserModel = require('../models/UserModel');


const setCookies = async (ctx, next) => {
    const { username } = ctx.request.body
    const res = await UserModel.findOne({ username })
        .select(`nickname
                     avatar 
                     likedArticles
                     staredArticles
                     likedReviews
                     follows
                     fans`);
    ctx.cookies.set(
        'userInfo',
        new Buffer.from(JSON.stringify(res)).toString('base64'),
        cookies
    ); 
    next();
}

module.exports = setCookies;