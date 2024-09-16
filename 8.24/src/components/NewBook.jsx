import { useState } from 'react' 
import { ALL_AUTHORS, ALL_BOOKS, CREATE_BOOK } from '../queries' 
import { useMutation } from '@apollo/client' 

const NewBook = (props) => {
  const [title, setTitle] = useState('') 
  const [author, setAuthor] = useState('') 
  const [published, setPublished] = useState('') 
  const [genre, setGenre] = useState('') 
  const [genres, setGenres] = useState([]) 

  const [createBook] = useMutation(CREATE_BOOK, {
    update(cache, { data: { createBook } }) {
      // Update the ALL_BOOKS cache
      const { allBooks } = cache.readQuery({ query: ALL_BOOKS }) 
      cache.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: allBooks.concat(createBook) },
      }) 

      // Update the BOOKS_BY_GENRE cache
      const allGenres = Array.from(new Set(allBooks.concat(createBook).flatMap(book => book.genres))) 
      allGenres.forEach((genre) => {
        cache.writeQuery({
          query: BOOKS_BY_GENRE,
          variables: { genre },
          data: {
            allBooks: allBooks.filter(book => book.genres.includes(genre)).concat(createBook),
          },
        }) 
      }) 

      // Update the ALL_AUTHORS cache
      const { allAuthors } = cache.readQuery({ query: ALL_AUTHORS }) 
      const authorExists = allAuthors.some(a => a.name === createBook.author.name) 
      if (!authorExists) {
        cache.writeQuery({
          query: ALL_AUTHORS,
          data: { allAuthors: allAuthors.concat(createBook.author) },
        }) 
      }
    },
  }) 

  if (!props.show) {
    return null 
  }

  const submit = async (event) => {
    event.preventDefault() 

    // Convert published to an integer
    const publishedInt = parseInt(published, 10) 

    console.log('add book...') 
    await createBook({ variables: { title, author, published: publishedInt, genres } }) 

    setTitle('') 
    setPublished('') 
    setAuthor('') 
    setGenres([]) 
    setGenre('') 
  } 

  const addGenre = () => {
    setGenres(genres.concat(genre)) 
    setGenre('') 
  } 

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  ) 
} 

export default NewBook 
