const appListView = (req, res, next) => {
    res.render("user/appList", {
        info: commonInfo,
        title: 'App List',
        userName: req.user.name,
        email: req.user.email,
        sidebar: sidebar,
        path: req.path,
        csrfToken: req.csrfToken(),
        appList: web.appList.url,
    })
}

const appList = (req, res, next) => {
    const app = new model("app")

    app.dataTable({
            user_id: req.user._id,
            app_name: RegExp(`.*${req.body.search.value}.*`, 'i')
        }, {
            _id: 0,
            userId: 0,
            randomSerial: 0,
            password: 0
        }, parseInt(req.body.start), parseInt(req.body.length))
        .then(result => {
            let response = []
            result.data.map((item, index) => {
                response.push([item.app_name, item.appId, item.subscribe, item.dial, `<a href="#" class="btn btn-success">App Details</a>`])
            })

            return res.json({
                data: response,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                draw: parseInt(req.query.draw),
            })
        })
        .catch(err => console.log(err))
}



module.exports = {
    appListView,
    appList,
}