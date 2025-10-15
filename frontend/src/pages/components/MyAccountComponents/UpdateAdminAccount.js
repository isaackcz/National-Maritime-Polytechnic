/* global $ */
import { useState } from "react";
import ViewPersonal from "./ViewPersonal";
import UpdatePersonalForm from "./UpdatePersonalForm";

const UpdateAdminAccount = ({ urlPrefix }) => {
    const [viewMode, setViewMode] = useState('view');

    return (
        <>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom px-3">
                <div>
                    <button onClick={() => setViewMode('view')} className={`text--fontPos13--xW8hS py-0 btn btn-${ viewMode === 'view' ? 'primary elevation-1' : 'default' }`}>
                        <i className="fas fa-eye mr-1"></i> View Mode
                    </button>
                    <button onClick={() => setViewMode('update')} className={`text--fontPos13--xW8hS py-0 btn btn-${ viewMode === 'update' ? 'primary elevation-1' : 'default' } ml-1`}>
                        <i className="fas fa-edit mr-1"></i> Update Mode
                    </button>
                </div>
            </div>

            <div className="card elevation-0 border-0 p-0 m-0 rounded-0">
                <div className='card-body p-0'>
                    {
                        viewMode === 'view' ? <ViewPersonal /> : <UpdatePersonalForm urlPrefix={urlPrefix} callbackFunction={() => setViewMode('view')} />
                    }
                </div>
            </div>
        </>
    )
}

export default UpdateAdminAccount;