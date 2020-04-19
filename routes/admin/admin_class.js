const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

// 删除分类的接口
router.delete('/delete_class', ctx => {

    const { detailId, name } = ctx.query

    const classFilePath = path.join(__dirname, '../../admin_data/article_classification.json')

    const articleFilePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let classFile = JSON.parse(fs.readFileSync(classFilePath, 'utf8'))

    let articleFile = JSON.parse(fs.readFileSync(articleFilePath, 'utf8'))

    classFile.forEach((item, index) => {
        
        if (item.detailId == detailId) {

            classFile.splice(index, 1)
        }
    })
    

    for (let i = 0;i < articleFile.length;i++) {

        if (articleFile[i].selectVal === name) {
           
            articleFile.splice(i, 1)
            i = i - 1
        }
    }

    fs.writeFileSync(classFilePath, JSON.stringify(classFile), "utf8")

    fs.writeFileSync(articleFilePath, JSON.stringify(articleFile), "utf8")

    ctx.body = { code: 200, message: '删除成功' }
})

// 获取要修改的分类
router.get('/get_edit', ctx => {

    const { id, detailId } = ctx.query
    
    const classFilePath = path.join(__dirname, '../../admin_data/article_classification.json')

    let classFile = JSON.parse(fs.readFileSync(classFilePath, 'utf8'))

    let classData = classFile.find(item => {

        return item.id == id && item.detailId == detailId
    })

    ctx.body = { code: 200, message: '获取成功', data: classData }
})

// 保存之后改变数据
router.post('/keep_class', ctx => {

    const { detailId, id } = ctx.request.body

    const classFilePath = path.join(__dirname, '../../admin_data/article_classification.json')

    let classFile = JSON.parse(fs.readFileSync(classFilePath, 'utf8'))

    classFile.forEach((item, index) => {

        if (item.id == id) {

            if (item.detailId == detailId) {

                classFile[index] = ctx.request.body

                fs.writeFileSync(classFilePath, JSON.stringify(classFile), "utf8")

                ctx.body = { code: 200, message: '保存成功' }

                return
            }
        }
    })
})

// 禁用或者恢复分类
router.post('/prohibit_class', ctx => {

    const { id, detailId } = ctx.request.body

    const classFilePath = path.join(__dirname, '../../admin_data/article_classification.json')

    let classFile = JSON.parse(fs.readFileSync(classFilePath, 'utf8'))

    classFile.forEach(item => {

        if (item.id == id) {

            if (item.detailId == detailId) {

                item.isProhibit = !item.isProhibit

                fs.writeFileSync(classFilePath, JSON.stringify(classFile), "utf8")

                ctx.body = { code: 200, message: '操作分类成功' }

                return
            }
        }
    })
})






module.exports = router