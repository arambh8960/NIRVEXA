import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice.js'

function useGetCurrentUser() {
    const dispatch=useDispatch();
    useEffect(() => {
        const fetchUser = async () => {
            try{
            const res = await axios.get(`${serverUrl}/api/user/profile`, { withCredentials: true });
            // Only set user data if it's a valid object (not an HTML string from a 404/redirect)
            if (res.data && typeof res.data === 'object' && res.data.role) {
                dispatch(setUserData(res.data));
            }
            }catch(err){
                console.log(err);
            }

        }
        fetchUser();

    },[])
}

export default useGetCurrentUser
