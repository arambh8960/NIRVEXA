import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice.js'

function useGetMyShop() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    // 🔒 guard
    if (!userData?._id || userData.role !== 'owner') {
      dispatch(setMyShopData(null))
      return
    }

    const fetchShop = async () => {
      try {
        const res = await axios.get(
          '/api/shop/get-my',
          { withCredentials: true }
        )

        dispatch(setMyShopData(res.data))
      } catch (err) {
        console.error('Fetch my shop failed:', err)
        dispatch(setMyShopData(null)) // 👈 VERY IMPORTANT
      }
    }

    fetchShop()
  }, [userData?._id, userData?.role, dispatch])
}

export default useGetMyShop
