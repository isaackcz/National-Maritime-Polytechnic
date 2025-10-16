// import PageName from '../../../components/PageName';
// import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
// import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
// import NoDataFound from '../../../components/NoDataFound';
// import useSystemURLCon from '../../../../hooks/useSystemURLCon';
// import useGetToken from '../../../../hooks/useGetToken';
// import { use } from 'react';

// const AdminDormitoryInvoices = () => {

//     useEffect(() => {
//         fetch_Tenant();
//     }, []);

//     const { url } = useSystemURLCon();
//     const { getToken } = useGetToken();
//     const [ tenants, setTenants ] = useState([]);

//     const fetch_Tenant = async() => {
//         try {
//             const token = getToken('csrf-token');
//             const response = await axios.get(`${url}/admin/dormitory/get`, {
//                 headers: { 
//                     Authorization: `Bearer ${getToken('access-token')}`,
//                     accept: 'application/json',
//                     'content-type': 'application/json'
//                 }
//             });
//             console.log("tenants ",response);
//             const data = response?.data?.tenants || [];
//             setTenants(Array.isArray(data) ? data : []);
//             return data;
//         } catch (error) {
//             console.log('Failed to fetch tenants:', error.response);
//             setTenants([]);
//             return [];
//         }
//     };
//     return (
//         <>
//             <PageName pageName={[
//                 {
//                     'name' : 'Admin',
//                     'last' : false
//                 }, 
//                 {
//                     'name' : 'Invoices',
//                     'last' : true,
//                     'address' : '/welcome/admin/Dormitory/invoice'
//                 }
//             ]} />

//             <section className="content">
//                 <div className="container-fluid">
//                     <div className="row fade-up">
//                         <div className="col-xl-12">
//                             <div className="card border shadow-sm rounded-0">
//                                 <div className="card-body">
                                    
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </>
//     );
// }

// export default AdminDormitoryInvoices;