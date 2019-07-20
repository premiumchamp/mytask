const stripe = require('stripe')
const MailgunHelper = require('../helpers/mailgun-helper').MailgunHelper
const Mailgen = require('mailgen')
const Utils = require('../utils')

Parse.Cloud.beforeSave('Order', async (req) => {

  const obj = req.object
  const attrs = obj.attributes
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  try {

    if (!obj.existed()) {
      const acl = new Parse.ACL()
      acl.setReadAccess(user, true)
      acl.setRoleReadAccess('Admin', true)
      acl.setRoleWriteAccess('Admin', true)
      obj.setACL(acl)
      obj.set('customer', user)
      obj.set('status', 'Unpaid')

      const orderNo = await Utils.generateNextOrderNumber()
      if (!orderNo) throw 'Internal error'

      obj.set('number', orderNo)

      await user.fetch()

      if (user.get('status') === 'Banned') {
        throw new Parse.Error(1001, 'Your account has been blocked.')
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
        filtered.amount = item.qty * (filtered.salePrice || item.price)

        return filtered
      })

      const subtotal = items1.reduce((total, item) => total + item.amount, 0)

      const shippingQuery = new Parse.Query('CustomerAddress')
      shippingQuery.include(['zone', 'subzone'])
      const shipping = await shippingQuery.get(attrs.shipping.id, {
        useMasterKey: true
      })

      obj.set('shipping', shipping.toJSON())

      let total = subtotal

      if (shipping.get('subzone') && shipping.get('subzone').get('fee')) {
        total += shipping.get('subzone').get('fee')
      }

      obj.set('subtotal', subtotal)
      obj.set('total', total)

      if (attrs.paymentMethod === 'Card') {

        const card = attrs.card

        await card.fetch({
          useMasterKey: true
        })

        const queryConfig = new Parse.Query('AppConfig')
        const config = await queryConfig.first({
          useMasterKey: true
        })

        const stripeConfig = config.get('stripe')

        const stripeInstance = stripe(stripeConfig.secretKey)

        let chargeDescription = stripeConfig.chargeDescription
        chargeDescription = chargeDescription.replace('%CUSTOMER_NAME%', user.get('name'))
        chargeDescription = chargeDescription.replace('%ORDER_NUMBER%', orderNo)

        const charge = await stripeInstance.charges.create({
          amount: Math.round(total * 100),
          currency: stripeConfig.currency,
          description: chargeDescription,
          customer: user.get('stripeCustomerId'),
          capture: true,
          source: card.get('cardId')
        })

        obj.set('card', card.toJSON())
        obj.set('status', 'Paid')
        obj.set('charge', charge)

      }

    }

  } catch (error) {

    switch (error.type) {
      case 'StripeCardError':
        // A declined card error
        error.code = 1002
        break
      case 'StripeInvalidRequestError':
      case 'StripeAPIError':
      case 'StripeConnectionError':
      case 'StripeAuthenticationError':
      case 'StripeRateLimitError':
        error.code = 1003
        break
    }

    throw new Parse.Error(error.code, error.message)
  }

})

Parse.Cloud.afterSave('Order', async (req) => {

  let obj = req.object
  let attrs = obj.attributes
  const original = req.original
  const user = req.user

  // Send push notification to customer when order status changes

  if (obj.existed())

    try {

      const origAttrs = original.attributes

      if (obj.existed() && attrs.status !== origAttrs.status) {

        let pushQuery = new Parse.Query(Parse.Installation)
        pushQuery.equalTo('isPushEnabled', true)
        let innerPushQuery = new Parse.Query(Parse.User)
        innerPushQuery.equalTo('objectId', attrs.customer.id)
        pushQuery.matchesQuery('user', innerPushQuery)

        const query = new Parse.Query('AppConfig')
        const config = await query.first({
          useMasterKey: true
        })

        if (config && config.get('push') && config.get('push').orderStatusNotification) {

          const pushConfig = config.get('push')

          let pushMessage = pushConfig.orderStatusNotification
          pushMessage = pushMessage.replace('%STATUS%', attrs.status)
          pushMessage = pushMessage.replace('%ORDER_NUMBER%', attrs.number)

          let pushParams = {
            where: pushQuery,
            data: {
              alert: pushMessage,
              event: 'order',
              orderId: obj.id,
              sound: 'default'
            }
          }

          Parse.Push.send(pushParams, {
            useMasterKey: true
          })
        }
      }

    } catch (error) {
      // error
    }

  // clean cart...

  if (!obj.existed() && user) {

    try {

      let query = new Parse.Query('Cart')
      query.equalTo('customer', attrs.customer)
      let cart = await query.first({
        useMasterKey: true
      })
      if (cart) cart.destroy({
        useMasterKey: true
      })
  
    } catch (err) {
      // error
    }
  }

  // Send email notification to admin when a new new order is placed

  if (!obj.existed()) {

    try {

      const query = new Parse.Query('AppConfig')
      const config = await query.first({
        useMasterKey: true
      })
      const emailConfig = config.get('email')

      if (emailConfig && emailConfig.addressForNewOrders && emailConfig.subjectForNewOrders) {

        const data = attrs.items.map(item => {
          return {
            item: `${item.qty} x ${item.name}`,
            amount: Utils.formatCurrency(item.amount)
          }
        })

        const email = {
          body: {
            title: `A new order (#${attrs.number}) has been placed`,
            table: {
              data: data,
              columns: {
                customWidth: {
                  amount: '15%'
                },
                customAlignment: {
                  amount: 'right'
                }
              }
            },
            action: {
              instructions: '',
              button: {
                text: 'View Order',
                link: process.env.PUBLIC_SERVER_URL + '/admin/orders'
              }
            },
            outro: ''
          }
        }

        const mailgunHelper = new MailgunHelper({
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          fromAddress: process.env.MAILGUN_FROM_ADDRESS,
          toAddress: emailConfig.addressForNewOrders
        })

        const mailGenerator = new Mailgen({
          theme: 'default',
          product: {
            name: process.env.APP_NAME,
            link: process.env.PUBLIC_SERVER_URL
          }
        })

        let subject = emailConfig.subjectForNewOrders
        subject = subject.replace('%ORDER_NUMBER%', attrs.number)
        subject = subject.replace('%ORDER_TOTAL%', Utils.formatCurrency(attrs.total))

        mailgunHelper.send({
          to: emailConfig.addressForNewOrders,
          html: mailGenerator.generate(email),
          subject: subject
        })

      }

    } catch (err) {
      console.log(err);
    }
  }

})

Parse.Cloud.define('markOrdersAsSeen', async (req) => {

  const user = req.user

  const isAdmin = await Utils.isAdmin(user)
  if (!isAdmin && !req.master) throw 'Not Authorized'

  const query = new Parse.Query('Order')
  query.notEqualTo('views', user)

  const orders = await query.find({ useMasterKey: true })

  const promises = orders.map(order => {
    const relation = order.relation('views')
    relation.add(user)
    return order.save(null, {
      useMasterKey: true
    })
  })

  return await Promise.all(promises)
})