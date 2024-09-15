import { useState } from 'react' 
import { useQuery } from '@apollo/client' 
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries' 

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null) 

  const { loading: allBooksLoading, data: allBooksData } = useQuery(ALL_BOOKS) 
  const { loading: booksByGenreLoading, data: booksByGenreData } = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: selectedGenre },
    skip: !selectedGenre,
  }) 

  if (!props.show) {
    return null 
  }

  if (allBooksLoading || (selectedGenre && booksByGenreLoading)) {
    return <div>loading...</div> 
  }

  const books = selectedGenre ? booksByGenreData.allBooks : allBooksData.allBooks 

  // Extract genres from all books
  const allGenres = Array.from(new Set(allBooksData.allBooks.flatMap(book => book.genres))) 

  return (
    <div>
      <h2>books</h2>
      <p>In genre: <b>{selectedGenre ? selectedGenre : 'all genres'}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(book => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {allGenres.map(genre => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  ) 
} 

export default Books 
