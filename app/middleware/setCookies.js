
const cookies = require('../../config/cookies');
const UserModel = require('../models/UserModel');


const setCookies = async (ctx, next) => {
    console.log(111);
    const res = await UserModel.findOne({ userId: 1 })
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