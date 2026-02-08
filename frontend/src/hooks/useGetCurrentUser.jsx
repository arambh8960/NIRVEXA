import { useEffect } from "react"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { setUserData, setLoading } from "../redux/userSlice"

function useGetCurrentUser() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    // ✅ agar user already hai → dobara API mat maaro
    if (userData) {
      dispatch(setLoading(false))
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/profile", {
          withCredentials: true
        })

        dispatch(setUserData(res.data))
      } catch (err) {
        // ❗ 401 = normal (not logged in)
        dispatch(setUserData(null))
      } finally {
        dispatch(setLoading(false)) // 🔑 VERY IMPORTANT
      }
    }

    fetchUser()
  }, []) // 🔥 EMPTY dependency = NO LOOP
}

export default useGetCurrentUser
