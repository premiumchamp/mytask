Parse.Cloud.beforeSave('OrderCount', (req) => {

    const obj = req.object

    if (!req.master) throw 'Not Authorized'

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        obj.setACL(acl)
    }

})