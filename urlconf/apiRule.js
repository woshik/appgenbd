module.exports = {
    userLogin: {
        url: '/api/:id/:appName/sms',
        controller: 'Ussd',
        methods: {
            ussd: 'get',
        },
        path: 'api'
    }
}