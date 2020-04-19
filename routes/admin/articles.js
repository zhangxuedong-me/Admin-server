const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

// 新建文章分类的接口
router.post('/article_classification', async ctx => {

    // 拿到用户的分类信息进行存储
    const { name, describe, id, username } = ctx.request.body

    const filePath = path.join(__dirname, '../../admin_data/article_classification.json')

    let fileItem = fs.readFileSync(filePath, 'utf8')

    let date = new Date()

    let year = date.getFullYear()

    let month = date.getMonth() + 1

    let day = date.getDate()

    const classificationData = {
        id,
        name,
        describe,
        dateTime: `${year}-${month}-${day}`,
        username,
        detailId: Date.now(),
        isProhibit: true
    }

    console.log(ctx.request.body)

    if (!fileItem) {

        fs.writeFileSync(filePath, JSON.stringify([classificationData], 'utf8'))
    } else {
        
        fileItem = JSON.parse(fileItem)
        
        const classificationItem = fileItem.find(item => {
            console.log(item.id)
            return item.name === classificationData.name && item.id === id
        })

        if (classificationItem) {
            ctx.body = { code: 401, message: '亲，不能有重复的分类名字哦!' }
            return
        }

        fileItem.push(classificationData)

        fs.writeFileSync(filePath, JSON.stringify(fileItem, 'utf8'))
    }

    ctx.body = { code: 200, message: '恭喜您，创建成功，快去使用吧!' }
})

// 获取分类数据接口
router.get('/get_classification', async ctx => {

    const filePath = path.join(__dirname, '../../admin_data/article_classification.json')

    const { id, currentPage, pageSize } = ctx.query

    if (fs.readFileSync(filePath, 'utf8')) {

        let fileItem = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        let selectData = []

        fileItem.forEach(item => {

            if (item.id == id) {

                selectData.push(item)
            }
        })

        if (currentPage && pageSize) {

            // 总页数

            let total = Math.ceil(fileItem.length / pageSize)

            console.log(total, currentPage)

            let pageArrData = []

            if (currentPage > total) {

                ctx.body = { code: 400, message: '暂无分类数据'}
                return

            } else {

                let i = currentPage * pageSize - pageSize
                
                for (i; i < fileItem.length;i++) {
                    
                    if (fileItem[i].id != id) continue

                    if (i < currentPage * pageSize) {
        
                        pageArrData.push(fileItem[i])
                    }
                }

                ctx.body = { code: 200, message: '获取成功',total: fileItem.length,  data: pageArrData }

                return
            }

        }

        ctx.body = { code: 200, message: '获取成功', data: selectData }
    } else {

        ctx.body = { code: 404, message: '暂无分类数据'}
    }
    
})

// 发表文章的接口
router.post('/publish_articles', async ctx => {

    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let fileItem = fs.readFileSync(filePath, 'utf8')

    ctx.request.body.detailId = Date.now()

    if (fileItem === "") {
        
        fs.writeFileSync(filePath, JSON.stringify([ctx.request.body]), "utf8")
    } else {

        fileItem = JSON.parse(fileItem)
        fileItem.push(ctx.request.body)
        fs.writeFileSync(filePath, JSON.stringify(fileItem), "utf8")
    }

    if (ctx.request.body.status == 0) {

        ctx.body = { code: 200, message: '发表文章成功' }

    } else {

        ctx.body = { code: 200, message: '成功存储为草稿' }
    }
    
})


// 获取文章的接口
router.get('/get_articles', async ctx => {

    let { status, count, page,  selectVal, article_keyword, id } = ctx.query

    // 拿到前端的搜索文章时间数据
    let time = ctx.query['publish_time[]']

    // 搜索文章的开始时间
    let dateStart = null

    // 搜索文章的结束时间
    let dateEnd = null

    // 转成毫秒值
    if (time !== undefined) {

        dateStart = new Date(time[0]).getTime()

        dateEnd = new Date(time[1]).getTime()
    }

    // 文章数据文件的路径
    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    // 读取文章文件的数据
    let fileItem = fs.readFileSync(filePath, "utf8")

    // 验证时间的封装
    function cheackTime(dateEnd, dateStart, articleTime, articleArr, item) {

        // 通过毫秒数来判断出相应时间段的文章数据

        if (dateEnd && dateStart) {
            
            if (!(articleTime <= dateEnd) || !(dateStart > articleTime)) {

                if (articleTime) {

                    articleArr.push(item)
                }
            }

        } else {

            if (status === 0) {

                articleArr = JSON.parse(fileItem)

            } else {

                articleArr.push(item)
            }

        }
    }

    if (fileItem === "") {

        ctx.body = { code: 200, message: "暂时没有文章，去发表一份吧" }

    } else {

        // 如果有文章数据的话，转成json对象
        fileItem = JSON.parse(fileItem)

        // 筛选符合要求的数据添加到该数组中
        let articleArr = []

        // 搜索项符合结果的数量
        let selectIndex = 0

        // 搜索项的总数量
        let total = 0

        // 不参与验证的属性项
        let exclude = ['id', 'status', 'publish_time[]', 'count', 'page']


        fileItem.forEach(item => {

            // 当前筛选文章的时间
            let articleTime = new Date(item['publish_time']).getTime()

            // 判断一下只有用户id和文章id匹配就，才去筛选，否则就是空没有数据
            if (item.id != id) return
            
            // 遍历请求验证的搜索项
            for (let key in ctx.query) {

                // 需要跳过验证的搜索项
                if (exclude.includes(key)) continue

                // 如果搜索项为空的话，全部跳过
                if (ctx.query[key] == "") continue

                // 不为空的话，开始验证
                if (ctx.query[key] == item[key]) {

                    //验证跳过的搜说项
                    selectIndex++
                }

                    // 需要验证的总数量搜索项 
                    total++
            }

            // 判断验证搜索项都为空的话，应该返回所有的数据
            if (total) {
                
                if (status != 0) {

                    if (status != item.status) return
                }

                // 如果有验证项的话，要判断一下，看看验证通过的搜索项和需要全部验证的搜索项是否相对，相等说明验证成功
                if (total == selectIndex) {

                    // 验证时间的函数
                    cheackTime(dateEnd, dateStart, articleTime, articleArr, item)
                    
                } else {
                    
                    // 不相等的话，就需要对文章分类和文章关键字做一个单独的判断
                    if (selectVal !== item.selectVal) return 

                    if (article_keyword !== item.article_keyword) return

                    articleArr.push(item)
                }    
            } else {

                // 状态为0就是全部，返回所有的数据
                if (status == 0) {

                    cheackTime(dateEnd, dateStart, articleTime, articleArr, item)

                } else {

                    // 否则对响应的状态返回响应的数据
                    if (status != item.status) return
                    cheackTime(dateEnd, dateStart, articleTime, articleArr, item)
                }
            }
        })



        // 根据前端请求的页码返回相应的数据
        let selectArr = []
        
        let totalPage = Math.ceil(articleArr.length / count)

        if (page > totalPage) {

            ctx.body = { code: 200, message: "暂无文章信息" }
            return
        }

        let i = page * count - count

        for (i; i < articleArr.length;i++) {
           
            if (i < page * count) {

                selectArr.push(articleArr[i])
            }
        }

        

        ctx.body = { code: 200, message: '文章成功载入', data: selectArr, total: articleArr.length}
        
    }

})

// 删除文章数据的接口
router.delete('/delete_article', ctx => {

    const { detailId, id } = ctx.query

    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let fileItem = fs.readFileSync(filePath, "utf8")
    
    if (fileItem !== "") {

        fileItem = JSON.parse(fileItem)

        fileItem.forEach((item, index) => {

            if (id == item.id) {

                if (item.detailId == detailId) {
                    
                    fileItem.splice(index, 1)

                    fs.writeFileSync(filePath,JSON.stringify(fileItem) ,"utf8")
                    ctx.body = { code: 200, message: '删除文章成功' }
                }
            }
        })
    } 

    

})

// 禁止发布文章接口
router.post('/prohibit_and_recovery', ctx => {

    const { detailId } = ctx.request.body

    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let fileItem = fs.readFileSync(filePath, "utf8")

    if (fileItem !== "") {

        fileItem = JSON.parse(fileItem)
    }

    fileItem.forEach(item => {

        if (item.detailId == detailId) {

            item.isProhibit = !item.isProhibit

            fs.writeFileSync(filePath,JSON.stringify(fileItem) ,"utf8")

            ctx.body = { code: 200, message: '操作文章成功' }
            return
        }
    })
})

// 编辑文章的接口
router.post('/edit_article', ctx => {

    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let fileItem = JSON.parse(fs.readFileSync(filePath, "utf8"))

    fileItem.forEach((item, index) => {

        if (item.detailId == ctx.request.body.detailId) {

            fileItem[index] = ctx.request.body

            fs.writeFileSync(filePath,JSON.stringify(fileItem) ,"utf8")

            ctx.body = { code: 200, message: '保存成功' }
        }
    })
})

// 需要修改的文章的接口
router.get('/edit_article_detail', ctx => {

    const { detailId } = ctx.query

    const filePath = path.join(__dirname, '../../admin_data/user_articles.json')

    let fileItem = JSON.parse(fs.readFileSync(filePath, "utf8"))

    const articleItem = fileItem.find(item => {

        return item.detailId == detailId
    })

    if (articleItem) {

        ctx.body = { code: 200, message: '获取成功', data: articleItem }
    } else {

        ctx.body = { code: 404, message: '获取失败' }
    }

    
})


module.exports = router