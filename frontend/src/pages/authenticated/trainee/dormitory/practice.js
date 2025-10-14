import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import axios from "axios";
import { useState } from "react";


const Practice = () => { 
    const [Fname, setFname] = useState("");
    const [Lname, setLname] = useState("");
    const [PopUp, setPopUp] = useState(false);


    const FormSubmit = async (e) =>{
        e.preventDefault();

        try{
            PopUp(true);
            const formData = new FormData();
            formData.append('Fname', Fname);
            formData.append('Lname', lname);

            const response = await axios.post('${url}/save', formData,{ 
                
            })
        }catch{

        }

    }
return(
<form method="POST" onSubmit={Practice}>
    <FormControl className='form-control form-control-sm' variant="standard">
        <InputLabel htmlFor="FirstName">
        First Name
        <span className="text-danger">*</span>
        </InputLabel>
        <OutlinedInput
            required
            value={Fname}
            onChange={(Fname) => setFname(Fname.target.value)}
            id="Fname"
            type="text"
            label="FirstName" 
        />
    </FormControl>
        <FormControl className='form-control form-control-sm' variant="standard">
            <InputLabel htmlFor="LastName">
            Last Name
            <span className="test-danger">*</span>
            </InputLabel>
            <OutlinedInput
            required
            value={Lname}
            onChange={(Lname) => setLname(Lname.target.value)}
            id="Lname"
            type="text"
            label="LastName"
            />
        </FormControl>
        <button type="submit">
            submit
        </button>
</form>
)
}
export default Practice;