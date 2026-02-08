import axios from 'axios'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)

  const fetchedRef = useRef(false) // ⛔ prevents multiple calls

  useEffect(() => {
    // 🔒 auth guard
    if (!userData?._id) return

    // 🔒 owner guard
    if (userData.role === 'owner' && !myShopData) return

    // ⛔ prevent refetch loop
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchOrders = async () => {
      try {
        const result = await axios.get(
          '/api/order/my-orders',
          { withCredentials: true }
        )
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.error("Fetch orders failed:", error)
      }
    }

    fetchOrders()
  }, [userData?._id, userData?.role, myShopData, dispatch])
}

export default useGetMyOrders
