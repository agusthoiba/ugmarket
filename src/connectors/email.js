const axios = require('axios');

class Email {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async send({ from, to, subject, html }) {
        await axios.post(
            'https://api.resend.com/emails',
            { from, to, subject, html },
            { headers: { Authorization: `Bearer ${this.apiKey}` } }
        );
        return true;
    }
}

module.exports = Email;
