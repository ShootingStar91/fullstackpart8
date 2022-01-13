import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'
import { ApolloClient, HttpLink, InMemoryCache, gql, useQuery, useApolloClient } from '@apollo/client'
import LoginForm from './components/LoginForm'
import { Recommended } from './components/Recommended'

const App = () => {
  const [page, setPage] = useState('authors')
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const [genres, setGenres] = useState([])

  useEffect(() => {
      const fetchedToken = localStorage.getItem('libraryapp-token')
      console.log("TOKEN", fetchedToken)
      setToken(fetchedToken)
      if (!books.loading && books.data.allBooks) {
        const genrelist = genres
        books.data.allBooks.forEach(book => {
          if (book.genre) {
            if (!genrelist.includes(book.genre.toLowerCase())) {
              genrelist.push(book.genre.toLowerCase())
            }
          }
        })
        setGenres(genrelist)
    }
  }, [books.loading, books.data])

  const loginSuccessful = (newToken) => {
    setToken(newToken)
    console.log(newToken)
    localStorage.setItem('libraryapp-token', newToken)
    setPage('books')
  }

  const logout = (logout) => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('login')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        {token ? <button onClick={() => logout()}>logout</button> :
                 <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors
        show={page === 'authors'}
        authors={authors}
      />

      <Books
        show={page === 'books'}
        genres={genres}
      />

      <NewBook
        show={page === 'add'}
        token={token}
      />

      <Recommended show={page === 'recommended'} books={books} token={token} />

      <LoginForm show={page === 'login'} loginSuccessful={loginSuccessful} />

      

    </div>
  )
}

export default App