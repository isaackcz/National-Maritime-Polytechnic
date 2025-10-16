import { useEffect, useState } from 'react';
import MSWDDataTable from '../../component/MSWDDataTable/MSWDDataTable';
import NoDataFound from '../../component/NoDataFound';
import SkeletonLoader from '../../component/SkeletonLoader/SkeletonLoader';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import { useNavigate } from 'react-router-dom';
import useWebToken from '../../../../hooks/useWebToken';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = ({ assistanceId, doReload }) => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();

    const [barangay, setBarangay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [reportData, setReportData] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [doFetchingAgain, setDoFetchingAgain] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

    const tableColumns = [
        {
            name: "Name",
            selector: row => `${row.resident.fname} ${row.resident.mname} ${row.resident.lname} ${row.resident.suffix ?? ''}`,
            sortable: true,
            minWidth: 60,
            maxWidth: 60,
        },
        {
            name: "Barangay",
            selector: row => row.resident.barangay,
            sortable: true
        }
    ];

    useEffect(() => { GetReport(); }, [doReload]);

    const GetReport = async (e) => {
        if(e) e.preventDefault();

        try {
            setIsFetching(true);

            const token = getToken();
            const response = await axios.post(`${url}/assistance/getReport/${assistanceId}`, {
                'barangay' : barangay,
                'month' : month,
                'year' : year
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setReportData(response.data.reportData);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetching(false);

            if(barangay || month || year) {
                setDoFetchingAgain(true);
            }
        }
    }

    const ExportToPDF = () => {
        const headers = tableColumns.map(col => col.name);
        const rows = reportData.map(row =>
            tableColumns.map(col => {
                const val = col.selector ? col.selector(row) : "";
                if (typeof val === "string" || typeof val === "number") return val;
                if (val === null || val === undefined) return "";
                return String(val);
            })
        );

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: [612, 936]
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        const maxLineWidth = pageWidth - margin * 2;

        // ✅ Add image (logo)
        const logo = "/assets/system-images/MSWD (5).png"; // path from public/
        const imgWidth = 330;  // adjust size
        const imgHeight = 60;
        doc.addImage(logo, "PNG", pageWidth / 2 - imgWidth / 2, 20, imgWidth, imgHeight);

        // ✅ HEADER TEXT (below image)
        const title = `${ reportData[0].assistance?.name.toUpperCase() }${ !(month && doFetchingAgain) && !(year && doFetchingAgain) ? 'ALL' : '' } BENEFICIARIES ${ month && doFetchingAgain ? months[month - 1].toUpperCase() : '' } ${ year && doFetchingAgain ? year : '' }`;
        const splitTitle = doc.splitTextToSize(title, maxLineWidth);
        const lineHeight = 20;
        const titleStartY = 20 + imgHeight + 20; // below the image

        splitTitle.forEach((line, index) => {
            doc.text(line, pageWidth / 2, titleStartY + (index * lineHeight), { align: "center" });
        });

        // Calculate where to start the table
        const titleHeight = splitTitle.length * lineHeight;
        const startY = titleStartY + titleHeight;

        autoTable(doc, {
            startY: startY,
            head: [headers],
            body: rows,
            styles: {
                fontSize: 9,
                lineWidth: 0.25,  // inner borders (thin)
                lineColor: [0, 0, 0]
            },
            tableLineWidth: 1.5, // bold outer border
            tableLineColor: [0, 0, 0],
            headStyles: { fillColor: [40, 116, 166] },
            theme: "grid",
            didDrawPage: function (data) {
                // ✅ FOOTER (appears on every page)
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();

                const now = new Date();
                const dateTime = now.toLocaleString(); 
                const footerText = `Generated from MSWD BULIG System - ${dateTime}`;

                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
            }
        });

        doc.save(`${title}.pdf`);
    };

    return (
        <>
            {
                isFetching 
                    ? <SkeletonLoader onViewMode="update" />
                    : <>
                        <div className="py-2 border-bottom px-3">
                            <div>
                                <form onSubmit={GetReport}>
                                    <div className='row'>
                                        <div className='col-xl-5'>
                                            <label className='small form-label mb-0'>Barangay</label>
                                            <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className='form-control form-control-sm select'>
                                                <option value=''>-- All --</option>
                                                <option value="BACULANAD">BACULANAD</option>
                                                <option value="BADIANGAY">BADIANGAY</option>
                                                <option value="BULOD">BULOD</option>
                                                <option value="CATOOGAN">CATOOGAN</option>
                                                <option value="KATIPUNAN">KATIPUNAN</option>
                                                <option value="MILAGROSA">MILAGROSA</option>
                                                <option value="PILIT">PILIT</option>
                                                <option value="PITOGO">PITOGO</option>
                                                <option value="ZONE 1 (POB.)">ZONE 1 (POB.)</option>
                                                <option value="ZONE 2 (POB.)">ZONE 2 (POB.)</option>
                                                <option value="ZONE 3 (POB.)">ZONE 3 (POB.)</option>
                                                <option value="SAN ISIDRO">SAN ISIDRO</option>
                                                <option value="SAN JUAN">SAN JUAN</option>
                                                <option value="SAN MIGUELAY">SAN MIGUELAY</option>
                                                <option value="SAN ROQUE">SAN ROQUE</option>
                                                <option value="TIBAK">TIBAK</option>
                                                <option value="VICTORIA">VICTORIA</option>
                                                <option value="CUTAY">CUTAY</option>
                                                <option value="GAPAS">GAPAS</option>
                                                <option value="ZONE 4 POBLACION (CABANGCALAN)">ZONE 4 POBLACION (CABANGCALAN)</option>
                                            </select>
                                        </div>

                                        <div className='col-xl-2'>
                                            <label className='small form-label mb-0'>Month</label>
                                            <select value={month} onChange={(e) => setMonth(e.target.value)} className='form-control form-control-sm select'>
                                                <option value=''>-- Choose --</option>
                                                {
                                                    months.map((month, index) => (
                                                        <option key={index + 1} value={index + 1}>{ month }</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className='col-xl-2'>
                                            <label className='small form-label mb-0'>Year</label>
                                            <select value={year} onChange={(e) => setYear(e.target.value)} className='form-control form-control-sm select'>
                                                <option value=''>-- Choose --</option>
                                                {
                                                    years.map((year, index) => (
                                                        <option key={index} value={year}>{ year }</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className='col-xl-3'>
                                            <label className='small form-label mb-0'></label>

                                            <div className='w-100'>
                                                <button type='submit' title='Filter' className='btn btn-default btn-sm pb-0' style={{ fontSize: '7px' }}>
                                                    <span className='material-icons-outlined'>filter_list</span>
                                                </button>

                                                <button type='button' disabled={reportData.length <= 0} onClick={ExportToPDF} className='btn btn-default btn-sm ml-1'>
                                                    <img src="/assets/system-images/pdf.png" className='mr-2' alt="Excel" width={23} height={23} />
                                                    <span className='mt-1'>Export to PDF</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        { reportData.length > 0 
                            ? <div className="card m-0 elevation-0">
                                    <div className="card-body">
                                        <MSWDDataTable 
                                            progressPending={isFetching}
                                            columns={tableColumns} 
                                            data={reportData}
                                            selectableRows={false}
                                            selectedRows={null}
                                        /> 
                                    </div>
                                </div> 
                            : <div className="card m-0 elevation-0">
                                <div className="card-body">
                                    <NoDataFound message="No data found. Please add beneficiary first." />
                                </div>
                            </div>
                        }
                    </>
            }
        </>
    )
}

export default Report;