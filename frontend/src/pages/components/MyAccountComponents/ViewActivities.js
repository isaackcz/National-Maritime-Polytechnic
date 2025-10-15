import { useEffect, useState } from 'react'
import SkeletonLoader from '../SkeletonLoader/SkeletonLoader';
import NMPDataTable from '../NMPDataTable/NMPDataTable';
import useDateFormat from '../../../hooks/useDateFormat';
import NoDataFound from '../NoDataFound';
import useGetToken from '../../../hooks/useGetToken';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewActivities = ({ urlPrefix }) => {
    const navigate = useNavigate();
    const { getToken, removeToken } = useGetToken();
    const { url } = useSystemURLCon();
    const [activities, setActivities] = useState([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(true);
    const { formatDateToReadable } = useDateFormat();

    useEffect(() => {
        GetActivities(true);
        const intervalId = setInterval(() => GetActivities(false), 2000);
        return () => clearInterval(intervalId);
    }, []);

    const tableColumns = [
        {
            name: "Date",
            selector: row => formatDateToReadable(row.created_at, true),
            sortable: true,
            minWidth: "300px",
            maxWidth: "300px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Activity",
            selector: row => row.actions,
            sortable: true,
        },
    ];

    const GetActivities = async (isInitialLoad) => {
        try {
            setIsFetchingActivities(isInitialLoad);

            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/${urlPrefix}/my-account/get_activities`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if(response.status === 200) {
                setActivities(response.data.activities);
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetchingActivities(false);
        }
    }
    
    return (
        <>
            {
                isFetchingActivities
                    ? <SkeletonLoader onViewMode='update' />
                    : activities.length > 0 
                        ? <NMPDataTable 
                            progressPending={isFetchingActivities}
                            columns={tableColumns} 
                            data={activities}
                            selectableRows={false}
                            selectedRows={null}
                        /> : <NoDataFound message="No activities yet." />
            }
        </>
    )
}

export default ViewActivities;