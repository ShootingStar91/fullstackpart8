const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { v1: uuid } = require('uuid')
const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET

mongoose.connect(MONGODB_URI, 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })


/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int,
    bookCount: Int!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

// bookcount poistettu riviltä 97 ??? 
const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let books = await Book.find({})
      if (!args.genre) {
        return books
      }
      if (args.author) {
        books = books.filter(book => book.author.toLowerCase() === args.author.toLowerCase())
      }
      if (args.genre) {
        books = books.filter(book => book.genres.map(genre => genre
          .toLowerCase())
          .includes(args.genre.toLowerCase()))
      }
      console.log("BOOKS")
      console.log(books)
      return books
    },
    allAuthors: async () => await Author.find({}),
    me: (root, args, context) => {
      console.log("context: ");
      console.log(context)
      return context.currentUser
    }
  },
  Book: {
    author: async (root) => {
      const result = await Author.find({ _id: root.author })
      const final_result = result[0].name
      return {name: final_result}
    }
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root })
      if (books === null) {
        return 0
      }
      return books.length

    }
  },
  
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('Login to do that')
      }
      let newAuthor = await Author.find({ name: args.author })
      console.log(newAuthor)
      if (!newAuthor || !newAuthor[0]) {
        newAuthor = new Author({ name: args.author, born: args.born })
        await newAuthor.save().catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
      } else {
        newAuthor = newAuthor[0]
      }
      console.log(newAuthor)
      console.log(args)
      const params = { author: newAuthor._id, title: args.title, published: args.published, genres: args.genres }
      console.log(params)
      const newBook = new Book(params)
      return await newBook.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError('Login to do that')
      }
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      console.log(user)
      return user.save().catch(error => {
        throw new UserInputError(error.message, { invalidArgs: args })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne( { username: args.username } )
      
      if (!user || args.password !== 'secret') {
        throw new UserInputError("Error in login info")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }
      const signResult = { value: jwt.sign(userForToken, SECRET) }
      console.log(signResult)
      return signResult
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
