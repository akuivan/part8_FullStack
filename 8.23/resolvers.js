const jwt = require('jsonwebtoken')
const { GraphQLError, subscribe } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub

const resolvers = {
    Query: {
      bookCount: async () => Book.collection.countDocuments(),
      authorCount: async () => Author.collection.countDocuments(),
      allBooks: async (_, args) => {
        // Build query based on given arguments
        const query = {}
  
        if (args.author) {
          let author = await Author.findOne({ name: args.author })
          if (!author) {
            throw new GraphQLError('Author not found', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
              },
            })
          }
          query.author = author._id
        }
  
        if (args.genre) {
          query.genres = args.genre
        }
        
        return Book.find(query).populate('author')
      },
      allAuthors: async(_, args) => {
        return Author.find({})
      },
      me: (_, args, context) => {
        return context.currentUser
      }
    },
    
    Author: {
      bookCount: async (root) => {
        return Book.countDocuments({ author: root._id })
      },
    },
  
    Mutation: {
      addBook: async (_, args, context) => {
        const currentUser = context.currentUser
    
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
        try {
          // Check if the author already exists
          let author = await Author.findOne({ name: args.author })
          if (!author) {
            try {
              author = new Author({ name: args.author, born: null })
              await author.save()
            } catch (error) {
              throw new GraphQLError(`Couldn't create new author`, {
                extensions: {
                  code: 'BAD_USER_INPUT',
                  invalidArgs: args.author,
                  error
                }
              })
            }
          }  
          
          // Create a new book with the author's ObjectId
          const newBook = new Book({
            title: args.title,
            author: author._id,
            published: args.published,
            genres: args.genres
          })
    
          // Save the new book
          const savedBook = await newBook.save()
    
          // Populate the author field in the saved book
          const populatedBook = await Book.findById(savedBook._id).populate('author')
          
          pubsub.publish('BOOK_ADDED', {bookAdded: populatedBook})

          return populatedBook
  
        } catch (error) {
          throw new GraphQLError('Creating the book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
              error
            }
          })
        }
      },
      editAuthor: async (_, args, context) => {
        const currentUser = context.currentUser
    
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
        // Check if the author already exists
        let author = await Author.findOne({ name: args.name })
        if (!author) {
          throw new GraphQLError(`Author not found, editing author's birthyear failed`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
            },
          })
        }
        // If author exists, then update year of birth
        const updatedAuthor = await Author.findByIdAndUpdate(author._id, {born: args.setBornTo}, {new: true})
        
        return updatedAuthor
      },
      createUser: async (_, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
    
        return user.save()
          .catch(error => {
            throw new GraphQLError('Creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          })
      },
      login: async (_, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'secret' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: { code: 'BAD_USER_INPUT' }
          })        
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
      },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        }
    }
  }

module.exports =resolvers