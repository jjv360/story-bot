# Telegram story bot

A simple story bot for Telegram, which allows a player to play through a story and give predetermined responses.

### Running the app

To run the server locally, make sure you have [Node](https://nodejs.org) installed, and then run `npm install` and `npm start`.

If you want to run it forever, install the [Forever Module](https://github.com/foreversd/forever) and run it, like so:

```
# Install it
npm install -g forever

# Start it
forever start src/main.js
```