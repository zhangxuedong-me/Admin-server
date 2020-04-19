const jwt = require('jsonwebtoken')

async function check(ctx, next) {

    let url = ctx.url.split('?')[0]

    const httpUrl = [
        '/admin/user/login',
        '/admin/user/register',
        '/admin/user/user_img',
        '/admin/user/login_img'
    ]
    
    // 如果是登陆页面和注册页面就不需要验证token了
    if (httpUrl.includes(url)) {
        await next()
    } else {

        // 否则获取到token
        let token = ctx.request.headers["authorization"]

        if (token) {

            // 如果有token的话就开始解析
            const tokenItem = jwt.verify(token, 'token')
            // 将token的创建的时间和过期时间结构出来
            const { time, timeout } = tokenItem
            // 拿到当前的时间
            let data = new Date().getTime();

            // 判断一下如果当前时间减去token创建时间小于或者等于token过期时间，说明还没有过期，否则过期

            if (data - time <= timeout) {

                // token没有过期
                await next()
            } else {

                const { username, password, id } = ctx.query

                // 如果过期的话，返回新的token让前端刷新
                const refreshToken = jwt.sign({
                    // token的创建日期
                    time: Date.now(),
                    // token的过期时间
                    timeout: 7200000,
                    username: username,
                    password: password,
                    id: id
                }, 'token')

                ctx.response.status = 401
                ctx.body = { token: refreshToken }
            }
            
        } else {

            if (url !== '/admin/user/user_auth') {

                ctx.response.status = 401
                
            }
            
            next()

        }
    }
}



module.exports = check