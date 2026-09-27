import React,{useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {handleError , handleSuccess} from '../utils'
import {ToastContainer} from 'react-toastify'

function Home() {
const [loggedInUser, setLoggedInUser] = React.useState(localStorage.getItem('loggedInUser') || '');
const [products, setProducts] = useState([]);
const navigate = useNavigate();
const handleLayout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedInUser');
  handleSuccess('Logout successful');
  setTimeout(()=>{
    navigate('/login');
  },1000)
}
useEffect(()=>{
  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleError('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/products', {
        headers: { Authorization: token },
      });
      const result = await response.json();
      if (!response.ok) {
        handleError(result.message || 'Unable to load products');
        return;
      } 
      console.log(result);
      setProducts(result);
    } catch (err) {
      handleError('Unable to connect to the server');
    }
  };

  fetchProducts();
}, [navigate]);

return (
    <div>
      <h1> {loggedInUser} </h1>
      <button onClick={handleLayout}>Logout</button>
      <div>
        {
          products && products?.map((item, index)=>(
            <ul key={index}>
              <span>{item.name}: ${item.price.toFixed(2)}</span>
            </ul>
          ))
        }
      </div>
      <ToastContainer />
    </div>  
  )
}

export default Home