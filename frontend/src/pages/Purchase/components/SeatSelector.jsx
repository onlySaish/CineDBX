import { useEffect, useState } from "react";
import axios from "axios";
import HashLoader from "react-spinners/HashLoader";
import { useDispatch, useSelector } from "react-redux";
import { setSeat } from "../../../reducers/cartSlice";

export const SeatSelector = ({ seatsData, setSeatsData, paymentOngoing }) => {
  const override = {
    display: "block",
    margin: "1.6rem auto",
  };

  const [loading, setLoading] = useState(false);

  const {
    movie_id: userMovieId,
    hall_id: userHallId,
    showtime_id: userShowtimeId,
    seat_id_list: userSeatList,
  } = useSelector((store) => store.cart);

  const dispatch = useDispatch();
  const { signedPerson } = useSelector((store) => store.authentication);
  const [lockedSeats, setLockedSeats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/seats`,
          {
            userShowtimeId,
            userHallId,
            userMovieId,
          }
        );
        setSeatsData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userHallId, userShowtimeId, userMovieId, setSeatsData]);

  useEffect(() => {
    if (!userShowtimeId) return;
    const fetchLocks = async () => {
      try {
        const resp = await axios.post(`${import.meta.env.VITE_API_URL}/lockedSeats`, { showtime_id: userShowtimeId });
        setLockedSeats(resp.data);
      } catch (e) { console.error(e); }
    };
    fetchLocks();
    const interval = setInterval(fetchLocks, 3000);
    return () => clearInterval(interval);
  }, [userShowtimeId]);

  const handleSeatClick = async (seat) => {
    if (seat.booked_status === 0) return;
    
    const isLockedByOther = lockedSeats.some(l => l.seat_id === seat.seat_id && l.user_email !== (signedPerson?.email || "guest"));
    if (isLockedByOther) {
      alert("Seat already taken!");
      return;
    }

    const isCurrentlySelected = userSeatList.includes(seat.seat_id);
    if (!isCurrentlySelected) {
       try {
         const resp = await axios.post(`${import.meta.env.VITE_API_URL}/lockSeat`, {
           seat_id: seat.seat_id,
           showtime_id: userShowtimeId,
           user_email: signedPerson?.email || "guest",
         });
         if (!resp.data.success) {
           alert("Seat already locked!");
           return;
         }
       } catch (e) {
         console.error(e);
       }
    } else {
       try {
         await axios.post(`${import.meta.env.VITE_API_URL}/unlockSeat`, {
           seat_id: seat.seat_id,
           showtime_id: userShowtimeId,
           user_email: signedPerson?.email || "guest",
         });
       } catch (e) {
         console.error(e);
       }
    }
    dispatch(setSeat(seat.seat_id));
  };

  let rows = [];
  let rowSeat = [];

  // seatsData.forEach((seat) => {
  //   return seat.selected && userSeat.push(seat.seat_id);
  // });

  seatsData.forEach((seat, idx) => {
    let seatStatus;

    seat.booked_status === 0
      ? (seatStatus = "booked")
      : (seatStatus = "available");

    const isLockedByOther = lockedSeats.some(l => l.seat_id === seat.seat_id && l.user_email !== (signedPerson?.email || "guest"));
    if (isLockedByOther) seatStatus = "booked";

    const handleTouchStart = (e) => {
      e.preventDefault();
      handleSeatClick(seat);
    };

    const seatHtml = (
      <div
        className={`seat ${seatStatus}`}
        disabled={loading || paymentOngoing || isLockedByOther}
        onClick={() => seatStatus !== "booked" && handleSeatClick(seat)}
        onTouchEnd={seatStatus !== "booked" ? handleTouchStart : undefined}
        key={seat.seat_id}
        style={{
          backgroundColor: userSeatList.includes(seat.seat_id) ? "#ef5e78" : "",
        }}
      >
        {seat.seat_name}
      </div>
    );

    if (idx === 0) {
      rowSeat.push(seatHtml);
    } else if (
      seatsData[idx].seat_name[0] !== seatsData[idx - 1].seat_name[0]
    ) {
      rows.push(
        <div className="row" key={seatsData[idx - 1].seat_name[0]}>
          {rowSeat}
        </div>
      );
      rowSeat = [];
      rowSeat.push(seatHtml);
    } else if (idx === seatsData.length - 1) {
      rowSeat.push(seatHtml);
      rows.push(
        <div className="row" key={seatsData[idx - 1].seat_name[0]}>
          {rowSeat}
        </div>
      );
    } else {
      rowSeat.push(seatHtml);
    }
  });

  return (
    <div>
      <div className="form-item-heading">Select Seat</div>
      {loading && <HashLoader cssOverride={override} color="#eb3656" />}
      {!loading && (
        <>
          <div className="seat-guide-container">
            <div className="seat-available-demo"></div>
            <p className="seat-status-details">Available</p>
            <div className="seat-booked-demo"></div>
            <p className="seat-status-details">Booked</p>
            <div className="seat-selected-demo"></div>
            <p className="seat-status-details">Selected</p>
          </div>
          <div className="theatre-screen">
            <div className="screen-1"></div>
            <div className="screen-2"></div>
          </div>
          <div className="theatre-screen-heading">Theatre Screen</div>
          <div className="seat-container">{rows}</div>
        </>
      )}
    </div>
  );
};
