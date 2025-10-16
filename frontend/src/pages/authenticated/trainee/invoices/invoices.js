import PageName from '../../../components/PageName';

const Invoices = () => {
    

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Trainee',
                    'last' : false
                }, 
                {
                    'name' : 'invoice',
                    'last' : true,
                    'address' : '/welcome/admin/trainee/invoice'
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

export default Invoices;