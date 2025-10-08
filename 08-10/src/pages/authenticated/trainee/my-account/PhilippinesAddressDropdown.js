import { useEffect, useState } from 'react';

/**
 * PhilippinesAddressDropdown Component
 * Cascading dropdown for Philippine addresses (Region -> Province -> Municipality -> Barangay)
 * Uses PSGC API for real-time address data fetching
 */
const PhilippinesAddressDropdown = ({ onAddressChange, defaultValues = {}, showHouseAndPostal = true }) => {
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState(defaultValues.region || '');
    const [selectedProvince, setSelectedProvince] = useState(defaultValues.province || '');
    const [selectedMunicipality, setSelectedMunicipality] = useState(defaultValues.municipality || '');
    const [selectedBarangay, setSelectedBarangay] = useState(defaultValues.barangay || '');
    const [houseNo, setHouseNo] = useState(defaultValues.houseNo || '');
    const [postalCode, setPostalCode] = useState(defaultValues.postalCode || '');

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

    // Load regions on component mount
    useEffect(() => {
        fetchRegions();
    }, []);

    // Update parent component whenever address changes
    useEffect(() => {
        const completeAddress = buildCompleteAddress();
        if (onAddressChange) {
            onAddressChange({
                region: selectedRegion,
                province: selectedProvince,
                municipality: selectedMunicipality,
                barangay: selectedBarangay,
                houseNo: houseNo,
                postalCode: postalCode,
                completeAddress: completeAddress
            });
        }
    }, [selectedRegion, selectedProvince, selectedMunicipality, selectedBarangay, houseNo, postalCode]);

    /**
     * Build complete address string
     */
    const buildCompleteAddress = () => {
        const parts = [];
        if (showHouseAndPostal && houseNo) parts.push(houseNo);
        if (selectedBarangay) parts.push(selectedBarangay);
        if (selectedMunicipality) parts.push(selectedMunicipality);
        if (showHouseAndPostal && postalCode) parts.push(postalCode);
        if (selectedProvince) parts.push(selectedProvince);
        if (selectedRegion) parts.push(selectedRegion);
        return parts.join(', ');
    };

    /**
     * Fetch regions from PSGC API
     */
    const fetchRegions = async () => {
        try {
            // ===== CURRENT PSGC API - REPLACE WITH LARAVEL API IF NEEDED =====
            const response = await fetch('https://psgc.gitlab.io/api/regions/');
            const data = await response.json();
            setRegions(data);
            // ===== END PSGC API SECTION =====

            // ===== LARAVEL API INTEGRATION - UNCOMMENT WHEN READY =====
            // const response = await fetch(`${LARAVEL_API_URL}/api/address/regions`);
            // const data = await response.json();
            // setRegions(data.data); // Adjust based on Laravel response format
            // ===== END LARAVEL API SECTION =====

        } catch (error) {
            console.error('Error fetching regions:', error);
            // Fallback to basic regions if API fails
            setRegions([
                { code: '010000000', name: 'Region I - Ilocos Region' },
                { code: '020000000', name: 'Region II - Cagayan Valley' },
                { code: '030000000', name: 'Region III - Central Luzon' },
                { code: '040000000', name: 'Region IV-A - CALABARZON' },
                { code: '170000000', name: 'Region IV-B - MIMAROPA' },
                { code: '050000000', name: 'Region V - Bicol Region' },
                { code: '060000000', name: 'Region VI - Western Visayas' },
                { code: '070000000', name: 'Region VII - Central Visayas' },
                { code: '080000000', name: 'Region VIII - Eastern Visayas' },
                { code: '090000000', name: 'Region IX - Zamboanga Peninsula' },
                { code: '100000000', name: 'Region X - Northern Mindanao' },
                { code: '110000000', name: 'Region XI - Davao Region' },
                { code: '120000000', name: 'Region XII - SOCCSKSARGEN' },
                { code: '130000000', name: 'NCR - National Capital Region' },
                { code: '140000000', name: 'CAR - Cordillera Administrative Region' },
                { code: '150000000', name: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao' },
                { code: '160000000', name: 'Region XIII - Caraga' }
            ]);
        }
    };

    /**
     * Fetch provinces based on selected region
     */
    const fetchProvinces = async (regionCode) => {
        if (!regionCode) return;
        
        setIsLoadingProvinces(true);
        try {
            // ===== CURRENT PSGC API - REPLACE WITH LARAVEL API IF NEEDED =====
            const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`);
            const data = await response.json();
            setProvinces(data);
            // ===== END PSGC API SECTION =====

            // ===== LARAVEL API INTEGRATION - UNCOMMENT WHEN READY =====
            // const response = await fetch(`${LARAVEL_API_URL}/api/address/provinces/${regionCode}`);
            // const data = await response.json();
            // setProvinces(data.data); // Adjust based on Laravel response format
            // ===== END LARAVEL API SECTION =====

        } catch (error) {
            console.error('Error fetching provinces:', error);
            setProvinces([]);
        } finally {
            setIsLoadingProvinces(false);
        }
    };

    /**
     * Fetch municipalities based on selected province
     */
    const fetchMunicipalities = async (provinceCode) => {
        if (!provinceCode) return;
        
        setIsLoadingMunicipalities(true);
        try {
            // ===== CURRENT PSGC API - REPLACE WITH LARAVEL API IF NEEDED =====
            const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`);
            const data = await response.json();
            setMunicipalities(data);
            // ===== END PSGC API SECTION =====

            // ===== LARAVEL API INTEGRATION - UNCOMMENT WHEN READY =====
            // const response = await fetch(`${LARAVEL_API_URL}/api/address/municipalities/${provinceCode}`);
            // const data = await response.json();
            // setMunicipalities(data.data); // Adjust based on Laravel response format
            // ===== END LARAVEL API SECTION =====

        } catch (error) {
            console.error('Error fetching municipalities:', error);
            setMunicipalities([]);
        } finally {
            setIsLoadingMunicipalities(false);
        }
    };

    /**
     * Fetch barangays based on selected municipality
     */
    const fetchBarangays = async (municipalityCode) => {
        if (!municipalityCode) return;
        
        setIsLoadingBarangays(true);
        try {
            // ===== CURRENT PSGC API - REPLACE WITH LARAVEL API IF NEEDED =====
            const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/barangays/`);
            const data = await response.json();
            setBarangays(data);
            // ===== END PSGC API SECTION =====

            // ===== LARAVEL API INTEGRATION - UNCOMMENT WHEN READY =====
            // const response = await fetch(`${LARAVEL_API_URL}/api/address/barangays/${municipalityCode}`);
            // const data = await response.json();
            // setBarangays(data.data); // Adjust based on Laravel response format
            // ===== END LARAVEL API SECTION =====

        } catch (error) {
            console.error('Error fetching barangays:', error);
            setBarangays([]);
        } finally {
            setIsLoadingBarangays(false);
        }
    };

    /**
     * Handle region change
     */
    const handleRegionChange = (e) => {
        const value = e.target.value;
        const regionData = regions.find(r => r.code === value);
        
        setSelectedRegion(regionData ? regionData.name : '');
        setSelectedProvince('');
        setSelectedMunicipality('');
        setSelectedBarangay('');
        setProvinces([]);
        setMunicipalities([]);
        setBarangays([]);

        if (value) {
            fetchProvinces(value);
        }
    };

    /**
     * Handle province change
     */
    const handleProvinceChange = (e) => {
        const value = e.target.value;
        const provinceData = provinces.find(p => p.code === value);
        
        setSelectedProvince(provinceData ? provinceData.name : '');
        setSelectedMunicipality('');
        setSelectedBarangay('');
        setMunicipalities([]);
        setBarangays([]);

        if (value) {
            fetchMunicipalities(value);
        }
    };

    /**
     * Handle municipality change
     */
    const handleMunicipalityChange = (e) => {
        const value = e.target.value;
        const municipalityData = municipalities.find(m => m.code === value);
        
        setSelectedMunicipality(municipalityData ? municipalityData.name : '');
        setSelectedBarangay('');
        setBarangays([]);

        if (value) {
            fetchBarangays(value);
        }
    };

    /**
     * Handle barangay change
     */
    const handleBarangayChange = (e) => {
        const value = e.target.value;
        const barangayData = barangays.find(b => b.code === value);
        
        setSelectedBarangay(barangayData ? barangayData.name : '');
    };

    return (
        <div className="row">
            {/* House/Street Number - Only show if showHouseAndPostal is true */}
            {showHouseAndPostal && (
                <div className="col-xl-6 col-md-6 mb-3">
                    <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                        House No. / Street <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., 123 Main Street"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                        required
                    />
                </div>
            )}

            {/* Region */}
            <div className={showHouseAndPostal ? "col-xl-6 col-md-6 mb-3" : "col-xl-6 col-md-6 mb-3"}>
                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                    Region <span className="text-danger">*</span>
                </label>
                <select
                    onChange={handleRegionChange}
                    className="form-control form-control-sm"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                    required
                >
                    <option value="">-- Select Region --</option>
                    {regions.map((region) => (
                        <option key={region.code} value={region.code}>
                            {region.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Province */}
            <div className="col-xl-6 col-md-6 mb-3">
                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                    Province <span className="text-danger">*</span>
                </label>
                <select
                    onChange={handleProvinceChange}
                    className="form-control form-control-sm"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                    disabled={!selectedRegion || isLoadingProvinces}
                    required
                >
                    <option value="">
                        {isLoadingProvinces ? 'Loading provinces...' : '-- Select Province --'}
                    </option>
                    {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Municipality/City */}
            <div className="col-xl-6 col-md-6 mb-3">
                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                    Municipality/City <span className="text-danger">*</span>
                </label>
                <select
                    onChange={handleMunicipalityChange}
                    className="form-control form-control-sm"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                    disabled={!selectedProvince || isLoadingMunicipalities}
                    required
                >
                    <option value="">
                        {isLoadingMunicipalities ? 'Loading municipalities...' : '-- Select Municipality/City --'}
                    </option>
                    {municipalities.map((municipality) => (
                        <option key={municipality.code} value={municipality.code}>
                            {municipality.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Barangay */}
            <div className="col-xl-6 col-md-6 mb-3">
                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                    Barangay <span className="text-danger">*</span>
                </label>
                <select
                    onChange={handleBarangayChange}
                    className="form-control form-control-sm"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                    disabled={!selectedMunicipality || isLoadingBarangays}
                    required
                >
                    <option value="">
                        {isLoadingBarangays ? 'Loading barangays...' : '-- Select Barangay --'}
                    </option>
                    {barangays.map((barangay) => (
                        <option key={barangay.code} value={barangay.code}>
                            {barangay.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Postal Code - Only show if showHouseAndPostal is true */}
            {showHouseAndPostal && (
                <div className="col-xl-6 col-md-6 mb-3">
                    <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                        Postal Code <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., 1000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                        maxLength="4"
                        pattern="[0-9]{4}"
                        required
                    />
                </div>
            )}

            {/* Complete Address Preview */}
            {buildCompleteAddress() && (
                <div className="col-12 mb-3">
                    <div className="alert alert-light border shadow-sm mb-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <small className="text-muted d-block mb-1" style={{ fontSize: '11px', fontWeight: '600' }}>
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            COMPLETE ADDRESS PREVIEW:
                        </small>
                        <div style={{ fontSize: '13px', color: '#323130', fontWeight: '500' }}>
                            {buildCompleteAddress()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhilippinesAddressDropdown;