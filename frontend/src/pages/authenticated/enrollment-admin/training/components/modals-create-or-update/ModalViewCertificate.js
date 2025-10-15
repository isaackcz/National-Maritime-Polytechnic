import React from 'react'
import {QRCodeSVG} from 'qrcode.react';
import dayjs from 'dayjs';
import useConvertCustomSyntaxToHTML from '../../../../../../hooks/useConvertCustomSyntaxToHTML';

const ModalViewCertificate = ({data, id}) => {
    const { convertText } = useConvertCustomSyntaxToHTML();

    return (
        <>
            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`view_certificate_${id}`}>
                <div className="modal-dialog modal-xl rounded-0">
                    <div className="modal-content rounded-0">
                        <div className="modal-body">
                            <div className='p-2' style={{ border: '3px solid black' }}>
                                <img src='/system-images/certificate-header-img.png' className='img-fluid' />

                                <div className='my-3'>
                                    <div className='row h4'>
                                        <div className='col-9 text-right'>Certificate No.</div>
                                        <div className='col-3'>NMPCERT-{dayjs(data?.created_at).year()}-{data?.id.toString().padStart(4, '0')}</div>
                                        <div className='col-9 text-right'>Registration No.</div>
                                        <div className='col-3'>{dayjs(data?.created_at).year()}{data?.id.toString().padStart(4, '0')}</div>
                                    </div>
                                </div>

                                <div className='mb-0 mt-5 text-center' style={{ fontFamily: 'Abril Fatface', fontSize: '50px', fontWeight: 'bolder' }}>
                                    CERTIFICATE OF COMPLETION
                                </div>

                                <div className='mb-4 mt-3 text-center' style={{ fontFamily: 'Arial', fontSize: '25px' }}>
                                    This certificate is issued to
                                </div>

                                <div className='mb-0 px-4 text-center' style={{ fontFamily: 'Abril Fatface', fontSize: '40px', fontWeight: 'bolder', marginTop: '30px' }}>
                                    <u>[TRAINEE NAME]</u>
                                </div>

                                <div className='mt-2 px-4 text-center' style={{ fontFamily: 'Arial', fontSize: '25px' }}>
                                    {data?.header}
                                </div>

                                <div className='mb-3 mt-2 px-4 text-center' style={{ fontFamily: 'Arial', fontSize: '25px' }}>
                                    {data?.header_1}
                                </div>

                                <div className='mb-4 px-4 mt-2 text-center' style={{ fontFamily: 'Arial', fontSize: '25px' }}>
                                    {data?.header_2}
                                </div>

                                <div className='mb-0 px-4' style={{ lineHeight: '35px', fontFamily: 'Arial', fontSize: '23px', marginTop: '10px', textAlign: 'justify' }}>
                                    {data?.body}
                                </div>

                                <div style={{ fontFamily: 'Arial', fontSize: '23px', marginTop: '80px', textAlign: 'justify' }}>
                                    <div className='row'>
                                        <div className='col-xl-5 text-center'>
                                            <strong>
                                                <u>JOEL B. MAGLUNGSOD</u>
                                            </strong><br/>
                                            Executive Director III
                                        </div>

                                        <div className='col-xl-7 text-center'>
                                            <strong>
                                                <u>CAPT. EMMANUEL JESUS M. LAGUTAN</u>
                                            </strong><br/>
                                            Head, Maritime Training and Assessment Division
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-5 mb-4 text-center'>
                                    <QRCodeSVG value={data?.id} size={200} />,
                                </div>
                            </div>
                        </div>

                        <div className='modal-footer py-1'>
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalViewCertificate;