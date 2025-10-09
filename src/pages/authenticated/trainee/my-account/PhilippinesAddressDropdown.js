import { useEffect, useState } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import { textFieldProps, menuItemProps } from '../components/inputStyles';

/**
 * PhilippinesAddressDropdown Component
 * Cascading dropdown for Philippine addresses (Region -> Province -> Municipality -> Barangay)
 * Uses PSGC API for real-time address data fetching
 */
const PhilippinesAddressDropdown = ({ onAddressChange, defaultValues = {}, showHouseAndPostal = true, showPostalCode = true }) => {
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState(defaultValues.region || '');
    const [selectedRegionCode, setSelectedRegionCode] = useState('');
    const [selectedProvince, setSelectedProvince] = useState(defaultValues.province || '');
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedMunicipality, setSelectedMunicipality] = useState(defaultValues.municipality || '');
    const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState(defaultValues.barangay || '');
    const [selectedBarangayCode, setSelectedBarangayCode] = useState('');
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
        
        setSelectedRegionCode(value);
        setSelectedRegion(regionData ? regionData.name : '');
        setSelectedProvinceCode('');
        setSelectedProvince('');
        setSelectedMunicipalityCode('');
        setSelectedMunicipality('');
        setSelectedBarangayCode('');
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
        
        setSelectedProvinceCode(value);
        setSelectedProvince(provinceData ? provinceData.name : '');
        setSelectedMunicipalityCode('');
        setSelectedMunicipality('');
        setSelectedBarangayCode('');
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
        
        setSelectedMunicipalityCode(value);
        setSelectedMunicipality(municipalityData ? municipalityData.name : '');
        setSelectedBarangayCode('');
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
        
        setSelectedBarangayCode(value);
        setSelectedBarangay(barangayData ? barangayData.name : '');
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {/* House/Street Number - Only show if showHouseAndPostal is true */}
            {showHouseAndPostal && (
                <TextField 
                    label="House No. / Street" 
                    placeholder="e.g., 123 Main Street" 
                    value={houseNo} 
                    onChange={(e) => setHouseNo(e.target.value)} 
                    required 
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-home mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
            )}

            {/* Region */}
            <TextField
                select
                label="Region"
                value={selectedRegionCode}
                onChange={handleRegionChange}
                required
                fullWidth
                {...textFieldProps}
                InputProps={{
                    startAdornment: <i className="fas fa-map mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                }}
            >
                <MenuItem value="" {...menuItemProps}>-- Select Region --</MenuItem>
                {regions.map((region) => (
                    <MenuItem key={region.code} value={region.code} {...menuItemProps}>{region.name}</MenuItem>
                ))}
            </TextField>

            {/* Province */}
            <TextField
                select
                label="Province"
                value={selectedProvinceCode}
                onChange={handleProvinceChange}
                required
                disabled={!selectedRegionCode || isLoadingProvinces}
                fullWidth
                {...textFieldProps}
                InputProps={{
                    startAdornment: <i className="fas fa-map-marked mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                }}
            >
                <MenuItem value="" {...menuItemProps}>{isLoadingProvinces ? 'Loading provinces...' : '-- Select Province --'}</MenuItem>
                {provinces.map((province) => (
                    <MenuItem key={province.code} value={province.code} {...menuItemProps}>{province.name}</MenuItem>
                ))}
            </TextField>

            {/* Municipality/City */}
            <TextField
                select
                label="Municipality/City"
                value={selectedMunicipalityCode}
                onChange={handleMunicipalityChange}
                required
                disabled={!selectedProvinceCode || isLoadingMunicipalities}
                fullWidth
                {...textFieldProps}
                InputProps={{
                    startAdornment: <i className="fas fa-city mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                }}
            >
                <MenuItem value="" {...menuItemProps}>{isLoadingMunicipalities ? 'Loading municipalities...' : '-- Select Municipality/City --'}</MenuItem>
                {municipalities.map((municipality) => (
                    <MenuItem key={municipality.code} value={municipality.code} {...menuItemProps}>{municipality.name}</MenuItem>
                ))}
            </TextField>

            {/* Barangay */}
            <TextField
                select
                label="Barangay"
                value={selectedBarangayCode}
                onChange={handleBarangayChange}
                required
                disabled={!selectedMunicipalityCode || isLoadingBarangays}
                fullWidth
                {...textFieldProps}
                InputProps={{
                    startAdornment: <i className="fas fa-map-pin mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                }}
            >
                <MenuItem value="" {...menuItemProps}>{isLoadingBarangays ? 'Loading barangays...' : '-- Select Barangay --'}</MenuItem>
                {barangays.map((barangay) => (
                    <MenuItem key={barangay.code} value={barangay.code} {...menuItemProps}>{barangay.name}</MenuItem>
                ))}
            </TextField>

            {/* Postal Code - Only show if showHouseAndPostal and showPostalCode are true */}
            {showHouseAndPostal && showPostalCode && (
                <TextField 
                    label="Postal/ZIP Code" 
                    placeholder="e.g., 1000" 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    required 
                    fullWidth
                    inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }} 
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-mail-bulk mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
            )}

            {/* Complete Address Preview */}
            {buildCompleteAddress() && (
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, mt: 1 }}>
                    <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #dee2e6' }}>
                        <Box sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6c757d', mb: 0.5, textTransform: 'uppercase' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '0.25rem' }}></i>
                            Complete Address:
                        </Box>
                        <Box sx={{ fontSize: '0.8rem', color: '#323130', fontWeight: 500 }}>
                            {buildCompleteAddress()}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default PhilippinesAddressDropdown;