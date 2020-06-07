module.exports = {

    // Details about the game
    game: require('./game'),

    // Details about the Telegram bot
    bot: {
        token: require('./secrets').botToken
    }

}