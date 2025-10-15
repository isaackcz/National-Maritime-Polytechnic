import { Link } from 'react-router-dom';

const PageName = ({ pageName }) => {
    return (
        <>
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12">
                            <nav aria-label="breadcrumb text--fontPos13--xW8hS">
                                <ol className="breadcrumb">
                                    <li key={0} className="breadcrumb-item">
                                        <i className="fas fa-home text-muted"></i>
                                    </li>

                                    { pageName.map((pageName, index) => (
                                        <li key={index + 1} className={`breadcrumb-item ${pageName.last ? 'active' : '' }}`}>
                                            <Link to={pageName.address} className={`${ pageName.last ? '' : 'text-muted' } `}>{ pageName.name }</Link>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </section> 
        </>
    )
}

export default PageName;