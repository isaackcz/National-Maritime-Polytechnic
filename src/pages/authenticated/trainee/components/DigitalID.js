import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const DigitalID = ({ id }) => {
    const link = `http://localhost:3000/trainee/dashboard/digital?id=${id}`;

    return (
        <>
            <div
                className="modal fade"
                id={`digitalID-${id}`}
                data-backdrop="static"
                data-keyboard="false"
            >
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content small">
                        <div className="modal-header">
                            <strong>My Digital ID</strong>
                        </div>

                        <div className="modal-body text-center">
                            <p>Scan this QR to view your digital ID:</p>

                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <QRCodeCanvas
                                    value={link}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a1a"
                                    style={{
                                        borderRadius: '10px',
                                        padding: '2px',
                                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                                    }}
                                />

                                <img
                                    src="/system-images/62334fcadd0d9e6d0a152aca.png"
                                    alt="QR Logo"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                    }}
                                />
                            </div>

                            <p className="mt-3 small text-muted">{link}</p>
                        </div>

                        <div className="modal-footer py-1">
                            <button className="btn btn-default btn-sm" data-dismiss="modal">
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DigitalID;
