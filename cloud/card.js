const stripe = require('stripe')
const Utils = require('../utils')

Parse.Cloud.beforeSave('Card', async (req) => {

    const obj = req.object
    const user = req.user

    try {

        if (!user) throw 'Not Authorized'

        const customerId = await Utils.createOrGetStripeCustomerId(user)

        if (!obj.existed()) {

            const acl = new Parse.ACL()
            acl.setReadAccess(user, true)
            acl.setWriteAccess(user, true)
            obj.setACL(acl)
            obj.set('user', user)

            const queryConfig = new Parse.Query('AppConfig')
            const config = await queryConfig.first({
                useMasterKey: true
            })

            const stripeConfig = config.get('stripe')

            const stripeInstance = stripe(stripeConfig.secretKey)

            const card = await stripeInstance.customers.createSource(customerId, {
                source: obj.get('stripeToken')
            })

            obj.set('cardId', card.id)
            obj.set('brand', card.brand)
            obj.set('last4', card.last4)
            obj.set('expMonth', card.exp_month)
            obj.set('expYear', card.exp_year)
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

Parse.Cloud.afterDelete('Card', async (req) => {

    const obj = req.object
    const user = req.user

    await user.fetch()

    const queryConfig = new Parse.Query('AppConfig')
    const config = await queryConfig.first({
        useMasterKey: true
    })

    const stripeConfig = config.get('stripe')

    const stripeInstance = stripe(stripeConfig.secretKey)

    await stripeInstance.customers.deleteCard(user.get('stripeCustomerId'), obj.get('cardId'))

})