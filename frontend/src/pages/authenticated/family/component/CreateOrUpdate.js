import { useEffect, useState } from 'react';
import useWebToken from '../../../../hooks/useWebToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../component/SkeletonLoader/SkeletonLoader';
import MSWDDataTable from '../../component/MSWDDataTable/MSWDDataTable';
import NoDataFound from '../../component/NoDataFound';
import axios from 'axios';
import ChooseHead from './ChooseHead';

const CreateOrUpdate = ({ httpMethod, data, documentId, onViewPage, callbackFunction }) => {
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const { url, urlWithoutApi } = useSystemURLCon();
    const [nonFamilyResident, setNonFamilyResident] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const [familyName, setFamilyName] = useState('');
    const [head, setHead] = useState('');
    const [houseType, setHouseType] = useState('');
    const [houseStructure, setHouseStructure] = useState('');
    const [tenureStatus, setTenureStatus] = useState('');
    const [withElectricity, setWithElectricity] = useState('');
    const [sourceOfWater, setSourceOfWater] = useState('');
    const [aFarmOwner, setAFarmOwner] = useState('');
    const [soloParent, setSoloParent] = useState('');
    const [a4psBeneficiary, setA4psBeneficiary] = useState('');

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedGadgets, setSelectedGadgets] = useState([]);

    useEffect(() => {
        if (data !== null) {
            setFamilyName(data.name);
            setHouseType(data.housing_unit.house_type);
            setHouseStructure(data.housing_unit.house_structure);
            setTenureStatus(data.housing_unit.tenure_status);
            setWithElectricity(data.housing_unit.with_electricity);
            setSourceOfWater(data.housing_unit.source_of_water);
            setAFarmOwner(data.housing_unit.a_farm_owner);
            setSoloParent(data.housing_unit.a_solo_parent);
            setA4psBeneficiary(data.housing_unit.a_4ps_beneficiary);

            const gadgetIds = data.housing_unit.housing_unit_gadgets.map(gadget => gadget.gadget);
            setSelectedGadgets(gadgetIds);

            const headMember = data.members.find(member => member.is_head === 'YES');
            const ids = Array.isArray(data.members) ? data.members.map(m => Number(m.resident_id)) : [];
            
            if (headMember) {
                setHead(headMember.resident_id);
            }

            if(ids) {
                setSelectedRows(ids);
            }
        }

        GetNonFamilyResident();
    }, []);

    const GetNonFamilyResident = async () => {
        try {
            setIsFetching(true);

            const token = getToken();
            const response = await axios.post(`${url}/family/get`, {
                httpMethod: httpMethod,
                familyId: documentId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setNonFamilyResident(response.data.non_family_resident);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "ID#",
            selector: row => row.id,
            sortable: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Avatar",
            cell: (nonFamilyResident) => (
                <>
                    <a href={`${urlWithoutApi}/user-images/${nonFamilyResident.profile_picture}`} target="_blank">
                        <img src={`${urlWithoutApi}/user-images/${nonFamilyResident.profile_picture}`} loading='lazy' class="rounded-circle" height="30" />
                    </a>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Name",
            selector: row => `${row.fname} ${row.mname} ${row.lname} ${row.suffix ?? ''}`,
            sortable: true
        },
        {
            name: "Sex",
            selector: row => row.sex,
            sortable: true,
            minWidth: "50px",
            maxWidth: "100px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Barangay",
            selector: row => row.barangay,
            sortable: true,
            minWidth: "130px",
            maxWidth: "180px",
            style: { whiteSpace: "nowrap" },
        }
    ];

    const gadgets = [
        "CELLPHONE",
        "COMPUTER",
        "TABLET",
        "WATER DISPENSER",
        "RICE COOKER",
        "AIRCONDITIONER",
        "REFRIGERATOR",
    ];

    const handleCheckboxChange = (e) => {
        const value = e.target.value;

        setSelectedGadgets((prev) =>
            prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value] 
        );
    };

    return (
        <>
            {
                isFetching 
                    ? <SkeletonLoader onViewMode={httpMethod} />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className={`row ${ httpMethod === 'create' && 'fade-up'}`}>
                                <div className={`col-xl-12 ${onViewPage && 'px-0'}`}>
                                    <div className={`card ${onViewPage && 'rounded-0 elevation-0 m-0'}`}>
                                        <div className='card-body'>
                                            <form method='POST'>
                                                <div className='row'>
                                                    <div className='col-xl-4 mb-1'>
                                                        <label className="form-label small mb-0">Family Name <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <input type="text" placeholder='Enter here..' value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="form-control form-control-sm" required />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-12'>
                                                        { nonFamilyResident.length > 0 
                                                            ?  <>
                                                                <label className="form-label small mb-1">Family Composition <span className="text-danger">*</span></label>
                                                                <MSWDDataTable
                                                                    progressPending={isFetching}
                                                                    columns={tableColumns}
                                                                    data={nonFamilyResident}
                                                                    selectableRows={true}
                                                                    onSelectedRowsChange={(ids) => {
                                                                        const normalized = Array.isArray(ids) ? ids.map(Number) : [];
                                                                        if (JSON.stringify(normalized) !== JSON.stringify(selectedRows)) {
                                                                            setSelectedRows(normalized);
                                                                        }
                                                                    }}
                                                                    selectedRows={selectedRows}
                                                                />
                                                            </> : <>
                                                                <div className="card">
                                                                    <div className="card-body">
                                                                        <NoDataFound message="No data found. Please add resident first." />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        }
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">House Type <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={houseType} onChange={(e) => setHouseType(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='BUNGALOW'>BUNGALOW</option>
                                                                <option value='TWO-STORY HOUSE'>TWO-STORY HOUSE</option>
                                                                <option value='THREE-STORY HOUSE'>THREE-STORY HOUSE</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-6'>
                                                        <label className="form-label small mb-1">Tenure Status <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={tenureStatus} onChange={(e) => setTenureStatus(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='OWN HOUSE AND LOT'>OWN HOUSE AND LOT</option>
                                                                <option value='OWN HOUSE RENTED LOT'>OWN HOUSE RENTED LOT</option>
                                                                <option value='OWN HOUSE, FREE RENT OF LOT WITH THE CONCENT OF THE OWNER'>OWN HOUSE, FREE RENT OF LOT WITH THE CONCENT OF THE OWNER</option>
                                                                <option value='OWN HOUSE AND LOT'>OWN HOUSE AND LOT</option>
                                                                <option value='OWN HOUSE, FREE RENT OF LOT WITHOUT THE CONCENT OF THE OWNER'>OWN HOUSE, FREE RENT OF LOT WITHOUT THE CONCENT OF THE OWNER</option>
                                                                <option value='RENTED HOUSE INCLUDING LOT'>RENTED HOUSE INCLUDING LOT</option>
                                                                <option value='RENT FREE HOUSE AND LOT WITH THE CONCENT OF THE OWNER'>RENT FREE HOUSE AND LOT WITH THE CONCENT OF THE OWNER</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">House Structure <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={houseStructure} onChange={(e) => setHouseStructure(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='CONCRETE'>CONCRETE</option>
                                                                <option value='LIGHT MATERIALS'>LIGHT MATERIALS</option>
                                                                <option value='MIXED CONCRETE AND LIGHT MATERIALS'>MIXED CONCRETE AND LIGHT MATERIALS</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">With Electricity <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={withElectricity} onChange={(e) => setWithElectricity(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='YES'>YES</option>
                                                                <option value='NO'>NO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">Source of Water <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={sourceOfWater} onChange={(e) => setSourceOfWater(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='WELL'>WELL</option>
                                                                <option value='FAUCET'>FAUCET</option>
                                                                <option value='HANDPUMP'>HANDPUMP</option>
                                                                <option value='RAIN WATER'>RAIN WATER</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">A Farm Owner <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={aFarmOwner} onChange={(e) => setAFarmOwner(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='YES'>YES</option>
                                                                <option value='NO'>NO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">A Solo Parent <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={soloParent} onChange={(e) => setSoloParent(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='YES'>YES</option>
                                                                <option value='NO'>NO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3'>
                                                        <label className="form-label small mb-1">A 4PS Beneficiary <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={a4psBeneficiary} onChange={(e) => setA4psBeneficiary(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='YES'>YES</option>
                                                                <option value='NO'>NO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-12'>
                                                        <label className="form-label small mb-1 mt-2">Gadgets & Appliances owned <span className="text-danger">*</span></label>
                                                        <table className='table table-sm table-bordered table-striped small'>
                                                            <thead>
                                                                <th>Choose</th>
                                                                <th>Name</th>
                                                            </thead>

                                                            <tbody>
                                                                { gadgets.map((gadget, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <input
                                                                                type="checkbox"
                                                                                value={gadget}
                                                                                checked={selectedGadgets.includes(gadget)}
                                                                                onChange={handleCheckboxChange}
                                                                            />
                                                                        </td>
                                                                        <td>{gadget}</td>
                                                                    </tr>
                                                                )) }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <button type="button" data-toggle="modal" data-target="#chooseHead" disabled={ 
                                                    !familyName || 
                                                    !houseType ||
                                                    !houseStructure ||
                                                    !tenureStatus ||
                                                    !withElectricity ||
                                                    !sourceOfWater ||
                                                    !aFarmOwner ||
                                                    !soloParent ||
                                                    !a4psBeneficiary ||
                                                    selectedRows.length <= 2 || 
                                                    selectedGadgets.length <= 0 
                                                } className={`mt-3 btn btn-${ httpMethod === 'create' ? 'primary' : 'warning' } btn-sm elevation-1 text--fontPos13--xW8hS`}>
                                                    Proceed
                                                </button>
                                            </form>

                                            <ChooseHead 
                                                familyHead={head}
                                                documentId={documentId}
                                                familyName={familyName}
                                                httpMethod={httpMethod}
                                                composition={selectedRows} 
                                                selectedRows={selectedRows}
                                                houseType={houseType}
                                                houseStructure={houseStructure}
                                                tenureStatus={tenureStatus}
                                                withElectricity={withElectricity}
                                                sourceOfWater={sourceOfWater}
                                                aFarmOwner={aFarmOwner}
                                                soloParent={soloParent}
                                                a4psBeneficiary={a4psBeneficiary}
                                                selectedGadgets={selectedGadgets}
                                                selectedResidents={nonFamilyResident.filter(r => selectedRows.includes(Number(r.id)))}
                                                callbackFunction={callbackFunction}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    );
}

export default CreateOrUpdate;