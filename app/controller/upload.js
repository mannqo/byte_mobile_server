const { rm } = require('fs/promises');
const path = require('path');

// 图片上传
const imageUpload = async ctx => {
    const { image } = ctx.request.files;
    const basename = path.basename(image.path);

    try {
        const url = 'http://localhost:8080/public/img/' + basename;
        ctx.body = { status: 200, msg: '成功', url };
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}

// 撤销图片上传
const revertImageUpload = async ctx => {
    const { fileName } = ctx.request.body;
    const baseDir = path.join(__dirname, '../public/img/');

    try {
        await rm(baseDir + fileName);
        ctx.body = { status: 200, msg: '成功' };
    } catch (err) {
        console.error(err);
        ctx.body = { status: 500, msg: '内部错误' };
    }
}


module.exports = {
    imageUpload,
    revertImageUpload
};