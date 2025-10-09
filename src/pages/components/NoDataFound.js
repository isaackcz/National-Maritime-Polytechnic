import React from 'react'

const NoDataFound = ({ message }) => {
    return (
        <>
            <p className='text-center text-muted'>
                <img src='/system-images/no-results-bg.2d2c6ee3.png' height="200" /><br />
                { message }
            </p>
        </>
    )
}

export default NoDataFound;