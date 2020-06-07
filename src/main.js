//
// Main event loop for the game

const Config = require('../config')
const SessionContext = require('./SessionContext')
const Game = require('./Game')









// Main code
async function main() {

    // Show header
    console.log('')
    console.log(' +-----------------------------------+')
    console.log(' |        Stuck Inside server        |')
    console.log(' +-----------------------------------+')
    console.log('')

    // Set default config options
    var config = Object.assign({

        // Log an event
        log: (severity, text) => {

            console.log("> " + text)

        }

    }, require('../config'))

    // Start game
    var game = new Game(config)
    await game.start()

}

// Run the game
main()