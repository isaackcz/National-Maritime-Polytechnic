import React, { useState } from 'react';
import ImageCropModal from '../components/ImageCropModal';

/**
 * Profile Picture Upload Section
 */
export const ProfilePictureSection = ({ 
    avatarPreview, 
    fileInputRef, 
    CheckUploadedAvatar, 
    setAvatarPreview 
}) => {
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBlob) => {
        // Create File object from blob
        const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
        
        // Create object URL for preview
        const croppedImageUrl = URL.createObjectURL(croppedBlob);
        setAvatarPreview(croppedImageUrl);
        
        // Create synthetic event for CheckUploadedAvatar
        const syntheticEvent = {
            target: {
                files: [croppedFile],
                value: ''
            }
        };
        CheckUploadedAvatar(syntheticEvent, 'avatar');
    };

    return (
    <>
    <div className="row mb-3">
        <div className="col-12">
            <div className="card shadow-sm border-0" style={{ backgroundColor: '#fafafa' }}>
                <div className="card-body p-3">
                    <div className="row align-items-center">
                        <div className="col-md-3 col-12 text-center mb-3 mb-md-0">
                            <div className="position-relative d-inline-block">
                                <div 
                                    className="bg-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden shadow-sm" 
                                    style={{
                                        width: '110px', 
                                        height: '110px', 
                                        border: '3px solid #0078d4', 
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Profile preview" 
                                            className="w-100 h-100"
                                            style={{objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <i className="fas fa-user text-muted" style={{fontSize: '2.5rem'}}></i>
                                    )}
                                </div>
                                <div 
                                    className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        bottom: '5px',
                                        right: '5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="fas fa-camera text-white" style={{fontSize: '12px'}}></i>
                                </div>
                                <input
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelect}
                                    className="d-none"
                                />
                            </div>
                        </div>
                        <div className="col-md-9 col-12">
                            <h6 className="mb-2 font-weight-bold" style={{ color: '#323130', fontSize: '15px' }}>
                                <i className="fas fa-image mr-2 text-primary"></i>
                                Profile Picture
                            </h6>
                            <p className="text-muted mb-2" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                Click the profile picture or camera icon to upload your photo. You can crop and adjust the image after selecting.
                            </p>
                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                <i className="fas fa-check-circle text-success mr-1"></i>
                                Any image size - You'll crop it to square after upload
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ImageCropModal 
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
    />
    </>
);
};

/**
 * Alert Box Component
 */
export const AlertBox = ({ type = 'info', icon, title, message, color = '#0078d4', bgColor = '#e7f3ff' }) => (
    <div className={`alert alert-${type} border-0 shadow-sm mb-3`} style={{ backgroundColor: bgColor, borderLeft: `3px solid ${color}`, padding: '0.75rem 1rem' }}>
        <div className="row align-items-center">
            <div className="col-auto">
                <span className={`fas fa-${icon}`} style={{ fontSize: '18px', color }}></span>
            </div>
            <div className="col" style={{ fontSize: '12px', lineHeight: '1.5', color: 'black' }}>
                <strong className="d-block mb-1" style={{ fontSize: '13px' }}>{title}</strong>
                {message}
            </div>
        </div>
    </div>
);
