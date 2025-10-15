import PageName from '../../../components/PageName';

const EAFinished = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Enrollment',
                    'last' : false
                }, 
                {
                    'name' : 'Finished',
                    'last' : true,
                    'address' : '/enrollment-admin/enrollment/finished'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default EAFinished;