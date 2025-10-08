import React, { useEffect, useState } from 'react';
import PageName from '../../../components/PageName';
import { Skeleton, Box, Typography } from '@mui/material';
import NoDataFound from '../../../components/NoDataFound';

const Dormitory = () => {
    const [loading, setLoading] = useState(true);
    const [dormitoryData, setDormitoryData] = useState([]);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            // Example: no data found
            setDormitoryData([]);
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <PageName pageName={[
                {
                    name: 'Dormitory',
                    last: true,
                    address: '/trainee/dormitory'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card">
                                <div className="card-body">

                                    {loading ? (
                                        <Box>
                                            <Skeleton variant="rectangular" height={40} sx={{ mb: 6 }} animation="wave" />
                                            <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} animation="wave" />
                                            <Skeleton variant="rectangular" height={20} animation="wave" />
                                        </Box>
                                    ) : (
                                        <>
                                            {dormitoryData.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" align="center">
                                                    No dormitory data available.
                                                </Typography>
                                            ) : (
                                                dormitoryData.map((item, index) => (
                                                    <div key={index}>
                                                        <h6>{item.name}</h6>
                                                        <p>{item.details}</p>
                                                    </div>
                                                ))
                                            )}
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Dormitory;
