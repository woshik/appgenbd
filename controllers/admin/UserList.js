exports.userList = (req, res, next) => {
    const user = new model("users")
    user.dataTable({}, {}, parseInt(req.body.start), parseInt(req.body.length))
        .then(result => {
            let response = []
            result.data.map((user, index) => {
                let button = !user.account_delete ? `
                        <a href="javascript:void(0)" title="Payment" class="mr-2 btn btn-light" type="button" 
                        data-toggle="modal" data-target="#clientPayment" onclick="payment('${user._id}')" data-backdrop="static">
                            <i class="fas fa-money-check-alt"></i></i>
                        </a>

                        <a href="" class="mr-2 btn btn-light">
                            <i class="fas fa-eye"></i>
                        </a>

                        <a href="javascript:void(0)" title="Account Status Change" class="mr-2 btn btn-light" type="button" data-toggle="modal" 
                        data-target="#accountStatusChange" onclick="accountStatusChange('${user._id}','${user.account_active}')" data-backdrop="static">
                            <i class="fas fa-exchange-alt"></i>
                        </a>

                        <a href="javascript:void(0)" type="button btn btn-light" 
                        data-toggle="modal" data-target="#accountDelete" title="Account Delete" onclick="accountDelete('${user._id}')" data-backdrop="static">
                            <i class="fas fa-trash-alt"></i>
                        </a>
                        ` : ''
                response.push([
                    user.name,
                    user.number,
                    user.email,
                    dateTime.format(new Date(user.account_create), 'DD-MM-YYYY hh:mm:ss A'),
                    `<i class="far fa-${user.email_verify ? 'check' : 'times' }-circle"></i>`,
                    `<i class="far fa-${user.account_active ? 'check' : 'times' }-circle"></i>`,
                    dateTime.format(new Date(user.account_activation_end), 'DD-MM-YYYY'),
                    (user.total_payment ? user.total_payment : 0)+' TK',
                    `<i class="far fa-${user.account_delete ? 'check' : 'times' }-circle"></i>`,
                    button
                ])
            })

            return res.json({
                data: response,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                draw: parseInt(req.query.draw),
            })
        })
        .catch(err => logger.error(err))
}