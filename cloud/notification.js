const Utils = require('../utils')

Parse.Cloud.beforeSave('Notification', async (req) => {

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
})

Parse.Cloud.afterSave('Notification', (req) => {

    const query = new Parse.Query(Parse.Installation)
    query.containedIn('deviceType', ['ios', 'android'])
    query.equalTo('isPushEnabled', true)

    const pushParams = {
        where: query,
        data: {
            alert: req.object.get('message'),
            event: 'news',
            sound: 'default'
        }
    }

    Parse.Push.send(pushParams, {
        useMasterKey: true
    })
})