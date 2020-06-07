//
// Represents a running Telegram game.

const fs = require('fs')
const Telegram = require('./Telegram')

module.exports = class Game {

    // Constructor
    constructor(config) {

        // Store config with default options
        this.config = Object.assign({
            
            // Game ID
            id: 'game'
            
        }, config)

        // Active thread loops for users
        this.userThreads = {}

        // Setup telegram
        this.telegram = new Telegram(this.config.bot.token)

        // Setup database of states
        this.gameStatesLastSave = Date.now()
        this.gameState = {

            // Object of sessions
            sessions: {},

            // Last telegram offset ID
            telegramOffsetID: 0

        }

        // Add IDs to story events
        console.log('> Preparing story events...')
        for (let i = 0 ; i < this.config.game.story.length ; i++)
        this.config.game.story[i].id = this.config.game.story[i].id || i

        // Add 'next' key to story events
        for (let i = 0 ; i < this.config.game.story.length ; i++)
        this.config.game.story[i].next = this.config.game.story[i].next || (this.config.game.story[i+1] && this.config.game.story[i+1].id) || "end"

        // Load states
        this.dbFilename = `state-${this.config.game.id}.db`
        console.log('> Loading current states from ' + this.dbFilename)
        try {
            Object.assign(this.gameState, JSON.parse(fs.readFileSync(this.dbFilename, { encoding: 'utf8' })))
        } catch (err) {}

        // Done
        console.log('> Load complete')

    }

    /** Start the game */
    async start() {

        // Loop forever
        while (true) {

            // Catch errors
            try {

                // Run loop
                await this.loop()

            } catch (e) {

                // Failed!
                console.warn("> Loop failed!", e)

            }

            // Wait a bit
            await new Promise(c => setTimeout(c, 1000))

            // If enough time has passed, save states
            if (this.gameStatesLastSave + 30000 < Date.now()) {
                this.gameStatesLastSave = Date.now()
                fs.writeFileSync(this.dbFilename, JSON.stringify(this.gameState, null, 4))
            }

        }

    }

    /** @private Gets called every second */
    async loop() {

        // Fetch messages
        let updates = await this.telegram.getUpdates(this.gameState.telegramOffsetID)

        // Handle each one
        for (let update of updates) {

            // Ignore if not a message
            if (!update.message)
                continue

            // Store last handled ID
            let newOffset = update.update_id + 1
            if (this.gameState.telegramOffsetID < newOffset)
                this.gameState.telegramOffsetID = newOffset

            // Catch errors
            try {

                // Handle the message
                await this.handleMessage(update)

            } catch (e) {

                // Failed!
                console.warn(`> ${update.message.chat.id} - Message handling failed!`, e)

                // Reply with the error
                await this.telegram.sendMessage(update.message.chat.id, "ERROR: " + e.message)

            }

        }

        // Handle all pending operations for all users
        for (let id of Object.keys(this.gameState.sessions)) {

            // Check if promise is already running for this user
            if (this.userThreads[id])
                continue

            // Start promise for this user
            this.userThreads[id] = this.handleEventLoop(id).catch(e => {

                // Failed!
                console.warn("> Event loop handling failed!", e)

                // Reply with the error
                return this.telegram.sendMessage(id, "ERROR: " + e.message).catch(err => null)

            }).then(e => {

                // Done, remove promise
                this.userThreads[id] = null

            })

        }

    }

    /** @private Handle an individual message */
    async handleMessage(item) {

        // Extract user's context
        let chatID = item.message.chat.id + ""
        let userState = this.gameState.sessions[chatID]
        if (!userState)
            userState = this.gameState.sessions[chatID] = {}

        // Log
        console.log(`> ${chatID} - Incoming message: ${item.message.text}`)

        // Get current event
        let eventID = userState.currentEventID || 0
        let event = this.config.game.story.find(e => e.id == eventID)

        // Create context object for plugins to use
        let ctx = {

            // Incoming message text
            message: item.message.text,

            // Current story event (may be null)
            storyEvent: event,

            // Current user state
            state: userState,

            // Send a message to the user
            say: txt => this.telegram.sendMessage(chatID, txt),

            // Set the user's current story event
            gotoStoryEvent: id => {
                let event = this.config.game.story.find(e => e.id == id || e.if == id)
                let eventID = event && event.id || id
                console.log(`> ${chatID} - Setting current story event: ${eventID}`)
                userState.currentEventID = eventID
            }

        }

        // Go through commands to see if one matches
        for (let cmd of this.config.game.commands) {

            // Run regex
            let match = cmd.regex.exec(item.message.text)
            if (!match)
                continue

            // Matched! Call handler
            await cmd.action(ctx, match)
            return

        }

        // Go through pending replies if any
        for (let reply of userState.pendingReplies || []) {

            // Check if reply matches
            if (reply != item.message.text)
                continue

            // We found a reply! Remove pending replies from state and un-pause
            userState.pendingReplies = null

            // Find the next "if" event that contains this reply
            let eventIndex = this.config.game.story.findIndex(e => e.id == eventID)
            for (let i = eventIndex ; i < this.config.game.story.length ; i++) {

                // Check if matched
                if (this.config.game.story[i].if != reply) 
                    continue

                // Found a matching "if"! This should be our next game event.
                userState.currentEventID = this.config.game.story[i].id
                break

            }

            // Done here
            return

        }

        // Check if the story is waiting for user input of any type
        if (userState.waitingForUserInputForEventID) {

            // Get event
            let inputEvent = this.config.game.story.find(e => e.id == userState.waitingForUserInputForEventID)
            if (!inputEvent)
                throw new Error("Event not found for id " + userState.waitingForUserInputForEventID)

            // Run query
            let match = inputEvent.input.exec(item.message.text)

            // Jump to the place
            if (match && inputEvent.ifMatched)
                await ctx.gotoStoryEvent(inputEvent.ifMatched)
            else if (!match && inputEvent.else)
                await ctx.gotoStoryEvent(inputEvent.else)

            // Run action, if any
            if (inputEvent.do)
                await inputEvent.do(ctx, match)

            // Done
            userState.waitingForUserInputForEventID = null
            return

        }

        // Nothing matched!
        this.config.game.events.onNothingMatched(ctx, item)

    }

    /** @private Handle event loop for a single user. Returns true if the next event should be handled immediately. */
    async handleEventLoop(chatID) {

        // Get user state
        let userState = this.gameState.sessions[chatID]
        if (!userState)
            userState = this.gameState.sessions[chatID] = {}

        // Get current event
        let eventID = userState.currentEventID || 0
        let event = this.config.game.story.find(e => e.id == eventID)
        if (!event)
            return false//throw new Error("No event " + eventID + " found for this user!")

        // Check if paused due to timed event
        if (userState.pausedUntil && userState.pausedUntil > Date.now())
            return false

        // Check if paused while waiting for a reply
        if (userState.pendingReplies || userState.waitingForUserInputForEventID)
            return false

        // Check if paused due to the user pausing the game
        if (userState.userPaused)
            return false

        // Check if this event has text to send
        if (event.text) {

            // Send typing indicator to simulate typing
            if (event.typing !== false) {
                let typingMillis = event.text.length * 100 * this.config.game.typingSpeed
                let typingEndAt = Date.now() + typingMillis
                while (typingEndAt > Date.now()) {
                    await this.telegram.setTyping(chatID)
                    await new Promise(c => setTimeout(c, 1000))
                }
            }

            // Send message
            userState.pendingReplies = event.replies
            await this.telegram.sendMessage(chatID, event.text, event.replies)

        }
        
        // Check if this action should trigger a wait
        if (event.wait) {

            // Pause this game for the specified milliseconds
            console.log(`> ${chatID} - Pausing for ${event.wait}ms`)
            userState.pausedUntil = Date.now() + event.wait

        }

        // Check if this action should show the typing notification
        if (event.typing) {

            // Show it
            await this.telegram.setTyping(chatID)

        }

        // Check if we are waiting for user input of any type
        if (event.input) {

            // Store this state
            userState.waitingForUserInputForEventID = event.id
            return false

        }

        // Check if we should advance to a certain index.
        if (event.goto) {

            // Find the next "if" event
            let eventIndex = this.config.game.story.findIndex(e => e.id == eventID)
            for (let i = eventIndex ; i < this.config.game.story.length ; i++) {

                // Check if matched
                if (this.config.game.story[i].if != event.goto && this.config.game.story[i].id != event.goto) 
                    continue

                // Found a matching "if" or ID! This should be our next game event.
                userState.currentEventID = this.config.game.story[i].id
                console.log(`> ${chatID} - Setting current story event: ${userState.currentEventID}`)
                return true

            }

            // Didn't find it! Try finding the next ID instead
            let newEvent = this.config.game.story.find(e => e.id == event.goto || e.if == event.goto)
            if (!newEvent) throw new Error("Unable to find event ID " + event.goto)
            console.log(`> ${chatID} - Setting current story event: ${newEvent.id}`)
            userState.currentEventID = newEvent.id
            return true

        }

        // Check if should advance to the next event
        if (event.next) {
            userState.currentEventID = event.next
            return true
        }

    }

}