import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice.js'

function useGetShopByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector(state => state.user)

  useEffect(() => {
    if (!currentCity) return

    const fetchShops = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          { withCredentials: true }
        )

        dispatch(setShopsInMyCity(res.data))
      } catch (err) {
        console.log(err)
      }
    }

    fetchShops()
  }, [currentCity, dispatch])
}

export default useGetShopByCity
