Parse.Cloud.beforeSave('Cart', async (req) => {

    const obj = req.object
    const attrs = obj.attributes
    const user = req.user

    if (!user) throw 'Not Authorized'

    if (!obj.existed()) {
        const acl = new Parse.ACL()
        acl.setReadAccess(user, true)
        acl.setWriteAccess(user, true)
        obj.setACL(acl)
        obj.set('customer', user)
        obj.set('status', 'Pending')
    }

    const items = attrs.items.map(item => {
        item.className = 'Item'
        return Parse.Object.fromJSON(item, false)
    })

    const fetchedItems = await Parse.Object.fetchAll(items)

    const items1 = fetchedItems.map(fetchedItem => {

        const allowed = [
            'objectId',
            'name',
            'salePrice',
            'price',
            'featuredImage',
            'featuredImageThumb'
        ]

        const fetchedAttrs = fetchedItem.toJSON()

        const filtered = Object.keys(fetchedAttrs)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                obj[key] = fetchedAttrs[key]
                return obj
            }, {})

        const item = attrs.items.find(item => item.objectId === filtered.objectId)

        filtered.qty = item.qty
        filtered.amount = item.qty * (filtered.salePrice || filtered.price)

        return filtered
    })

    const total = items1.reduce((total, item) => total + item.amount, 0)

    obj.set('items', items1)
    obj.set('subtotal', total)
    obj.set('total', total)

})