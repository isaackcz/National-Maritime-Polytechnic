import PageName from '../../../components/PageName';

const Certificate = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Certificate',
                    'last' : true,
                    'address' : '/trainee/certificate'
                }
            ]}/>

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card">
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

export default Certificate;