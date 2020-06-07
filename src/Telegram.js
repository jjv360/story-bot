//
// Functions relating to telegram

const fetch = require('node-fetch')

module.exports = class Telegram {

    // Constructor
    constructor(botToken) {

        // Store token
        this.token = botToken

    }

    // Send a message via Telegram
    async sendMessage(chatID, msg, customReplies) {

        // Escape special characters
        console.log(`> ${chatID} - Sending message: ${msg}`)
        msg = msg.replace(/[-!\.\(\)]/gi, "\\$&")

        // Create messsage URL
        let url = `https://api.telegram.org/bot${this.token}/sendMessage`
            + `?chat_id=${encodeURIComponent(chatID)}`
            + `&text=${encodeURIComponent(msg)}`
            + `&parse_mode=MarkdownV2`
        
        // Add reply options if any
        if (customReplies) {
            url = url + '&reply_markup=' + encodeURIComponent(JSON.stringify({
                one_time_keyboard: true,
                keyboard: customReplies.map(r => [r])
            }))
        }

        // Do it
        let response = await fetch(url).then(req => req.json())
        if (!response.ok)
            throw new Error('Telegram request failed. ' + response.description)

    }

    // Fetch pending messages
    async getUpdates(offset) {

        // Fetch messages
        let response = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${offset}`).then(req => req.json())
        if (!response.ok)
            throw new Error('Telegram request failed. ' + response.description)

        // Done
        return response.result
            
    }

    // Send typing status
    async setTyping(chatID) {

        // Fetch messages
        console.log(`> ${chatID} - Sending typing indicator`)
        let response = await fetch(`https://api.telegram.org/bot${this.token}/sendChatAction?chat_id=${chatID}&action=typing`).then(req => req.json())
        if (!response.ok)
            throw new Error('Telegram request failed. ' + response.description)

    }

}