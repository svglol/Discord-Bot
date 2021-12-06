export = `
scalar Upload

  type User {
    id: ID!
    username: String
    intro: String
    exit: String
    adminPermission: Boolean
    connections: [Connection!]!
    messages: [Message!]!
    soundboards: [Soundboard!]!
    quotes: [Quote!]!,
    totalQuotes: Float,
    totalMessages: Float,
		totalSoundboards: Float,
		totalConnectionLength: Float,
    lastConnection: Float
  }

  type Message{
    id: ID
   date: Float
  }

  type Quote{
    id: ID
    date: Float
    quote: String
    messageId: String
  }

  type Soundboard{
    id: ID!
   date: Float
    command: String
  }

  type Connection{
    id: ID!
    date: Float
    connectTime: Float
		disconnectTime: Float
		connectionLength: Float
  }

  type SoundCommand{
    id: ID!
    command: String
		file: String
		volume: Float
    date: Float
  }

  type TextCommand{
    id: ID!
    command: String
		link: String
    date: Float
  }

  type Bot{
    totalUsers: Float
    onlineUsers: Float
    connectedUsers: Float
    uptime: Float
  }

  type Server{
    id: ID!
    name: String
  }

  type Channel{
    id: ID!
    name: String
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    soundCommands: [SoundCommand!]!
    textCommands: [TextCommand!]!
    soundCommand(id: ID!): SoundCommand
    textCommand(id: ID!): TextCommand
    userMessages:  [Message!]
		userConnections: [Connection!]
		userSoundboards:  [Soundboard!]
    bot: Bot
    servers: [Server!]
    voiceChannels(id: ID!): [Channel!]
    textChannels(id: ID!): [Channel!]
    soundCommandFileExists(id: ID!) : Boolean
    soundCommandFile(id: ID!) : String
    quotes: [Quote!]!
    quote(id: ID!): Quote
  }

  type Mutation {
    skipSound: String
    stopSound: String
    clear(channel:String!): String
    reset: String
    play(command: String!, channel:String!, server: String!): String
    message(channel: String!, message:String!): String
    updateUser(id: ID!, intro: String, exit: String, adminPermission: Boolean) : User
    deleteTextCommand(id: ID!) : String
    updateTextCommand(id: ID!, command: String, link: String) : TextCommand
    addTextCommand(command: String!, link: String!, date: Float!) : TextCommand
    deleteSoundCommand(id: ID!) : String
    addSoundCommand(command: String!, file: Upload!, volume: Float!, date: Float!) : SoundCommand
    updateSoundCommand(id: ID!,command: String, file: Upload, volume: Float) : SoundCommand
    deleteQuote(id: ID!) : String
  }
`;
