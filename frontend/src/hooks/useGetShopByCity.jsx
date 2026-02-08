import { useEffect, useRef } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice.js'

function useGetShopByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector(state => state.user)

  const lastCityRef = useRef(null) // ⛔ prevent duplicate calls

  useEffect(() => {
    if (!currentCity) return

    // ⛔ do not refetch for same city
    if (lastCityRef.current === currentCity) return
    lastCityRef.current = currentCity

    const fetchShops = async () => {
      try {
        const res = await axios.get(
          `/api/shop/get-by-city/${encodeURIComponent(currentCity)}`
        )
        dispatch(setShopsInMyCity(res.data))
      } catch (err) {
        console.log('getShopByCity error:', err)
      }
    }

    fetchShops()
  }, [currentCity, dispatch])
}

export default useGetShopByCity
