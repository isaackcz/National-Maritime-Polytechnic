/* global $ */
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useCountDaysWithoutSunday from '../../../../../../hooks/useCountDaysWithoutSunday';
import dayjs from 'dayjs';

const ModalNewTrainingSchedule = ({ data, modalTitle, id, httpMethod, callbackFunction }) => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [slot, setSlot] = useState('');
    const [venue, setVenue] = useState('');
    const [room, setRoom] = useState('');
    const [preference, setPreference] = useState('');
    const { countDays } = useCountDaysWithoutSunday();

    useEffect(() => {
        if(data) {
            setFromDate(dayjs(data.from_date));
            setToDate(dayjs(data.to_date));
            setSlot(data.slot);
            setVenue(data.venue);
            setRoom(data.room);
            setPreference(data.preference);
        }
    }, [data]);

    const ProcessModalFunc = () => {
        callbackFunction({
            'id' : data ? id : uuidv4(),
            'from_date' : fromDate.format('YYYY-MM-DD'),
            'to_date' : toDate.format('YYYY-MM-DD'),
            'slot' : slot,
            'venue' : venue,
            'room' : room,
            'preference' : preference
        });

        setFromDate(null);
        setToDate(null);
        setSlot('');
        setVenue('');
        setRoom('');
        setPreference('');

        $(`#training_schedule_${id}`).modal('hide');
    }

    return (
        <>
            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`training_schedule_${id}`}>
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header d-flex align-items-center justify-content-between">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                            {
                                fromDate && toDate && (
                                    <span className="modal-title text-bold text-primary">{countDays(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'))} days training</span>
                                )
                            }
                        </div>
                        <div className="modal-body pt-2">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer sx={{ marginBottom: '2px' }} components={['DatePicker']}>
                                    <DatePicker 
                                        value={fromDate} 
                                        minDate={dayjs()}
                                        onChange={(e) => setFromDate(e)} 
                                        label={<p>From <span className='text-danger'>*</span></p>} sx={{ width: '100%' }} 
                                    />
                                </DemoContainer>
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer sx={{ marginBottom: '2px' }} components={['DatePicker']}>
                                    <DatePicker 
                                        value={toDate} 
                                        minDate={fromDate}
                                        onChange={(e) => setToDate(e)} 
                                        label={<p>To <span className='text-danger'>*</span></p>} sx={{ width: '100%' }} 
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                            
                            <FormControl fullWidth margin='dense' variant="outlined">
                                <InputLabel htmlFor="slot">Slot <span className='text-danger'>*</span></InputLabel>
                                <OutlinedInput
                                    required
                                    value={slot}
                                    onChange={(e) => setSlot(e.target.value)}
                                    id="slot"
                                    type="number"
                                    label="Slot"
                                />
                            </FormControl>

                            <FormControl fullWidth margin='dense' variant="outlined">
                                <InputLabel htmlFor="venue">Venue <span className='text-danger'>*</span></InputLabel>
                                <OutlinedInput
                                    required
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    id="venue"
                                    type="text"
                                    label="Venue"
                                />
                            </FormControl>

                            <FormControl fullWidth margin='dense' variant="outlined">
                                <InputLabel htmlFor="room">Room <span className='text-danger'>*</span></InputLabel>
                                <OutlinedInput
                                    required
                                    value={room}
                                    onChange={(e) => setRoom(e.target.value)}
                                    id="room"
                                    type="text"
                                    label="room"
                                />
                            </FormControl>

                            <FormControl fullWidth margin='dense' variant="outlined">
                                <InputLabel id="demo-simple-preference">Preference</InputLabel>
                                <Select
                                    labelId="demo-simple-preference"
                                    id="demo-simple-select"
                                    value={preference}
                                    label="Preference"
                                    onChange={(e) => setPreference(e.target.value)}
                                >
                                    <MenuItem value="ONSITE">ONSITE</MenuItem>
                                    <MenuItem value="ASYNCHRONOUS">ASYNCHRONOUS</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <div className='mt-3'>
                                <div className='row'>
                                    <div className='col-6'>
                                        <button type="button" className="btn btn-block btn-default" data-dismiss="modal">Cancel</button>
                                    </div>

                                    <div className='col-6'>
                                        <button type="button" onClick={ProcessModalFunc} disabled={
                                            !fromDate || 
                                            !toDate || 
                                            !slot || 
                                            !venue || 
                                            !room || 
                                            !preference
                                        } className={`btn btn-block btn-${ httpMethod === 'POST' ? 'primary' : 'warning' } elevation-1`}>
                                            <i className='fas fa-save mr-2'></i> { httpMethod === 'POST' ? 'Save' : 'Save Changes' }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalNewTrainingSchedule;