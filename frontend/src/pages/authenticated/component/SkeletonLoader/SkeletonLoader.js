import './SkeletonLoader.css';

const SkeletonLoader = ({ onViewMode }) => {
    return (
        <>
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className={`card w-100 ${onViewMode === 'update' && 'm-0 elevation-0'}`}>
                                <div className='card-body'>
                                    <div className="skeleton-image" style={{ 'width': '100%', 'height': '70px' }}></div>
                                    <br />
                                    <div className="skeleton-text mb-1" style={{ 'width': '80%', 'height': '20px' }}></div>
                                    <div className="skeleton-text mb-1" style={{ 'width': '100%', 'height': '20px' }}></div>
                                    <div className="skeleton-text mb-1" style={{ 'width': '50%', 'height': '20px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SkeletonLoader;