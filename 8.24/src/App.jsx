import { useState } from "react" 
import Authors from "./components/Authors" 
import Books from "./components/Books" 
import NewBook from "./components/NewBook" 
import EditAuthor from "./components/EditAuthor" 
import LoginForm from "./components/LoginForm" 
import Recommended from "./components/Recommended" 
import { useApolloClient, useSubscription } from "@apollo/client" 
import { BOOK_ADDED } from "./queries"

const App = () => {
  const [page, setPage] = useState("authors") 
  const [token, setToken] = useState(null) 
  const client = useApolloClient() 

  const logout = () => {
    setToken(null) 
    localStorage.clear() 
    client.resetStore() 
    setPage("authors")  // Redirect to authors page after logout
  } 

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data?.data?.bookAdded

      window.alert(`New book called "${addedBook.title}" has been added.`)
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("edit")}>edit author</button>
            <button onClick={() => setPage("recommended")}>recommended</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      {page === "authors" && <Authors show={true} />}
      {page === "books" && <Books show={true} />}
      {page === "add" && token && <NewBook show={true} />}
      {page === "edit" && token && <EditAuthor show={true} />}
      {page === "login" && <LoginForm show={true} setToken={setToken} />}
      {page === "recommended" && token && <Recommended show={true} />}
    </div>
  ) 
} 

export default App 
