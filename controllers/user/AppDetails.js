const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.appDetailsView = (req, res, next) => {

    const app = new model('app')
    app.aggregate({ user_id: req.user._id, randomSerial: req.params.appId }, 'content', '_id', 'app_id', 'details')
        .then(result => {
            //console.log(result)

            // let appListData = {
            //     info: commonInfo,
            //     title: 'App List',
            //     userName: req.user.name,
            //     email: req.user.email,
            //     sidebar: sidebar,
            //     path: req.path,
            //     csrfToken: req.csrfToken(),
            //     appList: web.appList.url,
            // }

            // res.render("user/appList", appListData)
        })
        .catch(err => next(err))


}

exports.appDetails = (req, res, next) => {

}