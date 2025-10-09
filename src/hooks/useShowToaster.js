import { Alert, Box, Snackbar } from '@mui/material';
import React, { useState } from 'react'

const useShowToaster = () => {
    const [openToast, setOpenToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastStatus, setToastStatus] = useState("");
    const handleClose = () => setOpenToast(false);

    const Toast = () => {
        return (
            <>
                <Box style={{ width: 500 }}>
                    <Snackbar
                        autoHideDuration={2500}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={openToast}
                        onClose={handleClose}
                        key={'top' + 'right'}
                    >
                        <Alert onClose={handleClose} severity={toastStatus} variant="filled" sx={{ width: '100%' }}>
                            { toastMessage }
                        </Alert>
                    </Snackbar>
                </Box>
            </>
        );
    }

    return { setOpenToast, Toast, setToastMessage, setToastStatus };
}

export default useShowToaster;
