import React from 'react'

export default function Filter({ filter }) {

    if (filter === '') {
        return <div>selected filter is : All </div>
    }
    
    return (
        <div>selected filter is : {filter} </div>
    )
}