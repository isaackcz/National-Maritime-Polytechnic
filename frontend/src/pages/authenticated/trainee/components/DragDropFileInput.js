import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { formLabelProps } from './inputStyles';

const DragDropFileInput = ({ label, onChange, accept = 'image/*,application/pdf', fileName: externalFileName, error }) => {
    const [isDragging, setIsDragging] = useState(false);
    // CRITICAL FIX: Use external fileName if provided, otherwise use internal state
    // This fixes the bug where file name disappears when navigating between stepper steps
    const [internalFileName, setInternalFileName] = useState('');
    const fileName = externalFileName || internalFileName;
    
    // Determine border color based on state
    const getBorderColor = () => {
        if (error) return '#f44336'; // Red for error
        if (fileName) return '#28a745'; // Green for uploaded
        if (isDragging) return '#0078d4'; // Blue for dragging
        return '#ccc'; // Default gray
    };
    
    // Determine background color
    const getBackgroundColor = () => {
        if (error) return '#ffebee'; // Light red for error
        if (fileName) return '#d4edda'; // Light green for uploaded
        if (isDragging) return '#e7f3ff'; // Light blue for dragging
        return '#fafafa'; // Default
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            
            // Validate file type
            if (accept && !file.type.match(accept.replace(/,/g, '|').replace(/\*/g, '.*'))) {
                alert(`❌ Invalid file type. Please upload: ${accept}`);
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ File size too large. Maximum size is 5MB.');
                return;
            }
            
            if (!externalFileName) {
                setInternalFileName(file.name);
            }
            const syntheticEvent = { target: { files: [file] }, fileName: file.name };
            onChange(syntheticEvent);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ File size too large. Maximum size is 5MB.');
                e.target.value = '';
                if (!externalFileName) {
                    setInternalFileName('');
                }
                return;
            }
            
            if (!externalFileName) {
                setInternalFileName(file.name);
            }
            onChange({ ...e, fileName: file.name });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography component="label" {...formLabelProps}>{label}</Typography>
            <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-${label}`).click()}
                sx={{
                    width: '100%',
                    border: `2px ${error ? 'solid' : 'dashed'} ${getBorderColor()}`,
                    borderRadius: 1,
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: getBackgroundColor(),
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: error ? '#d32f2f' : (fileName ? '#28a745' : '#0078d4'),
                        backgroundColor: error ? '#ffcdd2' : (fileName ? '#c3e6cb' : '#f5f5f5')
                    }
                }}
            >
                {error ? (
                    <>
                        <i className="fas fa-exclamation-circle" style={{ fontSize: '1.5rem', color: '#f44336', marginBottom: '0.5rem', display: 'block' }}></i>
                        <Typography sx={{ fontSize: '13px', color: '#d32f2f', mb: 0.5, fontWeight: 500 }}>
                            {error}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6c757d' }}>
                            Click to upload file
                        </Typography>
                    </>
                ) : fileName ? (
                    <>
                        <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', color: '#28a745', marginBottom: '0.5rem', display: 'block' }}></i>
                        <Typography sx={{ fontSize: '13px', color: '#28a745', mb: 0.5, fontWeight: 500 }}>
                            ✓ File selected: {fileName}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6c757d' }}>
                            Click to change file
                        </Typography>
                    </>
                ) : (
                    <>
                        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#0078d4', marginBottom: '0.5rem', display: 'block' }}></i>
                        <Typography sx={{ fontSize: '13px', color: '#323130', mb: 0.5 }}>
                            Drag & drop file here or click to browse
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6c757d' }}>
                            Supports: Images and PDF files (Max 5MB)
                        </Typography>
                    </>
                )}
                <input
                    id={`file-${label}`}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </Box>
        </Box>
    );
};

export default DragDropFileInput;

