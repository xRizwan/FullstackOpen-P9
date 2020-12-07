import React, { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_SPECIFIC_BOOKS } from '../queries'

export default function Recommend({ show, favorite }) {
  const [recommended, data] = useLazyQuery(GET_SPECIFIC_BOOKS);

  useEffect(() => {
    recommended({ variables: {genre: favorite ? favorite: null} })
  }, [favorite]) // eslint-disable-line

  if (!show) {
    return null
  }

  if (data.loading) {
    return (
      <div>...LOADING...</div>
    )
  }

  return (
    <>
      <div>
        books in your favorite genre :
        <b>
            {favorite ? favorite : 'all'}
        </b>
      </div>
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
          {data.data && (
            data.data.allBooks
            .map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.username}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}