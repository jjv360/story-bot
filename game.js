module.exports = {

    // Game ID, for database
    id: 'stuck-inside',
    name: "Stuck Inside",
    description: "A story about a person who finds themselves stuck inside a strange building.",

    // Typing speed multiplier
    typingSpeed: 1,

    // Events
    events: {

        // Triggered when the user entered some text which we don't understand
        onNothingMatched: ctx => ctx.say("`Command not recognized.`")

    },

    // Commands
    commands: [

        // Menu command
        {
            regex: /help/i,
            action: async ctx => {
                await ctx.say("You can type these commands: \n\n`help` - This menu\n`start` - Start the game\n`restart` - Restart from the beginning\n`pause` - Pause the game\n`resume` - Resume the game\n`skip time` - If you're impatient")
            }
        },

        // Restart the game
        {
            regex: /restart/i,
            action: async ctx => {
                await ctx.say("`restarting...`")
                await ctx.gotoStoryEvent(0)
            }
        },

        // When "start"ing, do nothing since the event loop should kick in by itself
        {
            regex: /start/i,
            action: ctx => null
        },

        // Debug output state
        {
            regex: /debug state/i,
            action: async ctx => {
                await ctx.say("`" + JSON.stringify(ctx.state, null, 2) + "`")
            }
        },

        // Debug set current story event
        {
            regex: /debug goto (.*)/i,
            action: async (ctx, match) => {
                ctx.state.currentEventID = match[1]
                ctx.state.pendingReplies = null
                ctx.state.pausedUntil = 0
                ctx.state.waitingForUserInputForEventID = null
                await ctx.say("`Setting event ID to " + match[1] + "`")
            }
        },

        // Skip time
        {
            regex: /skip time/i,
            action: async ctx => {
                ctx.state.pausedUntil = 0
                await ctx.say("`Time skip in progress...`")
            }
        },
        
        // Pause the game
        {
            regex: /pause/i,
            action: async ctx => {
                ctx.state.userPaused = true
                await ctx.say("`Time stopped.`")
            }
        },
        
        // Resume the game
        {
            regex: /resume/i,
            action: async ctx => {
                ctx.state.userPaused = false
                await ctx.say("`Time released.`")
            }
        }

    ],

    // Game story events. The events are experienced in sequence, from top to bottom. Each object represents an event, with the keys
    // representing what happens in that event. An event can have multiple keys, but it looks nicer to just have one key per event.
    // Event types are:
    //
    // Text events: 
    // A single key `text` which is sent as a message to the player. Can contain an array of `replies` as well, and if so the player's
    // keyboard will be replaced with a list of these replies they can choose. The game will pause until the user selects one of the replies.
    // The game will automatically pause with the "Typing..." indicator for the text length according to this formula:
    //
    //     (number of characters) * 100 * typingSpeed = time in milliseconds to wait
    //
    // To skip the "Typing..." indicator, you can add `typing: false`.
    //
    // Wait events: 
    // A single key key `wait` represents how long to wait in milliseconds. You can also specify `typing: true` to show the "Typing..." indicator
    // 
    // If (logic) events:
    // A single key `if` containing the text from a reply. The story will jump to this point if this reply is selected by the user.
    //
    // ID events:
    // An event with an `id` key, which can be anything. These are like marker points in the story.
    //
    // GOTO events:
    // An event with a `goto` key, changes the current position of the story. It can be an `id` or an `if` to jump to.
    //
    // Input event:
    // You can wait for arbitrary user input by specifying an `input` key with regex. There must be an `ifMatched` key containing an ID or IF to jump
    // to on match, and an `else` key containing an ID or IF to jump to if not matched. You can also specify a function to execute with the `do` key.
    //
    story: [

        // Intro
        { text: "`Establishing connection, please wait...`", typing: false },
        { wait: 4000 },
        { text: "`Connected.`", typing: false },

        { text: "Hello? Anyone there?" },
        { text: "If anyone can see this message, please reply!", replies: [
            "Who is this?",
            "I am here."
        ]},

            // Protagonist mistakes the player for the person who kidnapped them, by their tone.
            { if: "I am here." },
            { text: "Who are you? Where am I? Why have you taken me here??", replies: [ "I haven't done anything, who are you?" ]},
            { text: "Aren't you the person who brought me here?", replies: [ "No, I'm not. I don't even know you." ]},
            { text: "Oh... Sorry, I thought you were responsible for this..." },

        // Protagonist understands that the player is not related to their situation.
        { if: "Who is this?" },
        { text: "Um... My name is Ben, if you really don't know..."},
        { text: "I seem to be inside a small dark room, I have no idea how I got here or how to get out... Last I remember I was walking home, then I woke up here with a headache." },
        { text: "I'm freaking out a bit here... It's so dark and cold here, I have no idea where I am, there's no windows or doors in this room and my phone has no signal...", replies: [
            "Calm down. Can you describe the room?",
            "How are you talking to me then?"
        ]},

            // Explaining the tablet
            { if: "How are you talking to me then?" },
            { text: "I found this tablet attached to the wall. It seems to have nothing except this one chat app on it."},
            { text: "Maybe there's more to it, but I haven't figured it out yet... It doesn't look like a normal tablet, I can kind of see through it in places. Pretty cool technology I guess...", replies: [
                "Cool... What about the room?"
            ]},

        // Explaining the room
        { text: "It's pretty dark, but there's a bit of light coming from some moss on one of the walls... Yeah, sounds weird I know." },
        { text: "Maybe because there's no light at all, my eyes are adjusting to use even the smallest light source, or something" },
        { text: "Other than that, it's pretty plain... On one wall there's this odd tablet I'm using to talk to you, and the wall next to it is covered in moss. It looks pretty cracked too." },
        { text: "The other two walls are blank." },
        { text: "Actually hold on, I think I see something..." },
        { wait: 4 * 60 * 1000 },

        // Figured out the room's puzzle
        { text: "Ok, so I found out a few things... First, this room wasn't entirely empty, there were some buttons and symbols underneath the place where this tablet was mounted. It looked like the symbol for Pi and a number pad, so I tried entering 3141 and the wall slid away!" },
        { text: "The second thing I found out was that this tablet actually has a map function. There was a square in the bottom-right which didn't seem to do anything, but now that the wall opened the square has changed into the shape of the passage. A little yellow triangle appeared too, and is moving to follow my position." },
        { text: "I'm still extremely worried about who knocked me out and put me in here, and why, but... I don't know, this is kind of fun? It's like an escape room puzzle game!", replies: [
            "It's good to stay positive.",
            "What's down the passage?",
            "Yeah, a game with your life on the line."
        ]},

            // Staying positive
            { if: "It's good to stay positive." },
            { text: "Yeah... I'm still worried, but I'm quite proud of my positive attitude, you know? I can stay calm in almost any situation!" },
            { text: "But, I'm super glad I have your company at least... I'd probably go crazy in the darkness here if I had no one to talk to...", replies: [
                "Don't worry, I'll be here for you.",
                "I'm curious about your situation too."
            ]},

                // Thanks
                { if: "Don't worry, I'll be here for you." },
                { text: "Thanks :)" },
                { goto: "What's down the passage?" },

                // or skip
                { if: "I'm curious about your situation too." },
                { wait: 5 * 1000 },
                { goto: "What's down the passage?" },

            // Worried about danger
            { if: "Yeah, a game with your life on the line." },
            { text: "Why would you say that??" },
            { text: "I'm just trying to stay positive! I know this may be really dangerous, but at least I'll have a better chance if I'm calm about things. You're pretty harsh, huh." },
            { text: "Anyway, about this passage..." },

            // Passage
            { if: "What's down the passage?" },

        // The passage
        { text: "Ok, I'm going to explore the passage for a bit. Chat soon." },
        { wait: 2 * 60 * 1000},
        { text: "There's not much in here. At the end of the passage there's two identical doors. One of them has a little symbol carved into it... The symbol looks like a triangle with a circle inside." },
        { text: "Weird, that... Everything else here looks like it was built with specific detail, but that symbol looks rough, like it was carved in a hurry. I wonder who did that?" },
        { text: "Which door do you think I should try?", replies: [
            "Try the one without the symbol.",
            "Try the one with the symbol.",
            "Why not open both and take a look?"
        ]},

            // Without symbol
            { if: "Try the one without the symbol." },
            { if: "Why not open both and take a look?" },
            { text: "Ok..." },
            { wait: 30 * 1000 },
            { text: "Omg that was terrible! The moment I opened that door, a massive flame burst out of there and almost burnt me! Luckily I opened the door kinda slowly and peeked around it, so the door was mostly still closed when the flame burst came through..." },
            { text: "I can't believe how dangerous this place is!" },
            { wait: 5000 },
            { text: "Ok, I'm going to try the door with the symbol on it now..."},

            // With symbol
            { if: "Try the one with the symbol." },
            { wait: 10 * 1000 },

        // Moving on
        { text: "Ok, nothing dangerous has happened. Looks like the door with the symbol is safe..." },
        { wait: 5 * 60 * 1000 },
        { text: "Wow, finally made it... There was a spiral staircase, and it feels like I just climbed 50 floors up..." },
        { text: "I ended up coming out of a trapdoor into a nicer looking corridor. It's a bit lighter here, which is great..." },
        { text: "All the rooms here look like bedrooms, maybe this was a dorm at some point? Even though the building itself looks abandoned with cracks everywhere and greenery growing on the walls, some of these bedrooms look quite cozy and warm..." },
        { wait: 30 * 1000 },
        { text: "Ok, I'm going to sleep here. I didn't realize how tired I was. Goodnight!", replies: [
            "Ok, goodnight!"
        ]},

        // Sleeping...
        { wait: 5 * 60 * 60 * 1000 },

        // Next morning
        { id: "MORNING1" },
        { text: "Hello? Are you still there?", replies: [
            "I'm here.",
            "Good morning!"
        ]},
        { text: "Good morning! I was worried that you wouldn't be there when I woke up..." },
        { text: "Anyway, I'm glad you're here!" },
        { text: "Ok, I didn't explore this area much yesterday and just sort of collapsed the moment I saw a bed... I'm going to take a quick look around. Maybe there's some food around here...", replies: [
            "Ok.",
            "Be safe."
        ]},

            { if: "Be safe." },
            { text: "Thanks, I will :)" },

            { if: "Ok." },

        { wait: 30 * 60 * 1000 },

        // Exploring the building
        { id: "EXPLORE BUILDING" },
        { text: "This building is huge! There's three floors, two wings and a central area. Both wings are filled with bedrooms! There must be a hundred bedrooms here. There's something else that's weird though..." },
        { text: "Outside the windows I can see a forest, and a starry sky that's quite beautiful actually. But, I'm pretty sure when I went to sleep yesterday it was still night time... Maybe I just didn't sleep for very long? Or maybe I slept for 24 hours straight?" },
        { text: "Anyway... I'm getting pretty hungry here. What do you think I should do? I could go look for food in the forest, or try explore the various rooms in this building and hope there's some food stored here?", replies: [
            "Why not go check out the forest?",
            "Maybe stay for a bit and check the building."
        ]},

            // The building
            { if: "Maybe stay for a bit and check the building." },
            { text: "Yeah, no need to rush. I'll check out the building, and then head into the forest when the sun comes up. Chat later" },
            { wait: 3 * 60 * 60 * 1000 },
            { text: "So I've looked in almost every room here now. I found a kitchen area, and there were some _extremely_ rotten piles of things that may have once been food... Needless to say, I didn't touch them." },
            { text: "This place is pretty strange, there's clear signs of life here, like plates on the tables with rotten food on them, beds that are made up and some that are still unmade... It's like people used to live here, but then suddenly disappeared in the middle of whatever they were doing. It's kind of creepy..." },
            { text: "I also found a library, so I spent a good deal of time there looking to see if there were any clues about where I am. But I couldn't read any of them! They're all in a strange language that I can't understand." },
            { text: "I was quite confident in my language skills, that I'd at least be able to _recognize_ what language it was even if I couldn't read it, but apparently my skills weren't as good as I thought... It all just looks like alien symbols." },
            { text: "It's clear that whatever food may have been here, has long since rotten away. I have no choice but to check out the forest... Even if it's scary to go into there at night..." },
            { text: "Oh yeah, I forgot to mention, it's still night time here! It feels like I've been exploring this building for hours, but the sun still hasn't come up..." },
            { text: "Oh well, into the forest I go!", replies: [
                "Good luck!"
            ]},
            { wait:  30 * 60 * 1000 },
            { goto: "FOREST" },


            // The forest
            { if: "Why not go check out the forest?" },
            { text: "Mmmm... It's kinda scary going into a forest at night, but food and water is necessary, I guess. Ok, here goes..." },
            { wait:  30 * 60 * 1000 },
            { goto: "FOREST" },

        
        // Forest (30 mins in)
        { id: "FOREST" },
        { text: "Hey, you still there?", replies: [
            "Yes.",
            "Hey! I'm here."
        ]},
        { text: "I, um... I reached the end.", replies: [
            "The end of what?"
        ]},
        { text: "The end of the forest... Or the end of the world... I don't really get it..." },
        { text: "It's kind of like, it looks like a cliff except instead of scenery below there's just nothing... Just a sort of black mist. I get the feeling my current situation is worse than just being kidnapped and brought to a strange location..." },
        { text: "I'm going to keep exploring the area for a bit...", replies: [
            "Ok, be careful."
        ]},
        { text: "Thanks, I will" },
        { wait: 30 * 60 * 1000 },

        // Forest, at the door
        { id: "FOREST DOOR" },
        { text: "Ok, here we go! I found something rather interesting.", replies: [
            "What is it?"
        ]},
        { text: "It's a door!", replies: [
            "A door?",
            "In the forest?"
        ]},
        { text: "Yeah! It's set into the side of a small cliff, but it's clearly a small metal door. It has a strange lock on it. The lock looks like a crazy steampunk thing, with gears and things all over the place... It looks like there's also 6 slots with letters I can choose." },
        { text: "I probably need to enter the correct 6-letter password to unlock it. Luckily, there's a note scraped into the metal just under it:" },
        { text: "ROTATE BY 13, PASSWORD: UNLOCK" },
        { text: "There's the little triangle with the circle symbol next to the note as well. I've messed with encryption and things before, this sounds like a simple one... If only I could use Google right now!" },
        { text: "Hey, you can, right? Can you google 'rotate by 13 cipher' for me? Maybe there's even a website which will give you the answer too. The password is UNLOCK apparently. Tell me the answer if you find it." },
        
        // Rot13 puzzle loop
        { id: "ROT13 ASK" },
        { input: /haybpx/i, ifMatched: "ROT13 CORRECT", else: "ROT13 WRONG" },

        { id: "ROT13 WRONG" },
        { text: "Nope, that didn't work." },
        { goto: "ROT13 ASK" },

        { id: "ROT13 CORRECT" },
        { text: "Yes! Looks like that worked. The door is opening now, with a lot of clicking and grinding sounds..." },
        { text: "Looks like it opened up into a small room, maybe a workshop? There's a bed in the corner, and a desk in the other corner which is _covered_ with papers and notes. These seem to be mainly diagrams and notes about old planes and flying machines. Still can't read the words unfortunately..." },
        { text: "I just found another door here. I'm going to look around this place for a bit. Chat later!" },
        { wait: 30 * 60 * 1000 },

        // Exploring the workshop
        { id: "WORKSHOP" },
        { text: "Hey, you there?", replies: [
            "I'm here."
        ]},
        { text: "This place was way bigger than I thought. The door I found led to a massive hangar, with a bunch of old planes and things in pretty terrible condition. This building seems to be on the top of a hill, I took a quick look outside and it's just grass in all directions." },
        { text: "Oh, and the door I came through is gone.", replies: [
            "Gone?"
        ]},
        { text: "Yep. I thought I was going crazy there, I mean who misplaces a door?" },
        { wait: 30 * 1000 },
        { text: "... I've been thinking about this situation of mine here. It feels like I've been put into an escape room type game, except the 'rooms' are like, actual places, or moments in time or something. Like take that last one, it was an old dorm building surrounded by a forest, but at the edge was simply nothing. That was the edge of the 'room'." },
        { text: "So it seems that for each room, I need to first find the puzzle (which itself could be hard, I haven't found this room's one yet), then solve it in order to continue." },
        { text: "I'm a bit at a loss of what to do now. This place is beautiful and peaceful, with the sun shining down on the grassy fields and a soft breeze blowing, but in terms of puzzles and doors, I see nothing of the sort..." },
        { text: "Oh yeah, I forgot to mention, but it's sunny in this 'room'. In that last forest it was night, but as soon as I came though here, it was sunny. Weird, huh. Though, I guess not so weird when you think about it, there's no way an entire hangar could fit inside that small cliff, so that door was clearly a portal to somewhere else."},
        { text: "Yes, I've reached the point where the weather changing by going through a door is the part that makes sense :)" },
        { text: "Any idea on where I'm going to find the exit to this place?", replies: [
            "Have you checked the outside area?",
            "Have you checked the plane diagrams?"
        ]},

            // Exploring outside
            { if: "Have you checked the outside area?" },
            { text: "You mean the grassy fields? No, it kind of looks like they go on forever, I only checked directly outside the hangar. I guess I can maybe take a walk out there and see what happens... Chat soon!", replies: ["Good luck!"] },
            { wait: 1 * 60 * 60 * 1000 },
            { text: "Ok, I've been walking for like an hour now in a straight line, and I'm getting nowhere. I can still see the hangar behind me, but there's absolutely nothing else here, not even the 'end of the room' I was kind of expecting. Though maybe it's just really far away this time..." },
            { text: "I'm going to go back. I still haven't really gone over all the papers and things in that workshop, maybe the puzzle is written down somewhere :/" },
            { wait: 1 * 60 * 60 * 1000 },
            { text: "Ok, back again... I'm going to check those papers now." },
            { goto: "PLANE PUZZLE" },

            // The plane diagrams
            { if: "Have you checked the plane diagrams?" },
            { text: "No... Why? You think maybe there's a clue there? Well, there's nothing else around here, so it's worth a shot..." },
        
        // Doing the puzzle
        { id: "PLANE PUZZLE" },
        { wait: 45 * 60 * 1000 },
        { text: "Ok, enough of this, my head hurts... I've been trying to decipher the language written here based on the pictures drawn next to the notes, but it's so difficult... I think I've gotten the words for propellor, wing, fuel, etc, but how does that help?" },
        { text: "I did notice something though, one of the planes' in the hangar matches up with the diagram that was on the top of this stack of papers. I took it out to compare, and it looks like all the pieces for the engine are here, it's simply scattered around and not put together correctly." },
        { text: "The diagram is super detailed, even without being able to read the notes. It's kind of like a very heavy and complicated jigsaw puzzle... You don't think... Maybe this is the 'puzzle' that I have to solve?", replies: [
            "Could be."
        ]},
        { text: "Ugh... Fixing this thing is going to be a mission... Alright, I'll give it a shot..." },
        { wait: 4 * 60 * 60 * 1000 },
        { text: "It was! It really was! Hey, you there?", replies: [
            "What was?"
        ]},
        { text: "The puzzle! As soon as I put the last piece in place, there was a _thunk_ sound, and when I looked a door had appeared down by the workshop. I almost missed it, it looks so natural there... Ok, time to see what the next room is like!", replies: [
            "Are you having fun?",
            "I'm excited too, open it already!"
        ]},

            { if: "Are you having fun?" },
            { text: "Well, yeah! I love escape room games, and this is on a whole different level. Puzzles that take you all around the world, new things to see all the time, it's a real adventure!", replies: [
                "What about getting back home?"
            ]},
            { wait: 30 * 1000 },
            { text: "Yeah...", replies: ["... want to check out the next room?"] },
            { text: "Yeah. I'm opening the door now." },

        { if: "I'm excited too, open it already!" },
        { text: "Ok, here goes..." },
        { wait: 60 * 1000 },

        // Floating island
        { id: "FLOATING ISLAND" },
        { text: "Wow... Just, wow...", replies: [
            "What is it?"
        ]},
        { text: "I think I'm standing on clouds..." },
        { wait: 10 * 1000 },
        { text: "Well, ok, I'm standing on tiles. But there are clouds all around! It's like a kind of circular little island (tiled for some reason), floating in the sky. I know it's floating, because I'm standing right on the edge (yes, the door I came through is gone), and over the edge if I look down is nothing but blue sky, and clouds..." },
        { text: "I don't know how it's possible to have a sky without any ground, but clearly that's what this is... I'm on a little island, floating in an endless sky..." },
        { text: "I see a building on the other side though. I'm going to check it out. Chat later", replies: [
            "Ok, good luck with finding the puzzle!"
        ]},
        { text: "Thanks :)" },
        { wait: 30 * 60 * 1000 },
        { text: "I found out a few things about this place. This tiny island is entirely covered in white stone tiles, there's nothing else here except that building. The building is also tiny, with a living area (judging by the table and chairs) and a tiny bedroom. Also, there's someone here! This is the first time I've met someone here.", replies: [ "Who is it?" ] },
        { text: "I'm not actually sure, he speaks with such an accent I can't understand half the things he's saying. He looks super old, like maybe 100 years old or something. He seemed surprised to see me, and through his ranting he kept asking me why I came here. As if I had a choice!" },
        { text: "Since there's nothing here that could even remotely be a puzzle, I'm going to try talk to this old man for a while, see if I can decipher his accent... Chat soon." },
        { wait: 30 * 60 * 1000 },
        { text: "Ok, this old man is giving me a headache. I've talked to him all I can, and I'm sitting outside now. If I had to spend another minute in there, my head would explode." },
        { text: "I think he's been stuck here for years, the poor guy. His mind is gone, he keeps rambling on about weird things, just holding a conversation with him is tiring. It felt like _I_ would go crazy too, if I spent any more time with him..." },
        { text: "Though he did say some interesting things. He calls this place the Lane, he asked me at one point 'Why would you choose to travel the Lane?'... I tried to tell him I was brought here and I don't know how to leave, but he didn't believe me. He said it's not possible to be trapped here, and if I wanted to leave I should just 'make a door.' What does that even mean?", replies: [
            "Maybe draw one on a wall or something?"
        ]},
        { text: "Hmm... Well, it's worth a shot. I'll go look for something to draw with in the old guy's room."},
        { wait: 5 * 60 * 1000 },
        { text: "Well what can I say, it worked. Well, I draw a door, and was able to grab the knob and open it. However it's just a pitch black hole now. When the old man saw it, he just gave me an odd look and said 'do you even want to leave?' and walked off. Of course I want to leave!" },
        { text: "But this... I'm kind of worried about stepping into this black puddle behind the door here. What do you think?", replies: [
            "Just go for it. No pain, no gain.",
            "Better try find another way, it sounds dangerous."
        ]},

            // Find another way
            { if: "Better try find another way, it sounds dangerous." },
            { text: "Yeah. Though, there's literally nothing else here, and the old man is no help. The only thing I haven't tried is jumping off the edge..." },
            { wait: 30 * 60 * 1000 },
            { text: "With no other choise, I spoke to the old man again, and he says it's impossible to die here. So, that means jumping of the edge is a possibility? Maybe it's less of a puzzle, and more that I just need to find the courage to take a leap of faith.", replies: [
                "If there's no risk, why not try jumping then?",
                "If you're going to risk it anyway, why not try the black door?"
            ]},

                // Black door
                { if: "If you're going to risk it anyway, why not try the black door?" },
                { text: "Ok, yeah..." },
                { goto: "DARK ROOM" },

                // Jump off the edge
                { if: "If there's no risk, why not try jumping then?"},
                { text: "Really?" },
                { text: "Well there truly is nothing else here to do, so... Here goes, I guess..." },
                { wait: 30 * 1000 },
                { text: "Turns out jumping isn't an option. I just appeared above the island again after falling a short distance, and it didn't even hurt when I hit the ground. Weird... I guess the black door is my only choice now." },
                { goto: "DARK ROOM" },
        
        // Continuing
        { id: "DARK ROOM" },
        { if: "Just go for it. No pain, no gain." },
        { text: "This place is unreal... It's completely black, I can't see anything at all, and I'm walking on a thin layer of water. I'm using the light of the tablet's screen, but it's still so dark..." },
        { text: "I guess I'll walk around for a bit. I'll send you a message if I see anything.", replies: [ "Good luck!" ]},
        { wait: 10 * 60 * 1000 },
        { text: "Hey, I found a piece of a wall sticking out of the water. It's pretty strange, there's nothing else around, just this broken wall... Anyway, I tried drawing a door on it, but it just opens to this black space again. I'm starting to get worried..." },
        { text: "What if I never find the way out? What if I'm stuck here forever?", replies: [
            "Have you tried making a door to somewhere else?"
        ]},
        { text: "What do you mean?", replies: [ "The old man said you can go home by making a door... Maybe you can go back to the island by making a door there?" ]},
        { text: "Hmm, it's true that I wasn't really thinking of a destination when I made the door this time... Let me try that." },
        { wait: 30 * 1000 },
        { text: "It worked! I thought about the island while making the door, and the door took me there! I'm back in the light!", replies: ["Nice."]},
        { text: "I wonder if I can go anywhere like this? I'm going to try something..." },
        { wait: 30 * 1000 },
        { text: "Yes! I made a door back to that forest, and it worked! I really can go anywhere... I wonder if I can make one to take me to the next puzzle...", replies: [
            "What about going home?"
        ]},
        { text: "I tried that, it just opened into that dark space.", replies: [
            "It also opened into that space when you weren't thinking of a destination... Maybe you just need to visualize your home better?"
        ]},
        { text: "Yeah... I guess I need to be honest with you... I don't really need to go back...", replies: ["What do you mean?"] },
        { text: "There's nothing for me there. There's no point in going back now.", replies: [ "What about your family, or friends?"] },
        { text: "You don't understand, i" },
        { wait: 10 * 1000 },
        { text: "No, I guess you're right, there are people who would worry... I was so excited when I found out I have the ability to open these doors to anywhere, and I was having so much fun with the puzzles here... I'm going to miss this place..." },
        { text: "This is assuming it actually works in the first place. I guess I should try that first. Here goes..." },
        { wait: 30 * 1000 },
        { text: "It worked...", replies: ["You can go home now?"]},
        { text: "Yeah, if I step through this door my adventure will be over. I really don't want to leave...", replies: [
            "You should go.",
            "If you don't want to, then don't."
        ]},

            // Go home
            { id: "GOING HOME" },
            { if: "You should go." },
            { text: "Yeah... In case this tablet doesn't work out there in the real world, I guess I'll say goodbye... Thanks for everything. Really. Just talking has been a huge help, I'm not sure I'd have been totally sane going through all that by myself...", replies: ["It's been a crazy trip, I'm glad I could experience it with you."]},
            { text: "Yeah :) Ok, here goes..." },
            { wait: 15 * 60 * 1000 },

            { text: "Hey, you still there?", replies: ["Hey! That tablet is still working?"]},
            { text: "Yeah! Although it has a battery symbol that's flashing now, so I guess it won't last for much longer... I don't even know how to charge this thing, it doesn't have a port of any kind. But I'm home! And you're right, it was a good choice to come back. My family was worried, they were crying when they saw me... I'm glad I didn't choose to abandon them..."},
            { text: "And guess what, my door making ability still works! I never expected that. I can pretty much teleport myself anywhere now! Well, anywhere I've been before and can visualize clearly... I went to my old school, I went to my friend's place, and it was easy.", replies: ["Wow, that's amazing!"]},
            { text: "Yeah! Ok, I'm going to experiment with it a bit more, maybe even show my friend, who knows... Bye!", replies: ["Bye!"]},
            { wait: 15 * 60 * 1000 },
            { text: "`Connection to candidate 23 has been lost.`", typing: false },
            { goto: "END" },

        // Stay
        { id: "WITCH HOUSE" },
        { if: "If you don't want to, then don't." },
        { text: "Yeah, exactly! I want to explore everything here, see all sorts of new puzzles and things. This door ability is my power, I can use it how I want!" },
        { text: "I'm so excited! Ok, I'm going to try think about 'the next room' now when I make a door, and see if that works.", replies: ["Good luck."]},
        { wait: 15 * 1000 },
        { text: "Yes, it opened to somewhere new! I'm in a forest again, but it's nothing like that other one. For one thing, it's a bright sunny day, and there's a run-down old cottage in front of me... It kind of looks like a witch lives here, hah. I'm going to go check it out. Chat later!", replies: ["Ok, be careful."] },
        { wait: 15 * 60 * 1000 },
        { text: "Yep, a witch did live here. Or at least, an old lady who just so happens to be wearing all black and has a cauldron in her kitchen... She seems quite nice though, and even though she seemed a bit surprised by my visit, she still welcomed me. It's nice to know there are good people in this place..." },
        { text: "She also doesn't seem nearly as crazy as that old man... Oh no, I just noticed the tablet has a flashing battery icon, is it about to die? I have no way of charging it...", replies: ["Oh no, if it dies I won't get to hear about your adventures!"]},
        { text: "Yeah, and I'll really miss talking to you as well... It's been so fun, having an adventure with you by my side, always ready to talk... In case I can't find a way of charging this thing, I guess I should say goodbye... And thanks for being there for me, I'm not sure I'd have stayed sane if it weren't for you...", replies: [
            "Yeah, it's been fun. I'm going to miss talking to you..."
        ]},
        { text: "Yeah, me too... Anyway, onto lighter topics I guess..." },
        { text: "I was talking to the old lady for a bit, and it turns out she lives out here by herself and it's really far from the nearby town, which is why she was surprised to see me. She thought I was a spirit or something!"},
        { text: "It's odd for an entire town to be inside one of these 'rooms', don't you think? Maybe I'll go check it out later... It turns out she goes to town to sell herbs and homemade medicine (she's totally a witch), and she buys food from there every so often. She said she's going again tomorrow and I can come with her.", replies: ["So she's letting you stay for the night?"]},
        { text: "Yeah, and she's even giving me food. She said I can stay as long as I like... Which is great, since I can open the door to anywhere, if I want to come back here to relax for a while, I'll always be able to. That's a really comforting thought..."},
        { text: "Anyway, I'm going to look around the area for a bit. Bye!", replies: ["Bye, good luck!"]},
        { text: "`Connection to candidate 23 has been lost.`", typing: false },
        { goto: "END" },

    ]

}