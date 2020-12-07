import React, { useState } from 'react'
import { ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client'
import Filter from './Filter';

const Books = (props) => {
  const [filter, setFilter] = useState('');
  const books = useQuery(ALL_BOOKS)

  const handleFilter = (val) => {
    setFilter(val)
    localStorage.setItem('library-recommend', val)
    props.setFavorite(val);
  }

  if (!props.show) {
    return null
  }

  if (books.loading) {
    return (
      <div>...LOADING...</div>
    )
  }
  console.log(books);

  return (
    <div>
      <h2>books</h2>

      <Filter filter={filter} />
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
          {books.data && (
            books.data.allBooks
            .filter(book => book.genres.filter(genre => genre.includes(filter)).length > 0)
            .map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.username}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {books.data && (
        books.data.allBooks
        .map(a => a.genres))
        .map(a => a.map(genre => <button key={genre} onClick={() => handleFilter(genre)}>{genre}</button>))
      }
      <button onClick={() => setFilter("")}>All</button>
    </div>
  )
}

export default Books