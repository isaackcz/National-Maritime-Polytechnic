import React, { useState, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';

const NMPDataTable = ({
    columns = [],
    progressPending = false,
    data = [],
    selectableRows = false,
    onSelectedRowsChange,
    selectedRows = []
}) => {
    const [searchText, setSearchText] = useState('');

    const customStyles = {
        headCells: { style: { fontWeight: 'bold' } }
    };

    const safeSelectedRows = Array.isArray(selectedRows) ? selectedRows.map(Number) : [];

    const handleSearch = (value) => setSearchText(String(value || '').toLowerCase());

    const filteredData = useMemo(() => {
        const q = (searchText || '').toLowerCase();
        return data.filter(item => {
            const parts = columns
                .filter(col => typeof col.selector === 'function')
                .map(col => {
                    try { return String(col.selector(item) || '') } catch { return '' }
                });

            if (parts.length === 0) {
                const { profile_picture, ...rest } = item || {};
                parts.push(JSON.stringify(rest || {}));
            }

            return parts.join(' ').toLowerCase().includes(q);
        });
    }, [data, columns, searchText]);

    const handleRowSelected = useCallback(({ selectedRows: currentSelectedRows = [] }) => {
        const eventIds = Array.isArray(currentSelectedRows) ? currentSelectedRows.map(r => Number(r.id)) : [];
        const prevIds = safeSelectedRows.slice(); // copy
        const visibleIds = filteredData.map(r => Number(r.id));
        const additions = eventIds.filter(id => !prevIds.includes(id));
        const removals = prevIds.filter(id => visibleIds.includes(id) && !eventIds.includes(id));

        let next = prevIds.filter(id => !removals.includes(id)).concat(additions);
        next = Array.from(new Set(next));

        const prevJson = JSON.stringify(prevIds);
        const nextJson = JSON.stringify(next);
        if (typeof onSelectedRowsChange === 'function' && prevJson !== nextJson) {
            onSelectedRowsChange(next);
        }
    }, [filteredData, safeSelectedRows, onSelectedRowsChange]);

    return (
        <>
            <input className="form-control form-control-sm w-100 mb-1" placeholder="Search" value={searchText} onChange={(e) => handleSearch(e.target.value)} />

            <DataTable
                keyField="id"
                customStyles={customStyles}
                progressPending={progressPending}
                columns={columns}
                data={filteredData}
                pagination
                selectableRows={selectableRows}
                onSelectedRowsChange={handleRowSelected}
                selectableRowSelected={(row) => safeSelectedRows.includes(Number(row.id))}
            />
        </>
    );
};

export default NMPDataTable;
