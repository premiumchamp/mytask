Parse.Cloud.beforeSave('CustomerAddress', (req) => {

  const obj = req.object
  const user = req.user

  if (!user) throw 'Not Authorized'

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setReadAccess(user, true)
    acl.setWriteAccess(user, true)
    acl.setRoleReadAccess('Admin', true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
    obj.set('customer', user)
  }
})