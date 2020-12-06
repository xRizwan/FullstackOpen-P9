import React, { useState } from 'react'
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'
import { useMutation } from '@apollo/client'

export default function EditForm({ data }) {
    const [name, setName] = useState(!!data[0] ? data[0].name : '');
    const [year, setYear] = useState('');
    const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [ {query: ALL_AUTHORS} ]
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log('editing author')

        editAuthor({ variables: {name, year: parseInt(year)} })

        setYear('')
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                Name
                <select value={name} onChange={({ target }) => setName(target.value)} >
                    {data.map((author) => (
                        <option key={author.id} value={author.name}>{author.name}</option>)
                    )}
                </select>
                {/* <input type="text" value={name} onChange={({ target }) => setName(target.value)} /> */}
            </div>
            <div>
                Year
                <input type="number" value={year} onChange={({ target }) => setYear(target.value)} />
            </div>
            <input type="submit" />
        </form>
    )
}