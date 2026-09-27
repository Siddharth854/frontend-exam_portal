import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import {handleError , handleSuccess} from '../utils'
import { useNavigate } from 'react-router-dom';


function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
    })
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name,value);
        const copySignupInfo = {...signupInfo};
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }
    //console.log(signupInfo);
    const handleSignup = async (e) => {
        e.preventDefault();
        // console.log('Signup form submitted', loginInfo);
        // Here you can add your signup logic, such as sending the data to a server
        const { name, email, password } = signupInfo;
        if(!name || !email || !password) {
            // Handle validation errors
            return handleError('Please fill in all fields');
        }
        try{
            const url = 'http://localhost:8080/auth/signup';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupInfo),
            });
            const result = await response.json();
            console.log(result);
            const {success, message} = result;
            if(success){
                handleSuccess('Signup successful');
                setTimeout(()=>{
                    navigate('/login');
                },1000)
            } else if(error){
                const details = error?.details[0].message;
                handleError(details);
            }
            else if(!success)
            {
                handleError(message);
            }
            console.log(result);

        }catch(err){
            handleError('An error occurred while signing up');
        }
    }
  return (
    <div className='container'>

      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        <div>
            <label htmlFor='name'>
                Name:
            </label>
            <input 
                onChange={handleChange}
                type='text'
                name ='name'
                autoComplete='off'
                autoFocus  
                placeholder='Enter your Name...'
                value={signupInfo.name}
            />
        </div>

         <div>
            <label htmlFor='email'>
                Email:
            </label>
            <input 
                onChange={handleChange}
                type='email'
                name ='email'
                value={signupInfo.email}
                placeholder='Enter your Email...'
            />
        </div>

         <div>
            <label htmlFor='password'>
                Password:
            </label>
            <input 
                onChange={handleChange}
                type='password'
                name ='password'
                value={loginInfo.password}
                placeholder='Enter your Password...'
            />
        </div>
        <button type='submit'>
            Login   
        </button>
        <span>Already have an account? <Link to='/login'>Login</Link></span>
      </form>
      <ToastContainer />
    </div>  
  )
}

export default Signup