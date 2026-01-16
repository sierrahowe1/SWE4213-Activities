import InputField from "./InputField";
import MyButton from "./MyButton";
import { useState } from "react";
import Rating from "@mui/material/Rating";


export default function Form() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        rating: 3,
        
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function onSubmit(e) {
        e.preventDefault();

        // TODO 7: Log all of the values to the console 
        console.log("Name: ", form.name);
        console.log("Email", form.email);
        console.log("Phone Number: ", form.phoneNumber);


        // TODO 7: Reset the form after submitting it 
        setForm({
            name : "",
            email: "",
            phoneNumber: "",

        });

    }

    return (
        <form>
            <InputField label="Name" placeholder="Enter your name..." value={form.name} name="name" onChange={handleChange} />
            <br />
            <InputField label="Email" placeholder="Enter your email..." value={form.email} name="email" onChange={handleChange} />
            <br />
            <InputField label="Phone Number" placeholder="Enter your phone number..." value={form.phoneNumber} name="phoneNumber" onChange={handleChange} />

            <Rating name="rating" value={form.rating} onChange={(e, newValue) => {setForm((prev) => ({ ...prev, rating: newValue}));}} />

           <MyButton onClick={onSubmit} /> 

        </form>
    );
}