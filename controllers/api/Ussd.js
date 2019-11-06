const axios = require('axios')
const config = require('config')

exports.ussd = (req, res, next) => {
    const app = new model('app')
    const user = new model('users')

    let userResponse = []

    app.findOne({ randomSerial: req.params.id, app_name: req.params.appName })
        .then(appDetails => {
            if (!appDetails || (req.body.applicationId !== appDetails.app_id)) {

                var appTerminateField = {
                    applicationId: appDetails.app_id,
                    password: appDetails.password,
                    message: "Invalid MMI code, application not found.",
                    destinationAddress: req.body.sourceAddress,
                    sessionId: req.body.sessionId,
                    ussdOperation: "mt-fin",
                    encoding: req.body.encoding,
                    version: req.body.version,
                }

                urlPostRequest(config.get("server_api.ussd"), appTerminateField)
                    .then(apiResponse => {})
                    .catch(err => next(err))

                return res.json({
                    "version": req.body.version,
                    "requestId": req.body.requestId,
                    "statusCode": "E1301",
                    "statusDetail": "App Not Available Error",
                });
            }

            user.findOne({ _id: appDetails.user_id })
                .then(userDetails => {
                    if (userDetails.account_active || userDetails.account_delete || dateTime.subtract(new Date(userDetails.account_activation_end), dateTime.addHours(new Date(), 6)).toDays() >= 0) {

                        urlPostRequest(config.get("server_api.ussd"), appTerminateField)
                            .then(apiResponse => {})
                            .catch(err => next(err))

                        return res.json({
                            "version": req.body.version,
                            "requestId": req.body.requestId,
                            "statusCode": "E1301",
                            "statusDetail": "App Not Available Error",
                        });
                    }

                    isUserAlreadySubscribe(req, appDetails)
                        .then(isSubscribe => {
                            isSubscribe ? userResponse.push('1. Unsubscribe') : userResponse.push('1. Subscribe')
                            userResponse.push('2. Exit')
                            if (req.body.ussdOperation === "mo-init") {
                                userResponse.unshift(`Thanks For Your Interest. Press 1 for ${isSubscribe ? 'unsubscribe' : 'subscribe'} this service.`)
                                loadUssdSender(req, userResponse, appDetails);
                            }

                            selectManu(req, userResponse, appDetails, isSubscribe);
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => {
            res.json({
                "version": req.body.version,
                "requestId": req.body.requestId,
                "statusCode": "E1000",
                "statusDetail": "App failed to process request"
            });
            return next(err);
        })
}

const loadUssdSender = (req, userResponse, appDetails) => {
    let ussdOperation;

    if (req.body.message === "2" || req.body.message === "1") {
        ussdOperation = "mt-fin";
    } else {
        ussdOperation = "mt-cont";
    }

    if (Array.isArray(userResponse)) {
        userResponse = userResponse.join("\n");
    }

    let requestField = {
        applicationId: appDetails.app_id,
        password: appDetails.password,
        message: userResponse,
        destinationAddress: req.body.sourceAddress,
        sessionId: req.body.sessionId,
        ussdOperation: ussdOperation,
        encoding: req.body.encoding,
        version: req.body.version,
    };

    urlPostRequest(config.get("server_api.ussd"), requestField)
        .then(apiResponse => {})
        .catch(err => {});
}

const selectManu = (req, userResponse, appDetails, isSubscribe) => {
    if (req.body.ussdOperation === "mo-cont") {

        switch (req.body.message) {
            case "1":
                userSubscribeORUnsubscribe(req, userResponse, appDetails, isSubscribe);
                break;
            case "2":
                userResponse = "Exit Application";
                loadUssdSender(req, userResponse, appDetails);
                break;
            default:
                userResponse.unshift("Invalid choice. Try again.")
                loadUssdSender(req, userResponse, appDetails);
                break;
        }
    }
}

const userSubscribeORUnsubscribe = (req, userResponse, appDetails, isSubscribe) => {

    let resuestForSubscribe = {
        applicationId: appDetails.app_id,
        password: appDetails.password,
        action: isSubscribe ? 0 : 1,
        subscriberId: req.body.sourceAddress
    }

    urlPostRequest(config.get("server_api.subscription"), resuestForSubscribe)
        .then(apiResponse => {})
        .catch(err => {});

    userResponse = `Successfully ${isSubscribe ? 'unsubscribe' : 'subscribe'}. Thank You.`

    loadUssdSender(req, userResponse, appDetails)
}

const isUserAlreadySubscribe = (req, appDetails) => {

    let subscribeRequestData = {
        "applicationId": appDetails.app_id,
        "password": appDetails.password,
        "subscriberId": req.body.sourceAddress,
    };

    return new Promise((resolve, reject) => {
        urlPostRequest(config.get("server_api.subscriptionCheck"), subscribeRequestData)
            .then(apiResponse => {
                if (apiResponse.statusCode !== 'S1000') return reject('Api not response');
                resolve(apiResponse.subscriptionStatus === "REGISTERED" ? true : false);
            })
            .catch(err => {
                reject(err);
            });
    });
}


const urlPostRequest = (url, data) => {
    return new Promise((resolve, reject) => {
        axios.post(url, JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    })
}