const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.appListView = (req, res, next) => {

    let appListData = {
        info: commonInfo,
        title: 'App List',
        userName: req.user.name,
        email: req.user.email,
        sidebar: sidebar,
        path: req.path,
        csrfToken: req.csrfToken(),
        appList: web.appList.url,
    }

    res.render("user/appList", appListData)
}

exports.appList = (req, res, next) => {
    const app = new model("app")
    let order = ['app_name', 'app_id', 'subscribe', 'dial']
    let sort = {}

    if (req.body.order) {
        sort[order[parseInt(req.body.order[0].column)]] = req.body.order[0].dir === 'asc' ? 1 : -1
    } else {
        sort[order[0]] = 1
    }

    app.dataTable({
            user_id: req.user._id,
            '$or': [
                { app_name: RegExp(`.*${req.body.search.value}.*`, 'i') },
                { app_id: RegExp(`.*${req.body.search.value}.*`, 'i') }
            ]
        }, {
            _id: 0,
            user_id: 0,
            password: 0,
            randomSerial: 0,
        }, parseInt(req.body.start), parseInt(req.body.length), sort)
        .then(result => {
            let response = []
            result.data.map((item, index) => {
                response.push([
                    item.app_name,
                    item.app_id,
                    item.subscribe,
                    item.dial,
                    dateTime.format(item.create_date, "DD-MM-YYYY hh:mm:ss A"),
                    `<a href="${web.appdetails.url.replace(':appName', item.app_name)}" class="btn btn-success">App Details</a>`
                ])
            })

            return res.json({
                data: response,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                draw: parseInt(req.query.draw),
            })
        })
        .catch(err => next(err))
}