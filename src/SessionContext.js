
//
// This class represents a chat context and session info, for use by plugins etc
module.exports = class SessionContext {

    // Constructor
    constructor(storyEvent, sessionState, message) {

        // Represents the current game state for this user
        this.state = sessionState

        // The current game story event
        this.storyEvent = storyEvent

        // The current message text
        this.message = message

    }

}