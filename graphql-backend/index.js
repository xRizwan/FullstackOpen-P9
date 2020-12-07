const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const JWT_SECRET = 'SECRETKEY'

const MONGODB_URI='mongodb+srv://rizwan:sasuke12@cluster0.zcnns.mongodb.net/phonebook-app?retryWrites=true&w=majority'

console.log('connecting to ', MONGODB_URI)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('connected to ', MONGODB_URI)
}).catch((err) => {
  console.log('Error connecting to MONGODB ', err.message)
})


const typeDefs = gql`
  type Author {
    name: String!,
    bookCount: Int!,
    born: Int,
    id: ID!,
  }

  type Book {
    title: String!,
    published: Int!,
    author: Author!,
    genres: [String!]!,
    id: ID!,
  }

  type User {
    username: String!,
    id: ID!,
  }

  type Token {
    value: String!,
  }

  type Query {
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!]!,
    allAuthors: [Author!]!,
    me: User,
    deleteAuthors: String,
    deleteBooks: String,
  }

  type Mutation {
    addBook(
      title: String!,
      published: Int!,
      author: String!,
      genres: [String!]!,
    ): Book,
    editAuthor(
      name: String!,
      setBornTo: Int!,
    ): Author,
    createUser(
      username: String!,
    ): User
    login(
      username: String!,
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!,
  }
`

const resolvers = {
  Query: {
    deleteAuthors: async () => {await Author.deleteMany({}); return "Deleted"},
    deleteBooks: async () => {await Book.deleteMany({}); return "Deleted"},
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return await Book.find({ genres: {$in: [args.genre]} }).populate('author')
      }

      if (!args.genre || !args.author) {
        return await Book.find({}).populate('author')
      }
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      let author = await Author.findOne({ name: root.name }).populate("books")
      if (!author) {
        return 0
      }
      return author.books.length
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {

      if (!context.currentUser) {
        throw new UserInputError('Invalid Credentials')
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({name: args.author})
        await author.save()
      }

      let newBook;
      try{
        newBook = new Book({...args, author: author})
        await newBook.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args,
        })
      }

      author.books = author.books.concat(newBook);
      await author.save();

      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })

      return newBook
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new UserInputError('Invalid Credentials')
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      
      try {
        await author.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args,
        })
      }

      return author;
    },
    createUser: (root, args) => {
      const user = new User({username: args.username})

      return user.save()
      .catch(err => {
        throw new UserInputError(err.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      // username is supreme
      // credentials
      /*
        {
          "Authorization": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cHJlbWUiLCJpZCI6IjVmY2QxMDNiMDIyNTAwMTU3OGNlMWQ3YyIsImlhdCI6MTYwNzI3NDY0OH0.nt4Be5l_NSwCRYKkPCnRlyq4ofRTl4N8XcdMtsbR6ug"
        }
      */
      if (!user || args.password !== 'password'){
        throw new UserInputError("Wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')){
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id).populate('friends')
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})