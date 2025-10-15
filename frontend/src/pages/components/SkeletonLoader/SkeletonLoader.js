import { Box, Skeleton } from '@mui/material';

const SkeletonLoader = ({ onViewMode }) => {
    return (
        <>
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className={`card w-100 ${onViewMode === 'update' && 'm-0 elevation-0'}`}>
                                <div className='card-body'>
                                    <Box>
                                        <Skeleton />
                                        <Skeleton animation="wave" />
                                        <Skeleton animation={false} />
                                    </Box>
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