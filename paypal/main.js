const express = require("express"), paypal = require("paypal-rest-sdk"), bodyParser = require("body-parser");
let app = express();


app.use(bodyParser.urlencoded({extends: false}));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUUJy_et9EY4GE5Dn2TS8icgdJxml9NY863mzy2mih8OiJkUquY168-iky1ioa63RmYHpXi8pjAtfWEt',
    'client_secret': 'EHncGNkbsXjtW-oInt85ewuiscwu0U5WKRhztYR91bNyBtJiVu18fkCRTdlKaWs-HiEyNSRQ6jMJinzE'
});

app.get("/", (req, res) => {
    return res.sendFile(__dirname+"/index.html")
});
let price;

app.post("/buy", (req, res) => {
    price = req.body.worth;

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:8080/success",
            "cancel_url": "http://localhost:8080/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "nvidia gtx 1080",
                    "sku": "001",
                    "price": price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": price
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            res.redirect(payment.links[1].href);
        }
    });

    
});

app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": price
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment.payer.payer_info);
            console.log(payment.transactions[0].amount.total);

            res.send("Payment Complete");
        }
    });
});

app.get("/cancel", (req, res) => {
    res.send("Cancelled");
})

app.listen(8080, () => {console.log("UP and Runing")})