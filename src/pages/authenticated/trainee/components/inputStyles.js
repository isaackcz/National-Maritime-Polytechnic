/**
 * Common input styles for consistency across all form inputs
 */

// Common TextField props
export const textFieldProps = {
    size: "small",
    fullWidth: true,
    InputProps: { 
        sx: { 
            fontSize: '13px',
            width: '100%'
        } 
    },
    InputLabelProps: { sx: { fontSize: '13px' } }
};

// Date input specific props
export const dateFieldProps = {
    ...textFieldProps,
    type: "date",
    InputLabelProps: { 
        shrink: true, 
        sx: { fontSize: '13px' } 
    }
};

// File input specific props
export const fileFieldProps = {
    ...textFieldProps,
    type: "file",
    InputLabelProps: { 
        shrink: true, 
        sx: { fontSize: '13px' } 
    },
    inputProps: { 
        accept: 'image/*,application/pdf' 
    }
};

// Common Select props
export const selectProps = {
    size: "small",
    fullWidth: true,
    sx: { fontSize: '13px' }
};

// Common InputLabel props for Select
export const selectLabelProps = {
    sx: { fontSize: '13px' }
};

// Common MenuItem props
export const menuItemProps = {
    sx: { fontSize: '13px' }
};

// PhoneInput with country code style
export const phoneInputStyle = {
    inputStyle: { 
        width: '100%', 
        height: '32px', 
        fontSize: '13px', 
        paddingLeft: '48px'
    },
    containerStyle: { 
        width: '100%' 
    },
    buttonStyle: { 
        border: '1px solid #c4c4c4', 
        borderRight: 'none',
        height: '32px',
        backgroundColor: '#fafafa'
    },
    dropdownStyle: {
        fontSize: '13px'
    }
};

// PhoneInput wrapper component props
export const phoneInputWrapperProps = {
    country: 'ph',
    enableSearch: true,
    ...phoneInputStyle
};

// Radio button props
export const radioProps = {
    size: "small"
};

// Radio label props
export const radioLabelProps = {
    sx: { fontSize: '13px' }
};

// Radio group label props
export const radioGroupLabelProps = {
    sx: { fontSize: '13px', fontWeight: 500 }
};

// Common FormLabel props
export const formLabelProps = {
    sx: { fontSize: '0.75rem', mb: 0.5, display: 'block', fontWeight: 500 }
};

// Common section title props
export const sectionTitleProps = {
    sx: { mb: 1, display: 'block', fontWeight: 'bold', fontSize: '13px' }
};

// Password input specific props (with FormControl)
export const passwordInputProps = {
    className: 'form-control form-control-sm',
    variant: "outlined",
    fullWidth: true,
    sx: { fontSize: '13px' }
};

// Password InputLabel props
export const passwordLabelProps = {
    sx: { fontSize: '13px' }
};

// Password OutlinedInput props
export const passwordFieldProps = {
    required: true,
    sx: { fontSize: '13px' }
};

