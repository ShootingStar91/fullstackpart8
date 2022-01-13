
import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { ALL_BOOKS } from '../queries'


const Books = (props) => {
  
  const [selectedGenre, setSelectedGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])



  const [getBooks, { loading, error, data }] = useLazyQuery(ALL_BOOKS, {
    fetchPolicy: 'network-only'
  })
  
  useEffect(() => {
    console.log("GET BOOKS");
    getBooks()
  }, [])

  console.log("Books in component root")
  console.log(books);

  useEffect(() => {
    if (genres.length > 0) {
      return
    }
    console.log("Genre redo")
    const genrelist = []
    if (books.length > 0) {
      books.forEach(book => {
        if (book.genres) {
          book.genres.forEach(genre => {
            if (!genrelist.includes(genre.toLowerCase())) {
              genrelist.push(genre.toLowerCase())
            }
          })
      }
    })
    }
    setGenres(genrelist)
    console.log("new genrelist: ", genrelist);
  }, [books])

  useEffect(() => {
    console.log("loading & data: ", loading)
    console.log(data)
    if (!loading && data && data.allBooks) {
      setBooks(data.allBooks)
    }
  }, [data, loading])

  if (!props.show) {
    return null
  }

  if (loading || books.length === 0) {
    return (<div>Loading...</div>)
  }


  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
  
      <div>
        {genres.map(genre => 
          <button type="button" onClick={() => getBooks({ variables: { genre: genre }})}>
            {genre}
          </button>
          )
        }
        <button type="button" onClick={() => getBooks()}>All genres</button>
      </div>
    </div>
  )
}

export default Books