const sharp = require('sharp')
const Utils = require('../utils')

Parse.Cloud.beforeSave('SlideImage', async (req) => {

  const obj = req.object
  const user = req.user

  const isAdmin = await Utils.isAdmin(user)
  if (!isAdmin && !req.master) throw 'Not Authorized'

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
  }

  if (!obj.dirty('image') || !obj.get('image')) {
    return
  }

  const image = obj.get('image')

  const httpResponse = await Parse.Cloud.httpRequest({
    url: image.url()
  })

  const imageData = await sharp(httpResponse.buffer).resize(200, 200).toBuffer()

  const file = new Parse.File('photo.jpg', {
    base64: imageData.toString('base64')
  })

  await file.save()

  obj.set('imageThumb', file)

})