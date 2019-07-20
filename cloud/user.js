const sharp = require('sharp')
const Utils = require('../utils')

Parse.Cloud.define('getUsers', async (req) => {

    const params = req.params
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin) throw 'Not Authorized'

    const query1 = new Parse.Query(Parse.User)

    if (params.canonical) {
        query1.contains('canonical', params.canonical)
    }

    if (params && params.orderBy == 'asc') {
        query1.ascending(params.orderByField);
    } else if (params && params.orderBy == 'desc') {
        query1.descending(params.orderByField);
    } else {
        query1.descending('createdAt');
    }

    query1.limit(params.limit)
    query1.skip((params.page * params.limit) - params.limit)

    const results = await Promise.all([query1.find({ useMasterKey: true }), query1.count()])

    return {
        users: results[0],
        total: results[1]
    }
})

Parse.Cloud.define('createUser', async (req) => {

    const params = req.params
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin) throw 'Not Authorized'

    const user1 = new Parse.User()
    user1.set('name', params.name)
    user1.set('username', params.username)

    if (params.email) {
        user1.set('email', params.email)
    }
    
    user1.set('password', params.password)

    if (params.photo) {
        user1.set('photo', params.photo)
    }

    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    user1.setACL(acl)

    await user1.signUp()

    // Add user to Admin role
    const query1 = new Parse.Query(Parse.Role)
    query1.equalTo('name', 'Admin')
    const role = await query1.first({ useMasterKey: true })
    role.getUsers().add(user1)
    await role.save(null, { useMasterKey: true })

    return user1
})

Parse.Cloud.define('updateUser', async (req) => {

    const params = req.params
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin) throw 'Not Authorized'

    const query1 = new Parse.Query(Parse.User)
    query1.equalTo('objectId', params.objectId)

    const user1 = await query1.first()

    if (!user1) throw 'User not found'

    user1.set('name', params.name)

    user1.set('username', params.username)

    if (params.email) {
        user1.set('email', params.email)
    }

    user1.set('photo', params.photo)

    if (!params.password) {
        user1.set('password', params.password)
    }

    return await user1.save(null, {
        useMasterKey: true
    })
})

Parse.Cloud.define('destroyUser', async (req) => {

    const params = req.params
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin) throw 'Not Authorized'

    const query1 = new Parse.Query(Parse.User)
    query1.equalTo('objectId', params.id)
    const user1 = await query1.first()

    if (!user1) throw 'User not found'

    if (user.id === user1.id) {
        throw 'You cannot delete your own user'
    }

    return await user1.destroy({
        useMasterKey: true
    })

})

Parse.Cloud.beforeSave(Parse.User, async (req) => {

    const obj = req.object
    const attrs = obj.attributes

    if (!obj.existed()) {
        obj.set('status', 'Active')
    }

    let canonical = ''

    if (obj.dirty('username') && obj.get('username')) {
        canonical += ' ' + attrs.username.toLowerCase()
    }

    if (obj.dirty('name') && obj.get('name')) {
        canonical += ' ' + attrs.name.toLowerCase()
    }

    if (obj.dirty('email') && obj.get('email')) {
        canonical += ' ' + attrs.email.toLowerCase()
    }
    
    obj.set('canonical', canonical)

    // We need to retrieve extra data
    // if user was logged in with facebook

    if (!obj.existed() && attrs.authData) {

        const httpResponse = await Parse.Cloud.httpRequest({
            url: 'https://graph.facebook.com/me?fields=email,id,name&access_token=' + attrs.authData.facebook.access_token
        })

        obj.set('name', httpResponse.data.name)
        obj.set('username', httpResponse.data.id)
        obj.set('facebookId', httpResponse.data.id)
        obj.set('canonical', httpResponse.data.name.toLowerCase())

        const paramsRequest = {
            url: 'https://graph.facebook.com/' + attrs.authData.facebook.id + '/picture',
            followRedirects: true,
            params: {
                type: 'large'
            }
        }

        const httpResponse1 = await Parse.Cloud.httpRequest(paramsRequest)

        const buffer = httpResponse1.buffer
        const base64 = buffer.toString('base64')
        const parseFile = new Parse.File('image.jpg', {
            base64: base64
        })

        await parseFile.save()
        obj.set('photo', parseFile)

    } else {

        if (attrs.photo && obj.dirty('photo')) {

            const httpResponse = await Parse.Cloud.httpRequest({
                url: attrs.photo.url()
            })

            const imageResizedData = await sharp(httpResponse.buffer)
                .resize(200, 200)
                .toBuffer()

            const file = new Parse.File('image.jpg', {
                base64: imageResizedData.toString('base64')
            })

            await file.save()

            obj.set('photo', file)
        }

    }
})