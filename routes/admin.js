const router = require('koa-router')()

// 子路由模块
const user = require('./admin/user.js')
const articles = require('./admin/articles.js')
const adminClass = require('./admin/admin_class')


router.use('/user', user.routes())
router.use('/articles', articles.routes())
router.use('/adminclass', adminClass.routes())

module.exports = router