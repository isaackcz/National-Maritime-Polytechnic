import { useState } from 'react';
import { Box, Typography, Button, Modal, IconButton } from '@mui/material';
import { formLabelProps } from './inputStyles';

const DragDropFileInput = ({ label, onChange, accept = 'image/*,application/pdf', fileName: externalFileName, error, filePreviewUrl = null }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
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
            
            // Create preview URL for images
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
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
            
            // Create preview URL for images
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<i className="fas fa-eye" style={{ fontSize: '10px' }}></i>}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewModalOpen(true);
                                }}
                                sx={{ 
                                    fontSize: '10px', 
                                    py: 0.5, 
                                    px: 1.5,
                                    minWidth: 'auto',
                                    borderColor: '#0078d4',
                                    color: '#0078d4',
                                    '&:hover': {
                                        borderColor: '#106ebe',
                                        backgroundColor: '#f3f2f1'
                                    }
                                }}
                            >
                                View
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<i className="fas fa-edit" style={{ fontSize: '10px' }}></i>}
                                sx={{ 
                                    fontSize: '10px', 
                                    py: 0.5, 
                                    px: 1.5,
                                    minWidth: 'auto',
                                    borderColor: '#28a745',
                                    color: '#28a745',
                                    '&:hover': {
                                        borderColor: '#218838',
                                        backgroundColor: '#d4edda'
                                    }
                                }}
                            >
                                Change
                            </Button>
                        </Box>
                        <Typography sx={{ fontSize: '11px', color: '#6c757d', mt: 0.5 }}>
                            Click anywhere else to change file
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
            
            {/* File Preview Modal */}
            <Modal
                open={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        backgroundColor: 'white',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 24
                    }}
                >
                    {/* Modal Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2, 
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#f5f5f5'
                    }}>
                        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#323130' }}>
                            {label} - {fileName}
                        </Typography>
                        <IconButton 
                            onClick={() => setPreviewModalOpen(false)}
                            sx={{ 
                                color: '#666',
                                '&:hover': { backgroundColor: '#e0e0e0' }
                            }}
                        >
                            <i className="fas fa-times" style={{ fontSize: '16px' }}></i>
                        </IconButton>
                    </Box>
                    
                    {/* Modal Content */}
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        {previewUrl || filePreviewUrl ? (
                            // Show image preview
                            <img 
                                src={previewUrl || filePreviewUrl} 
                                alt={fileName}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                                onError={(e) => {
                                    console.log("Image preview error:", e.target.src);
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}
                        
                        {/* Fallback for non-image files or loading errors */}
                        <Box sx={{ 
                            display: previewUrl || filePreviewUrl ? 'none' : 'block',
                            p: 4,
                            textAlign: 'center'
                        }}>
                            <i className="fas fa-file" style={{ fontSize: '4rem', color: '#666', marginBottom: '1rem' }}></i>
                            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                                File Preview Not Available
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: '14px' }}>
                                This file type cannot be previewed in the browser.
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: '12px', mt: 1 }}>
                                File: {fileName}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default DragDropFileInput;

