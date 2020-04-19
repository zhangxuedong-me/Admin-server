const Koa = require('koa')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const json = require('koa-json')
const admin = require('./routes/admin.js')
const checkToken = require('./middleware/checkToken.js')
const compress = require('koa-compress')

const app = new Koa()

// gzip压缩配置到中间件
app.use(compress({

    filter: function (content_type) {

        return /text/i.test(content_type)
    },
    
    threshold: 10240,

    flush: require('zlib').Z_SYNC_FLUSH

}))


// 静态资源托管
app.use(require('koa-static')(__dirname + '/public'))

// 可以给前端响应json或者对象类型数据
app.use(json())

// post参数获取的中间件使用
app.use(bodyParser())

// 跨域的中间件的使用
app.use(cors())

// 验证token的中间件函数
app.use(checkToken)

// 后台管理系统的路由
router.use('/admin', admin.routes())


// 路由中间件的使用
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
    console.log('htttp://localhost:3000')
})