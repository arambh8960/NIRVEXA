import { useEffect, useRef } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice.js'

function useGetItemsByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector(state => state.user)

  const lastCityRef = useRef(null) // ⛔ prevent duplicate calls

  useEffect(() => {
    if (!currentCity) return

    // ⛔ do not refetch for same city
    if (lastCityRef.current === currentCity) return
    lastCityRef.current = currentCity

    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `/api/item/get-by-city/${encodeURIComponent(currentCity)}`
        )
        dispatch(setItemsInMyCity(res.data))
      } catch (err) {
        console.log('getItemsByCity error:', err)
      }
    }

    fetchItems()
  }, [currentCity, dispatch])
}

export default useGetItemsByCity
