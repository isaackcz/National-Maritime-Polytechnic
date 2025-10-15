import PageName from '../component/PageName';
import CreateOrUpdate from './component/CreateOrUpdate';

const NewFamily = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Family',
                    'last' : false,
                },
                {
                    'name' : 'New Family Composition',
                    'last' : true,
                    'address' : '/welcome/family/new'
                }
            ]}/>

            <CreateOrUpdate 
                httpMethod="create" 
                data={null} 
                callbackFunction={() => { return; }}
            />
        </>
    )
}

export default NewFamily;