import { gql } from '@apollo/client'

export const BOOK_DETAILS = gql`
    fragment BookDetails on Book{
        id,
        title,
        published,
        author {
            name,
        },
        genres,
    }
`

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name,
            born,
            bookCount,
            id,
        }
    }
`

export const ALL_BOOKS = gql`
    query {
        allBooks {
            title,
            published,
            author {
                name,
            },
            genres,
        }
    }
`

export const GET_SPECIFIC_BOOKS = gql`
    query getBooks ($genre: String!) {
        allBooks(
            genre: $genre
        ) {
            title,
            published,
            author {
                name,
            },
            genres,
        }
    }
`

export const CREATE_BOOK = gql`
    mutation createBook ($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
        addBook(
            title: $title,
            published: $published,
            author: $author,
            genres: $genres,
        ) {
            title,
            published,
            author {name,},
            genres
        }
    }
`

export const EDIT_AUTHOR = gql`
    mutation editAuthor ($name: String!, $year: Int!) {
        editAuthor (
            name: $name,
            setBornTo: $year,
        ) {
            name,
            born
        }
    }
`

export const LOGIN = gql`
    mutation login ($username: String!, $password: String!) {
        login (
            username: $username,
            password: $password
        ) {
            value
        }
    }
`

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`