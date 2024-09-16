import { useQuery } from '@apollo/client'
import { BOOKS_BY_GENRE, ME } from '../queries'

const Recommended = ({ show }) => {
  // Fetch current user data
  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(ME, {
    fetchPolicy: 'network-only' // Fetch fresh data after login
  })

  // Fetch books based on the user's favorite genre
  const favoriteGenre = userData?.me?.favoriteGenre
  console.log("Favorite genre: ", favoriteGenre)

  const { data: booksData, loading: booksLoading } = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre, // Skip the query if favorite genre is not loaded yet
  })

  if (!show) {
    return null
  }

  if (userLoading || booksLoading) {
    return <div>Loading...</div>
  }

  const books = booksData?.allBooks || []

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre: <b>{favoriteGenre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended
