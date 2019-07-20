const sharp = require('sharp')
const slug = require('limax')
const Utils = require('../utils')

Parse.Cloud.beforeSave('Category', async (req) => {

    const obj = req.object
    const attrs = obj.attributes
    const user = req.user

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin && !req.master) throw 'Not Authorized'

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setPublicReadAccess(true)
        acl.setRoleWriteAccess('Admin', true)
        obj.setACL(acl)
    }

    if (obj.dirty('name')) {
        obj.set('canonical', attrs.name.toLowerCase())
        obj.set('slug', slug(attrs.name))
    }

    if (attrs.deletedAt) {

        const query = new Parse.Query('SubCategory')
        query.equalTo('category', obj)
        query.doesNotExist('deletedAt')
        const result = await query.first()

        if (result) throw 'Can\'t delete category if it still has subcategories.'

        const query1 = new Parse.Query('Item')
        query1.equalTo('category', obj)
        query1.doesNotExist('deletedAt')
        const result1 = await query1.first()

        if (result1) throw 'Can\'t delete category if it still has items.'
    }

    if (obj.existed() && typeof attrs.subCategoryCount === 'undefined') {
        const query = new Parse.Query('SubCategory')
        query.equalTo('category', obj)
        query.doesNotExist('deletedAt')
        const count = await query.count()
        obj.set('subCategoryCount', count)
    }

    const image = attrs.image

    if (!image || !obj.dirty('image')) return

    let httpResponse = await Parse.Cloud.httpRequest({
        url: image.url()
    })

    let resizedImage = await sharp(httpResponse.buffer).resize(200, 200).toBuffer()

    var file = new Parse.File('photo.jpg', {
        base64: resizedImage.toString('base64')
    })

    let savedFile = await file.save()

    obj.set('imageThumb', savedFile)

})