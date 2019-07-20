const sharp = require('sharp')
const slug = require('limax')
const Utils = require('../utils')

Parse.Cloud.beforeSave('SubCategory', async (req) => {

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

        const query = new Parse.Query('Item')
        query.equalTo('subcategory', obj)
        const result = await query.first()

        if (result) throw 'Can\'t delete subcategory if it still has items.'
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

Parse.Cloud.afterSave('SubCategory', async (req) => {

    const user = req.user
    const obj = req.object
    const attrs = obj.attributes

    try {

        if (!obj.existed()) {

            attrs.category.increment('subCategoryCount')
            await attrs.category.save(null, {
                sessionToken: user.getSessionToken()
            })
    
        } else {
    
            const origObj = req.original
            const origAttrs = origObj.attributes
    
            if (attrs.category.id !== origAttrs.category.id) {
                
                attrs.category.increment('subCategoryCount', 1)
                origAttrs.category.increment('subCategoryCount', -1)
    
                await Promise.all([
                    attrs.category.save(null, { 
                        sessionToken: user.getSessionToken()
                    }),
                    origAttrs.category.save(null, {
                        sessionToken: user.getSessionToken()
                    })
                ])
            }

            if (typeof origAttrs.deletedAt === 'undefined' && attrs.deletedAt) {
                
                const category = attrs.category
                category.increment('subCategoryCount', -1)
                await category.save(null, {
                    sessionToken: user.getSessionToken()
                })
            }
        }
        
    } catch (error) {
        console.warn(error.message)
    }

})