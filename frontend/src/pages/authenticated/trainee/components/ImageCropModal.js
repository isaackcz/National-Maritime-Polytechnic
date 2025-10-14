import { useState, useCallback } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slider, Typography } from '@mui/material';
import Cropper from 'react-easy-crop';

const ImageCropModal = ({ open, onClose, imageSrc, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
        handleClose();
    };

    const handleClose = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '15px', fontWeight: 600 }}>
                <i className="fas fa-crop mr-2 text-primary"></i>
                Crop Profile Picture
            </DialogTitle>
            <DialogContent>
                <Box sx={{ position: 'relative', width: '100%', height: 400, backgroundColor: '#000' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropAreaComplete}
                    />
                </Box>
                <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontSize: '13px', mb: 1, fontWeight: 500 }}>
                        <i className="fas fa-search-plus mr-1"></i>
                        Zoom Level
                    </Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e, zoom) => setZoom(zoom)}
                        size="small"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} sx={{ fontSize: '13px' }}>
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: '13px' }}>
                    <i className="fas fa-check mr-1"></i>
                    Save & Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Helper function to crop image
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
};

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

export default ImageCropModal;

