const cookies = {
    domain: 'localhost',
    path: '/login',
    maxAge: 7 * 60 * 60 * 1000, // 一周
    expires: new Date('2022-10-10'),
    httpOnly: true,
    overwrite: false
}

module.exports = cookies;