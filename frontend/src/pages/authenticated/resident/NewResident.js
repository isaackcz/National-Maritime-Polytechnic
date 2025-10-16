import PageName from '../component/PageName';
import CreateUpdateResident from './component/CreateUpdateResident';

const NewResident = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Resident',
                    'last' : false,
                },
                {
                    'name' : 'New Resident',
                    'last' : true,
                    'address' : '/welcome/resident/new'
                }
            ]}/>
            
            <CreateUpdateResident 
                data={null}
                type="create"
                callbackFunction={() => { return; }}
            />
        </>
    )
}

export default NewResident;