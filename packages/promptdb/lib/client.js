const axios = require("axios")

class PromptClient {


    connected = false
    host

    constructor(host = "http://localhost:8000") {
        this.host = host
    }

    check = async () => {
        const { data } = await axios.get(this.host)
        return data.status
    }


}

module.exports = PromptClient