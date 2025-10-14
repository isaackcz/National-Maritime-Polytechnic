import { useEffect, useState } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import { textFieldProps, menuItemProps } from '../components/inputStyles';

const PhilippinesAddressDropdown = ({ addressData, setAddressData, showHouseAndPostal = true, showPostalCode = true, errors = {}, onFieldTouch = () => {}, fieldPrefix = '', clearErrorIfValid = () => {} }) => {
    // State for dropdown options
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [selectedRegionCode, setSelectedRegionCode] = useState('');
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState('');
    const [selectedBarangayCode, setSelectedBarangayCode] = useState('');

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

    useEffect(() => {
        fetchRegions();
    }, []);

    useEffect(() => {
        const restoreAddressSelections = async () => {
            if (!addressData || !regions || regions.length === 0) return;
            if (!addressData.region) return;

            try {
                // STEP 1: Restore Region
                if (addressData.region && !selectedRegionCode) {
                    const regionMatch = regions.find(r => r.name === addressData.region);
                    if (!regionMatch) return;
                    
                    setSelectedRegionCode(regionMatch.code);
                    
                    // STEP 2: Fetch and restore Province
                    if (addressData.province) {
                        const provincesResponse = await fetch(`https://psgc.gitlab.io/api/regions/${regionMatch.code}/provinces/`);
                        const provincesData = await provincesResponse.json();
                        setProvinces(provincesData);
                        
                        const provinceMatch = provincesData.find(p => p.name === addressData.province);
                        if (!provinceMatch) return;
                        
                        setSelectedProvinceCode(provinceMatch.code);
                        
                        // STEP 3: Fetch and restore Municipality
                        if (addressData.municipality) {
                            const municipalitiesResponse = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceMatch.code}/cities-municipalities/`);
                            const municipalitiesData = await municipalitiesResponse.json();
                            setMunicipalities(municipalitiesData);
                            
                            const municipalityMatch = municipalitiesData.find(m => m.name === addressData.municipality);
                            if (!municipalityMatch) return;
                            
                            setSelectedMunicipalityCode(municipalityMatch.code);
                            
                            // STEP 4: Fetch and restore Barangay
                            if (addressData.barangay) {
                                const barangaysResponse = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${municipalityMatch.code}/barangays/`);
                                const barangaysData = await barangaysResponse.json();
                                setBarangays(barangaysData);
                                
                                const barangayMatch = barangaysData.find(b => b.name === addressData.barangay);
                                if (barangayMatch) {
                                    setSelectedBarangayCode(barangayMatch.code);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error restoring address selections:', error);
            }
        };

        restoreAddressSelections();
    }, [addressData?.region, regions]);


    const buildCompleteAddress = () => {
        const parts = [];
        if (showHouseAndPostal && addressData?.houseNo) parts.push(addressData.houseNo);
        if (addressData?.barangay) parts.push(addressData.barangay);
        if (addressData?.municipality) parts.push(addressData.municipality);
        if (showHouseAndPostal && showPostalCode && addressData?.postalCode) parts.push(addressData.postalCode);
        if (addressData?.province) parts.push(addressData.province);
        if (addressData?.region) parts.push(addressData.region);
        return parts.join(', ');
    };

    const fetchRegions = async () => {
        try {
            // API CALL: GET request to fetch all Philippine regions
            const response = await fetch('https://psgc.gitlab.io/api/regions/');
            const data = await response.json();
            setRegions(data);

        } catch (error) {
            console.error('Error fetching regions:', error);
            
            // Fallback: Use hardcoded regions if API fails
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


    const fetchProvinces = async (regionCode) => {
        if (!regionCode) return;
        
        setIsLoadingProvinces(true);
        try {
            // API CALL: GET request to fetch provinces for the selected region
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


    const fetchMunicipalities = async (provinceCode) => {
        if (!provinceCode) return;
        
        setIsLoadingMunicipalities(true);
        try {
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


    const fetchBarangays = async (municipalityCode) => {
        if (!municipalityCode) return;
        
        setIsLoadingBarangays(true);
        try {
            // API CALL: GET request to fetch barangays for the selected municipality
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

    const handleRegionChange = (e) => {
        const value = e.target.value;
        const regionData = regions.find(r => r.code === value);
        
        // Update local codes
        setSelectedRegionCode(value);
        setSelectedProvinceCode('');
        setSelectedMunicipalityCode('');
        setSelectedBarangayCode('');
        
        // Clear dependent dropdowns
        setProvinces([]);
        setMunicipalities([]);
        setBarangays([]);

        // Update parent component state
        const nextAddress = {
            ...addressData,
            region: regionData ? regionData.name : '',
            province: '',
            municipality: '',
            barangay: ''
        };
        setAddressData(nextAddress);

        clearErrorIfValid(getErrorKey('region'), nextAddress.region, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });

        if (value) {
            fetchProvinces(value);
        }
    };


    const handleProvinceChange = (e) => {
        const value = e.target.value;
        const provinceData = provinces.find(p => p.code === value);
        
        // Update local codes
        setSelectedProvinceCode(value);
        setSelectedMunicipalityCode('');
        setSelectedBarangayCode('');
        
        // Clear dependent dropdowns
        setMunicipalities([]);
        setBarangays([]);

        // Update parent component state
        const nextAddress = {
            ...addressData,
            province: provinceData ? provinceData.name : '',
            municipality: '',
            barangay: ''
        };
        setAddressData(nextAddress);

        clearErrorIfValid(getErrorKey('province'), nextAddress.province, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });

        // Fetch municipalities for selected province
        if (value) {
            fetchMunicipalities(value);
        }
    };


    const handleMunicipalityChange = (e) => {
        const value = e.target.value;
        const municipalityData = municipalities.find(m => m.code === value);
        
        // Update local codes
        setSelectedMunicipalityCode(value);
        setSelectedBarangayCode('');
        
        // Clear dependent dropdowns
        setBarangays([]);

        // Update parent component state
        const nextAddress = {
            ...addressData,
            municipality: municipalityData ? municipalityData.name : '',
            barangay: ''
        };
        setAddressData(nextAddress);

        clearErrorIfValid(getErrorKey('municipality'), nextAddress.municipality, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });

        // Fetch barangays for selected municipality
        if (value) {
            fetchBarangays(value);
        }
    };


    const handleBarangayChange = (e) => {
        const value = e.target.value;
        const barangayData = barangays.find(b => b.code === value);
        
        // Update local code
        setSelectedBarangayCode(value);

        // Update parent component state
        const nextAddress = {
            ...addressData,
            barangay: barangayData ? barangayData.name : ''
        };
        setAddressData(nextAddress);

        clearErrorIfValid(getErrorKey('barangay'), nextAddress.barangay, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });
    };

    // Helper function to get error key based on prefix
    const getErrorKey = (fieldName) => {
        return fieldPrefix ? `${fieldPrefix}${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` : fieldName;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* ROW 1: House No/Street (Full width) - Only for Current Address */}
            {showHouseAndPostal && (
                <TextField 
                    label="House No. / Street" 
                    placeholder="e.g., 123 Main Street" 
                    value={addressData?.houseNo || ''} 
                    onChange={(e) => {
                        const nextAddress = { ...addressData, houseNo: e.target.value };
                        setAddressData(nextAddress);
                        clearErrorIfValid(getErrorKey('houseNo'), nextAddress.houseNo, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });
                    }} 
                    onBlur={() => onFieldTouch(getErrorKey('houseNo'))}
                    error={!!errors[getErrorKey('houseNo')]}
                    helperText={errors[getErrorKey('houseNo')]}
                    required 
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-home mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
            )}

            
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: showHouseAndPostal ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
                gap: 2
            }}>
                <TextField
                    select
                    label="Region"
                    value={selectedRegionCode}
                    onChange={handleRegionChange}
                    onBlur={() => onFieldTouch(getErrorKey('region'))}
                    error={!!errors[getErrorKey('region')]}
                    helperText={errors[getErrorKey('region')]}
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

                {showHouseAndPostal && (
                    <>
                        <TextField
                            select
                            label="Province"
                            value={selectedProvinceCode}
                            onChange={handleProvinceChange}
                            onBlur={() => onFieldTouch(getErrorKey('province'))}
                            error={!!errors[getErrorKey('province')]}
                            helperText={errors[getErrorKey('province')]}
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

                        <TextField
                            select
                            label="Municipality/City"
                            value={selectedMunicipalityCode}
                            onChange={handleMunicipalityChange}
                            onBlur={() => onFieldTouch(getErrorKey('municipality'))}
                            error={!!errors[getErrorKey('municipality')]}
                            helperText={errors[getErrorKey('municipality')]}
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
                    </>
                )}
            </Box>

            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: showHouseAndPostal ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2
            }}>
                {!showHouseAndPostal && (
                    <>
                        <TextField
                            select
                            label="Province"
                            value={selectedProvinceCode}
                            onChange={handleProvinceChange}
                            onBlur={() => onFieldTouch(getErrorKey('province'))}
                            error={!!errors[getErrorKey('province')]}
                            helperText={errors[getErrorKey('province')]}
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

                        <TextField
                            select
                            label="Municipality/City"
                            value={selectedMunicipalityCode}
                            onChange={handleMunicipalityChange}
                            onBlur={() => onFieldTouch(getErrorKey('municipality'))}
                            error={!!errors[getErrorKey('municipality')]}
                            helperText={errors[getErrorKey('municipality')]}
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
                    </>
                )}

                <TextField
                    select
                    label="Barangay"
                    value={selectedBarangayCode}
                    onChange={handleBarangayChange}
                    onBlur={() => onFieldTouch(getErrorKey('barangay'))}
                    error={!!errors[getErrorKey('barangay')]}
                    helperText={errors[getErrorKey('barangay')]}
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

                {showHouseAndPostal && showPostalCode && (
                    <TextField 
                        label="Postal/ZIP Code" 
                        placeholder="e.g., 1000" 
                        value={addressData?.postalCode || ''} 
                        onChange={(e) => {
                            const nextAddress = { ...addressData, postalCode: e.target.value };
                            setAddressData(nextAddress);
                            clearErrorIfValid(getErrorKey('postalCode'), nextAddress.postalCode, fieldPrefix === 'birthplace' ? { birthplaceAddress: nextAddress } : { addressData: nextAddress });
                        }} 
                        onBlur={() => onFieldTouch(getErrorKey('postalCode'))}
                        error={!!errors[getErrorKey('postalCode')]}
                        helperText={errors[getErrorKey('postalCode')]}
                        required 
                        fullWidth
                        inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }} 
                        {...textFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-mail-bulk mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    />
                )}
            </Box>

            {/* ROW 4 (Current Address) / ROW 3 (Birthplace): Complete Address Preview */}
            {buildCompleteAddress() && (
                <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #dee2e6' }}>
                        <Box sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <i className="fas fa-map-marker-alt"></i>
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