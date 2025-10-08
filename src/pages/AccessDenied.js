import { Link } from 'react-router-dom';

const AccessDenied = () => {
    return (
        <>
            <p className='text-center mt-5'>
                <span className='material-icons-outlined text-danger' style={{ fontSize: '3.5rem' }}>link_off</span>
                <h1 className='text-bold' style={{ fontSize: '3.5rem' }}>Page Not Found</h1>
                YOU DO NOT HAVE ENOUGH PERMISSION TO ACCESS THIS PAGE OR THE PAGE IS BROKEN. <br/>

                <Link className='btn btn-primary elevation-1 text--fontPos13--xW8hS mt-4' to="/">LOGIN INSTEAD</Link>
            </p>
        </>
    )
}

export default AccessDenied;
