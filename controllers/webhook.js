import { createHmac } from "crypto"
import axios from "axios"

export const validate_sig = async (secret, content, sig) => {
    const hash = await createHmac("sha512", secret).update(JSON.stringify(content)).digest("hex")

    return hash == sig ? true : false
}

export const event_handler = async (content) => {
    console.log(content)
    if(content.event == "subscription.not_renew") {
        return true
    } else if(content.event == "subscription.expiring_cards") {
        return true
    }
}