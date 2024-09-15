import { useState } from 'react'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../queries'
import { useQuery, useMutation } from '@apollo/client'
import Select from 'react-select'

const EditAuthor = (props) => {
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [born, setBorn] = useState('')
   
  const result = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation (EDIT_AUTHOR, {
    refetchQueries: [ 
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS}
   ]
  })

  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!selectedAuthor) {
      return
    }

    // Convert published to an integer
    const bornInt = parseInt(born, 10);

    console.log('edit author...')
    editAuthor({ variables: {name: selectedAuthor.value, setBornTo: bornInt}})

    setSelectedAuthor(null)
    setBorn('')
  }
  
  const authorOptions = result.data.allAuthors.map((a) => ({
    value: a.name,
    label: a.name,
  }))

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            options= {authorOptions}
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