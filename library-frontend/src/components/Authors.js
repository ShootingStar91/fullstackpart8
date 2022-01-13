import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { ALL_AUTHORS, SET_BIRTHYEAR } from '../queries'

const Authors = (props) => {

  const [authorName, setAuthorName] = useState(null)
  const [born, setBorn] = useState('')

  const [ setBirthyear ] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })

  if (!props.show) {
    return null
  }
  console.log(props)
  if (props.authors.loading) {
    return <div>Loading...</div>
  }
  const authors = props.authors.data.allAuthors
  if (authorName === null) {setAuthorName(authors[0].name)}
  const submit = (event) => {
    event.preventDefault()
    const params = { variables: { name: authorName, born: parseInt(born) } }
    console.log('Trying to set birthyear: ')
    console.log(params)
    setBirthyear(params)

    setBorn('')
    setAuthorName('')
  }


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        
        <select value={authorName} onChange={(event) => setAuthorName(event.target.value)}>
          {authors.map(author => <option value={author.name}>{author.name}</option>)}
        </select>
        
        <input type='number' value={born} onChange={({ target }) => setBorn(target.value)} />
        <button type="submit">set birthyear</button>
      </form>

    </div>
  )
}

export default Authors