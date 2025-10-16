import { useNavigate } from 'react-router-dom';
import PageName from '../../../components/PageName'
import EACreateOrUpdateTraining from './components/EACreateOrUpdateTraining';

const EANewTraining = () => {
    const navigate = useNavigate();
    
    return (
        <>
            <PageName pageName={[ 
                {
                    'name' : 'Training',
                    'last' : false
                },
                {
                    'name' : 'Create New Training',
                    'last' : true,
                    'address' : '/enrollment-admin/training/new'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card shadow-sm rounded-0 border">
                                <div className="card-body p-0">
                                    <EACreateOrUpdateTraining  
                                        data={null}
                                        id={0}
                                        httpMethod="POST"
                                        callbackFunction={() => navigate('/enrollment-admin/training/list')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default EANewTraining;