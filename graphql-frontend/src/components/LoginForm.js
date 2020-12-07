import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

export default function LoginForm({setToken}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null);
    const [login, result] = useMutation(LOGIN, {
        onError: (err) => {
            setError(err.graphQLErrors[0].message)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('library-user', token)
        }

    }, [result.data]) // eslint-disable-line

    const handleSubmit = (e) => {
        e.preventDefault()

        login({
            variables: {username, password}
        })
    }


    return (
        <form onSubmit={handleSubmit}>
            {error}
            <div>
                username
                <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
            </div>
            <div>
                password
                <input type="text" value={password} onChange={({ target }) => setPassword(target.value)} />
            </div>
            <button type="submit">Login</button>
        </form>
    )
}