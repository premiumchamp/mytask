const Utils = require('../utils')

Parse.Cloud.beforeSave('Zone', async (req) => {

    const obj = req.object
    const user = req.user

    obj.set('canonical', obj.get('name').toLowerCase())

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin && !req.master) throw 'Not Authorized'

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setPublicReadAccess(true)
        acl.setRoleWriteAccess('Admin', true)
        obj.setACL(acl)
    }

})