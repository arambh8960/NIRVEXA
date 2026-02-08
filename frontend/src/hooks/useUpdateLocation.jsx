import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const useUpdateLocation = () => {
  const { userData } = useSelector(state => state.user);
  const { location } = useSelector(state => state.map);

  const lastSentRef = useRef({ lat: null, lon: null });

  useEffect(() => {
    // ✅ sirf deliveryBoy ke liye
    if (userData?.role !== "deliveryBoy") return;

    if (!userData?._id) return;
    if (!location?.lat || !location?.lon) return;

    if (
      lastSentRef.current.lat === location.lat &&
      lastSentRef.current.lon === location.lon
    ) {
      return;
    }

    lastSentRef.current = {
      lat: location.lat,
      lon: location.lon,
    };

    const updateLocation = async () => {
      try {
        await axios.post(
          "/api/user/update-location",
          {
            latitude: location.lat,
            longitude: location.lon,
          },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Location update failed:", err.response?.data || err.message);
      }
    };

    updateLocation();
  }, [userData?._id, userData?.role, location?.lat, location?.lon]);
};

export default useUpdateLocation;
