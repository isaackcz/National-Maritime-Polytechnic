/* global $ */
import React, { useEffect } from 'react'

const DpoDpsModal = () => {
    useEffect(() => {
        $('#dpo_dps_modal').modal('show');
    }, []);

    return (
        <>
            <div className='modal fade' id='dpo_dps_modal' data-backdrop="static" data-keyboard="false">
                <div className='modal-dialog modal-dialog-scrollable'>
                    <div className='modal-content small'>
                        <div className='modal-body text-justify'>
                            <div className='text-center mb-2'>
                                <img src='/system-images/NPC_SOR_2026.jpg' height="300" />
                            </div>

                            <p> 
                                <strong>DECLARATION OF CONSENT:</strong> “By using this online registration, I/we (as “Data Subject”) grant my/our free, voluntary and unconditional consent to the collection and processing of all Personal Data (as defined below), and account or transaction information or records (collectively, the “information”) relating to me/us disclosed/transmitted by me/us in person or by my/our authorized agent/s or representatives to the information database system of the <strong>Department of Migrant Workers – National Maritime Polytechnic (DMW-NMP)</strong> and/or any of its authorized agent/s or representatives, by whatever means in accordance with Republic Act (R.A.) 10173, otherwise known as the <strong>“Data Privacy Act of 2012”</strong> of the Republic of the Philippines, including its Implementing Rules and Regulations (IRR) as well as all other guidelines and issuances by the <strong>National Privacy Commission (NPC)</strong>.
                            </p>

                            <p>
                                I/We understand that my/our <strong>“Personal Data”</strong> means any information, whether recorded in a material form or not, (a) from which the identity of an individual is apparent or can be reasonably and directly ascertained by the entity holding the information, or when put together with other information would directly and certainly identify an individual, (b) about an individual’s race, ethnic origin, marital status, age, color, gender, health, education and religious and/or political affiliations, (c) referring to any proceeding for any offense committed or alleged to have been committed by such individual, the disposal of such proceedings, or the sentence of any court in such proceedings, and (d) issued by government agencies peculiar to an individual which includes, but not limited to, social security numbers and licenses.
                            </p>
                        </div>

                        <div className='modal-footer py-1'>
                            <button className='btn btn-default btn-sm btn-block' data-dismiss="modal">AGREE</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DpoDpsModal;
