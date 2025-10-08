import { LinearProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const useShowSubmitLoader = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const progressRef = useRef(() => {});

    useEffect(() => {
        progressRef.current = () => {
            if (progress > 100) {
                setProgress(0);
                setBuffer(10);
            } else {
                const diff = Math.random() * 10;
                const diff2 = Math.random() * 10;
                setProgress((prev) => Math.min(prev + diff, 100));
                setBuffer((prev) => Math.min(prev + diff + diff2, 100));
            }
        };
    }, [progress]);

    useEffect(() => {
        if (showLoader) {
            const timer = setInterval(() => {
                progressRef.current();
            }, 500);
            return () => clearInterval(timer);
        }
    }, [showLoader]);

    const SubmitLoadingAnim = ({ cls }) => {
        return <>
            { showLoader && (
                <div className={cls}>

                    {
                        cls === 'loader2'
                            ? <img src="/system-images/am-spinner-1.gif" alt="" height="100"/>
                            : <>
                                <div className='bg-white w-25' style={{ padding: '40px' }}>
                                    <LinearProgress 
                                        enableTrackSlot 
                                        variant="buffer" 
                                        value={progress}  
                                        valueBuffer={buffer}
                                    />
                                </div>
                            </>
                    }
                </div>
            )}
        </>
    }

    return { showLoader, setShowLoader, setProgress, SubmitLoadingAnim };
}

export default useShowSubmitLoader;