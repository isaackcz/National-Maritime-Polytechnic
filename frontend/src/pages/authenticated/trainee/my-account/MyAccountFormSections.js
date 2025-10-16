import React, { useEffect, useState } from 'react';
import ImageCropModal from '../components/ImageCropModal';
import axios from 'axios';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';


export const ProfilePictureSection = ({ 
    avatarPreview, 
    fileInputRef, 
    CheckUploadedAvatar, 
    setAvatarPreview,
    trainee_general_info
}) => {
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();

    useEffect(() => {
        const currentProfile = trainee_general_info?.[0]?.profile_picture;
        if (currentProfile && !avatarPreview) {
            setAvatarPreview(currentProfile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trainee_general_info]);

    useEffect(() => {
        const fetchTraineeInfo = async () => {
            try {
                if (avatarPreview) return; // already set via props or prior fetch
                const token = getToken('csrf-token');
                const response = await axios.get(`${url}/my-account/get_trainee_general_info`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                });
                const info = response?.data?.trainee_general_info || response?.data?.data?.trainee_general_info;
                const profile = Array.isArray(info) ? info[0]?.profile_picture : info?.profile_picture;
                if (profile) {
                    setAvatarPreview(profile);
                }
            } catch (error) {
                console.error('Failed to fetch trainee general info:', error);
            }
        };
        fetchTraineeInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleCropComplete = async (croppedBlob) => {
        const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
        const croppedImageUrl = URL.createObjectURL(croppedBlob);
        setAvatarPreview(croppedImageUrl);

        // Keep existing local handling if used elsewhere
        const syntheticEvent = {
            target: {
                files: [croppedFile],
                value: ''
            }
        };
        CheckUploadedAvatar(syntheticEvent, 'avatar');

        // Submit directly from here
        try {
            setIsUploading(true);
            const token = getToken('csrf-token');
            const formData = new FormData();
            formData.append('profile_picture', croppedFile);
            await axios.post(`${url}/my-account/create_or_update_additional_info`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            // Surface in console for now; UI can be enhanced later
            console.error('Failed to upload profile picture:', error);
        } finally {
            setIsUploading(false);
        }
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
                                    <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-camera'} text-white`} style={{fontSize: '12px'}}></i>
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