import React from 'react'
import PageName from '../../../components/PageName';

const EADashboard = () => {
    return (
        <>
            <PageName pageName={[ 
                {
                    'name' : 'Dashboard',
                    'last' : true,
                    'address' : '/dashboard'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    <div className='alert alert-default border mb-0'>
                                        <i className='fas fa-code mr-2'></i> Under Development
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default EADashboard;