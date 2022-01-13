import { useLazyQuery, useQuery } from "@apollo/client"
import React, { useEffect, useState } from "react"
import { ALL_BOOKS, ME } from '../queries'

export const Recommended = (props) => {
  
  const [getCurrentUser, currentUser] = useLazyQuery(ME)
  const [books, setBooks] = useState([])
  const [favoriteGenre, setFavoriteGenre] = useState('')

  const [getBooks, { loading, error, data }] = useLazyQuery(ALL_BOOKS, {
    fetchPolicy: 'network-only'
  })


  useEffect(() => {
    if (!props.show) {
      return
    }
    console.log("currentuser");
    console.log(currentUser);
    if (!currentUser.loading && currentUser.data &&
      currentUser.data.me && currentUser.data.me.favoriteGenre) {
      const newFavoriteGenre = currentUser.data.me.favoriteGenre
      getBooks({ variables: { genre: newFavoriteGenre } })
      setFavoriteGenre(newFavoriteGenre)
    }
  }, [currentUser.loading, currentUser.data, props.show])
  
  useEffect(() => {

    if (!loading && data && data.allBooks) {
      setBooks(data.allBooks)
    }
  }, [data, loading, props.show])

  useEffect(() => {
    if (!props.show) {
      return
    }
    getCurrentUser()
  }, [props.show])
  
  if (!props.show) {
    return null
  }

  if (props.books.loading) {
    return (<div>Loading...</div>)
  }
  
  if (!props.token) {
    return (<div>Login to see recommendations</div>)
  }
  
  return (
    <div>
    <h2>recommendations</h2>
    <div>All books from your favorite genre: <b>{favoriteGenre}</b></div>
    <table>
      <tbody>
        <tr>
          <th>title</th>
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
  </div>

  )
}
