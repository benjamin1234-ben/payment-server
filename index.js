import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv"
import { init_payment, verify_payment } from "./controllers/payment.js"
import { cancel_sub, get_sub } from "./controllers/subscription.js"
import { event_handler, validate_sig } from "./controllers/webhook.js"

dotenv.config()

const { PAYSTACK_SECRET_KEY, PORT, MONTHLY_PLAN, QUARTERLY_PLAN, BIANNUAL_PLAN, ANNUAL_PLAN } = process.env
const plans = {
    monthly : MONTHLY_PLAN,
    quarterly : QUARTERLY_PLAN,
    biannually : BIANNUAL_PLAN,
    annually : ANNUAL_PLAN
}

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get("/init/:email/:plan", async (req, res) => {
    const params = {
        email : req.params.email,
        amount : 20000,
        plan : plans[req.params.plan]
    }

    const payment = await init_payment(PAYSTACK_SECRET_KEY, params)
    const uri = payment.data.authorization_url
    const ref = payment.data.reference

    return res.json({ uri, ref })
})

app.get("/verify/:ref", async (req, res) => {
    const payment = await verify_payment(PAYSTACK_SECRET_KEY, req.params.ref)

    if(payment.data.status == "success") {
        return res.send("Success")
    } else {
        return res.send("Fail")
    }
})

app.get("/subscription/:email", async (req, res) => {
    const subscription = await get_sub(PAYSTACK_SECRET_KEY, req.params.email)
    console.log(subscription[0])
    
    return res.json({
        sub_code : subscription[0].subscription_code,
        email_token :  subscription[0].email_token
    })
})

app.get("cancel/:sub_code/:email_token", async (req, res) => {
    const params = {
        sub_code : req.params.sub_code,
        email_token : req.params.email_token
    }

    const sub = await cancel_sub(PAYSTACK_SECRET_KEY, params)

    return sub.status == true ? res.send("Success") : res.send("Fail")
})

app.post("/webhook", async (req, res) => {
    const content = req.body
    const sig = req.headers["x-paystack-signature"]
    const validate = await validate_sig(PAYSTACK_SECRET_KEY, content, sig)

    if(validate) {
        await event_handler(content)
        return res.send(200)
    }

    return res.send(400)
})

app.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`Connection at ${PORT} is successful.`)
})