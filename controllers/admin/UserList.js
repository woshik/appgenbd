const { join } = require('path')
const model = require(join(__dirname, "../../", "db", "model"))

const userList = (req, res, next) => {
    const user = new model("users")

    user.dataTable({}, {}, parseInt(req.body.start), parseInt(req.body.length))
        .then(result => {
            let response = []
            result.data.map((item, index) => {
                response.push([item.name, item.number, item.email, item.app_installed, item.max_app_install])
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
    userList,
}