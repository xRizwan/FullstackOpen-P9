
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { useApolloClient, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null);
  const [favorite, setFavorite] = useState(null);
  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })

    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`Added ${addedBook.title} by ${addedBook.author.name}`)
      updateCacheWith(addedBook)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useEffect(() => {
    if (token === null) {
      const storedToken = localStorage.getItem('library-user')
      setToken(storedToken);
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const fav = localStorage.getItem('library-recommend')
    setFavorite(fav);
  }, []) // eslint-disable-line

  return (
    <div>
      <div>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('authors')}>authors</button>
        {token !== null && (
          <>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </>
        )}
      </div>

      {token === null && (
        <LoginForm setToken={setToken} />
      )}

      <Authors
        show={page === 'authors'}
        token={token}
      />

      <Books
        show={page === 'books'}
        setFavorite={setFavorite}
      />

      <NewBook
        show={page === 'add'}
        favorite={favorite}
      />

      <Recommend
        show={page === 'recommend'}
        favorite={favorite}
      />

    </div>
  )
}

export default App