import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentCity, setCurrentState, setUserData,setCurrentAddress } from '../redux/userSlice.js'





export default  function useGetCity() {
  const dispatch=useDispatch();
  const {userData}=useSelector(state=>state.user)
  const apiKey=import.meta.env.VITE_GEOAPIKEY;
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
    
    const latitute=position.coords.latitude;
    const longitude=position.coords.longitude;
    //to get api i visited geoapify website
    //Reverse geocoding api
    try {
    const res=await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitute}&lon=${longitude}&format=json&apiKey=${apiKey}`)
    const result = res.data.results[0];
    // Fallback to town, village, or county if city is undefined
    const city = result?.city || result?.town || result?.village || result?.county;
    dispatch(setCurrentCity(city));
    dispatch(setCurrentState(result?.state))
    dispatch(setCurrentAddress(result?.formatted))
    } catch (error) {
      console.error("Error fetching city:", error);
    }


    
    })
  },[])
  
  
}
