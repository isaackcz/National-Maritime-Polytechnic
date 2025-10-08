import React from 'react'

const CitizenCharterModal = ({ id }) => {
    return (
        <>
            <div className='modal fade' id={`${id}`} data-backdrop="static" data-keyboard="false">
                <div className='modal-dialog modal-dialog-scrollable modal-xl'>
                    <div className='modal-content small'>
                        <div className='modal-header'>
                            <strong>Citizen's Charter</strong>
                        </div>
                        <div className='modal-body text-justify'>
                            <div className='text-center mb-2'>
                                <img src='/system-images/CC-Registration-NMP-2.jpg' className='img-fluid'/>
                            </div>
                        </div>

                        <div className='modal-footer py-1'>
                            <button className='btn btn-default btn-sm' data-dismiss="modal">CLOSE</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CitizenCharterModal;