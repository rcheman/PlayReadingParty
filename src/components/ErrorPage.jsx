import React from 'react';
import { useRouteError} from 'react-router-dom';


const ErrorPage = () => {
  const error = useRouteError()
  console.error(error)
  return (
    <div className='errorPage'>
      <h1>Page Not Found</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>Error message: {error.statusText || error.message}</i>
      </p>
    </div>

  )
}

export default ErrorPage