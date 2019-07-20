const Utils = require('../utils')

Parse.Cloud.beforeSave('AppConfig', async (req) => {

    const obj = req.object
    const user = req.user
    const attrs = obj.attributes

    const isAdmin = await Utils.isAdmin(user)
    if (!isAdmin && !req.master) throw 'Not Authorized'

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setRoleReadAccess('Admin', true)
        acl.setRoleWriteAccess('Admin', true)
        obj.setACL(acl)
    }

    if (attrs.stripe && attrs.stripe.currency) {
        attrs.stripe.currency = attrs.stripe.currency.toLowerCase()
        obj.set('stripe', attrs.stripe)
    }

})

Parse.Cloud.define('getAppConfig', async () => {

    const query = new Parse.Query('AppConfig')
    query.select('about')

    return await query.first({
        useMasterKey: true
    }) || false;

})