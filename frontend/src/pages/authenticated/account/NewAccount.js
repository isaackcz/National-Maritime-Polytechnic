import PageName from '../component/PageName'
import CreateOrUpdate from './component/CreateOrUpdate';

const NewAccount = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Account',
                    'last' : false,
                },
                {
                    'name' : 'New Account',
                    'last' : true,
                    'address' : '/welcome/account/new'
                }
            ]}/>

            <CreateOrUpdate httpMethod='create' data={null} />
        </>
    )
}

export default NewAccount;