import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx'
import { useDispatch } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice.js'

function useGetMyShop() {
    const dispatch=useDispatch();
    useEffect(() => {
        const fetchShop = async () => {
            try{
            const res = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true });
            // Only set user data if it's a valid object (not an HTML string from a 404/redirect)
          
                dispatch(setMyShopData(res.data));
            
            }catch(err){
                console.log(err);
            }

        }
        fetchShop();

    },[])
}

export default useGetMyShop

