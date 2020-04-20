const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
// 用户登陆的接口
router.get('/login', ctx => {

    const filePath = path.join(__dirname, '../../admin_data/user_register.json')

    const { username, password } = ctx.query

    const fileItem = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    const userInfo = fileItem.find(item => {
        return item.username === username && item.password === password
    })

    if (userInfo) {
        
        const token = jwt.sign({
            // token的创建日期
            time: Date.now(),
            // token的过期时间
            timeout: 7200000,
            username: username,
            password: password,
            id: userInfo.id
        }, 'token')

        userInfo.token = token
        ctx.body = { code: 200, message: '恭喜你，登陆成功', userInfo }

    } else {
        
        ctx.body = {code: 400, message: '密码或者账号错误'}
    }

})

// 用户注册的接口
router.get('/register', ctx => {

    let userPath = path.join(__dirname, '../../admin_data/user_register.json')

    let authPath = path.join(__dirname, '../../admin_data/user_auth.json')

    let fileItem = JSON.parse(fs.readFileSync(userPath, 'utf8'))

    let authItem = JSON.parse(fs.readFileSync(authPath, 'utf8'))

    const { username, password, mailbox, gender, headImg } = ctx.query


    const obj = {
        username,
        Email: mailbox,
        password: password,
        id: fileItem.length + 1,
        code: 200,
        gender,
        headImg
    }

    const auth = {
        id: fileItem.length + 1,
        username,
        roles: ['user']
    }

    const trem = fileItem.find(item => {

        return item.username === username || item.password === password || item.Email === mailbox
           
    })
    if(!trem) {


        fileItem.push(obj)
        authItem.push(auth)

        fs.writeFileSync(userPath, JSON.stringify(fileItem), 'utf8')
        fs.writeFileSync(authPath, JSON.stringify(authItem), 'utf8')

        ctx.body = {code: 200, message: '注册成功'}
    } else {
        ctx.body = {code: 400, message: '账号、密码或者邮箱号已经被注册'}
    }
})

// 获取用户权限数据
router.get('/user_auth', ctx => {
    
    let authPath = path.join(__dirname, '../../admin_data/user_auth.json')

    let authItem = JSON.parse(fs.readFileSync(authPath, 'utf8'))
    

    const { token } = ctx.query
    
    const userToken = jwt.verify(token, 'token')

    const tokenItem = authItem.find(item => {
        
        return item.id === userToken.id
    })

    ctx.body = tokenItem.roles
})

// 获取用户头像
router.get('/user_img', ctx => {

    const imgArr = {

        admin: [
            {
                id: 1,
                imgSrc: 'http://localhost:3000/images/guanliyuan.png',
            },
            {
                id: 2,
                imgSrc: 'http://localhost:3000/images/nv_05.jpg',
            },
            {
                id: 3,
                imgSrc: 'http://localhost:3000/images/nan_07.jpg',
            },
            {
                id: 4,
                imgSrc: 'http://localhost:3000/images/nan_08.jpg',
            },
            {
                id: 5,
                imgSrc: 'http://localhost:3000/images/nan_09.jpg',
            },
            {
                id: 6,
                imgSrc: 'http://localhost:3000/images/nan_10.jpg',
            }
        ],
        user: [
            {
                id: 1,
                imgSrc: 'http://localhost:3000/images/nv_01.jpg',
                type: 'user'
            },
            {
                id: 2,
                imgSrc: 'http://localhost:3000/images/nv_02.jpg',
                type: 'user'
            },
            {
                id: 3,
                imgSrc: 'http://localhost:3000/images/nan_01.jpg',
                type: 'user'
            },
            {
                id: 4,
                imgSrc: 'http://localhost:3000/images/nv_03.jpg',
                type: 'user'
            },
            {
                id: 5,
                imgSrc: 'http://localhost:3000/images/nan_02.jpg',
                type: 'user'
            },
            {
                id: 6,
                imgSrc: 'http://localhost:3000/images/nan_03.jpg',
                type: 'user'
            },
            {
                id: 7,
                imgSrc: 'http://localhost:3000/images/nv_04.jpg',
                type: 'user'
            },
            {
                id: 8,
                imgSrc: 'http://localhost:3000/images/nv_06.jpg',
                type: 'user'
            },
            {
                id: 9,
                imgSrc: 'http://localhost:3000/images/nv_07.jpg',
                type: 'user'
            },
            {
                id: 10,
                imgSrc: 'http://localhost:3000/images/nv_08.jpg',
                type: 'user'
            },
            {
                id: 11,
                imgSrc: 'http://localhost:3000/images/nan_05.jpg',
                type: 'user'
            },
            {
                id: 12,
                imgSrc: 'http://localhost:3000/images/nan_06.jpg',
                type: 'user'
            }
        ]
    }

    const { currentPage, pageSize, type } = ctx.query

    

    let total = Math.ceil(imgArr[type].length / pageSize)

    // 总页数

    let index = 0
    
    let pageArrData = []

    if (currentPage > total) {

        ctx.body = { code: 200, message: '该页没有图片' }
    } else {

        let i = currentPage * pageSize - pageSize

        for (i; i < imgArr[type].length;i++) {

            if (i < currentPage * pageSize) {

                pageArrData.push(imgArr[type][i])
            }
        }

        console.log(type)

        ctx.body = { code: 200, total: imgArr[type].length, message: '获取成功', data: pageArrData }
    }
    
})

// 获取用户登陆头像
router.get('/login_img', ctx => {

    const { username } = ctx.query
    
    let userPath = path.join(__dirname, '../../admin_data/user_register.json')

    let fileItem = JSON.parse(fs.readFileSync(userPath, 'utf8'))

    let imgData = fileItem.find(item => {
        return item.username === username
    })

    if (imgData) {

        ctx.body = { code: 200, message: '获取成功', data: {
            id: imgData.id,
            headImg: imgData.headImg
        } }
    } else {

        ctx.body = { code: 200, message: '暂无头像信息', data: {
            id: '',
            headImg: ''
        } }
    }
    
})

// 修改用户资料
router.post('/edit_user', ctx => {

    const { id } = ctx.request.body

    const filePath = path.join(__dirname, '../../admin_data/user_register.json')

    const fileItem = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    fileItem.forEach((item, index) => {

        if (item.id == id) {

            fileItem[index] = ctx.request.body
            
            fs.writeFileSync(filePath, JSON.stringify(fileItem), 'utf8')

            ctx.body = { code: 200, message: '修改成功', data: fileItem[index] }

            return
        }
    })
})

module.exports = router
