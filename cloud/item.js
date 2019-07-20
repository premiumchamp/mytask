const sharp = require('sharp')
const slug = require('limax')
const Utils = require('../utils')

Parse.Cloud.beforeSave('Item', async (req) => {

    const obj = req.object
    const attrs = obj.attributes
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin && !req.master) throw 'Not Authorized'

    if (attrs.salePrice) {
        const discount = (attrs.price - attrs.salePrice) / attrs.price
        obj.set('discount', discount)
    } else {
        obj.set('discount', 0)
    }

    if (obj.dirty('name')) {
        obj.set('canonical', attrs.name.toLowerCase())
        obj.set('slug', slug(attrs.name))
    }

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setPublicReadAccess(true)
        acl.setRoleWriteAccess('Admin', true)
        obj.setACL(acl)
        obj.set('views', 0)
        obj.set('likeCount', 0)
    }

    if (attrs.deletedAt) {

        const query = new Parse.Query('SlideImage')
        query.equalTo('item', obj)
        const result = await query.first()

        if (result) throw 'Can\'t delete item if it still has slider images.'
    }

    if (!obj.dirty('featuredImage') || !obj.get('featuredImage')) {
        return
    }

    const image = obj.get('featuredImage')

    const httpResponse = await Parse.Cloud.httpRequest({
        url: image.url()
    })

    const imageData = await sharp(httpResponse.buffer).resize(400, 400).toBuffer()

    const file = new Parse.File('photo.jpg', {
        base64: imageData.toString('base64')
    })

    await file.save()

    obj.set('featuredImageThumb', file)

    const images = obj.get('images')

    const resizedImages = []

    for (let image of images) {

        const httpResponse = await Parse.Cloud.httpRequest({
            url: image.url()
        })

        const imageData = await sharp(httpResponse.buffer).resize(600).toBuffer()

        const file = new Parse.File('photo.jpg', {
            base64: imageData.toString('base64')
        })

        await file.save()

        resizedImages.push(file)
    }

    obj.set('images', resizedImages)

})

Parse.Cloud.define('isItemLiked', async (req) => {

    const user = req.user
    const itemId = req.params.itemId

    if (!user) throw 'Not Authorized'

    const query = new Parse.Query('Item')
    query.equalTo('likes', user)
    query.equalTo('objectId', itemId)

    const item = await query.first()
    const isLiked = item ? true : false
    return isLiked
})

Parse.Cloud.define('likeItem', async (req) => {

    const user = req.user
    const itemId = req.params.itemId

    if (!user) throw 'Not Authorized'

    const query = new Parse.Query('Item')
    const item = await query.get(itemId)

    if (!item) throw ('Record not found')

    const query1 = new Parse.Query('Item')
    query1.equalTo('likes', user)
    query1.equalTo('objectId', itemId)
    const isLiked = await query1.first()

    const relation = item.relation('likes')

    let response

    if (isLiked) {
        item.increment('likeCount', -1)
        relation.remove(user)
        response = false
    } else {
        item.increment('likeCount', 1)
        relation.add(user)
        response = true
    }

    await item.save(null, {
        useMasterKey: true
    })

    return response

})

Parse.Cloud.define('trackViewItem', async (req) => {

    const item = new Parse.Object('Item')
    item.id = req.params.itemId
    item.increment('views')
    return await item.save(null, {
        useMasterKey: true
    })

})

Parse.Cloud.define('getItems', async () => {

    const pipeline = {
        match: {
            status: 'Active'
        },
        sample: {
            size: 25
        }
    }

    const query = new Parse.Query('Item')

    const randomItems = await query.aggregate(pipeline)

    const itemIds = randomItems.map(item => item.objectId)

    const query1 = new Parse.Query('Item')
    query1.containedIn('objectId', itemIds)
    query1.doesNotExist('deletedAt')
    query1.include(['category', 'subcategory'])

    return await query1.find()

})