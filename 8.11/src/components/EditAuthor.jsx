import { useState } from 'react'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../queries'
import { useMutation } from '@apollo/client'

const EditAuthor = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  
  const [editAuthor] = useMutation (EDIT_AUTHOR, {
    refetchQueries: [ 
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS}
   ]
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    // Convert published to an integer
    const bornInt = parseInt(born, 10);

    console.log('edit author...')
    editAuthor({ variables: {name: name, setBornTo: bornInt}})

    setName('')
    setBorn('')
  }


  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor