import axios from "axios"

export const get_sub = async (secret, email) => {
    console.log(email)
    try {
        const response = await axios.get(`https://api.paystack.co/subscription`,
            {
                headers : {
                    "Authorization" : `Bearer ${secret}`,
                    "Content-Type" : "application/json"
                }
            }
        )
    
        const res = response.data

        const data = res.data.filter(data => data.customer.email == email)
        console.log(data)

        return data
    } catch (error) {
        console.log(error)
    }
}

export const cancel_sub = async (secret, params) => {
    console.log(params)
    try {
        const response = await axios.post(`https://api.paystack.co/subscription/disable`, params,
            {
                headers : {
                    "Authorization" : `Bearer ${secret}`,
                    "Content-Type" : "application/json"
                }
            }
        )
    
        const res = response.data

        return res
    } catch (error) {
        console.log(error)
    }
}