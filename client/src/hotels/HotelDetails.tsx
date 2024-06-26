import React, { useState, useEffect } from 'react'
import { useStore } from 'react-redux'
import { read, diffDays, isAlreadyBooked } from '../helpers/hotel'
import { getSessionId } from '../helpers/stripe'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import HotelImagesCarousal from '../components/Hotel/ImagesCarousal'

const HotelDetails = ({ match, history }) => {
  const [hotel, setHotel] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [alreadyBooked, setAlreadyBooked] = useState(false)

  const { auth } = useSelector(state => ({ ...state }))

  useEffect(() => {
    loadSellerHotel()
  }, [])

  useEffect(() => {
    if (auth && auth.token) {
      isAlreadyBooked(auth.token, match.params.hotelId).then(res => {
        // console.log(res);
        if (res.data.ok) setAlreadyBooked(true)
      })
    }
  }, [])

  const loadSellerHotel = async () => {
    let res = await read(match.params.hotelId)
    // console.log(res);
    setHotel(res.data)
  }

  const handleClick = async e => {
    e.preventDefault()

    if (!auth || !auth.token) {
      history.push('/login')
      return
    }

    setLoading(true)
    if (!auth) history.push('/login')
    let res = await getSessionId(auth.token, match.params.hotelId)
    const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPE_KEY)
    if (stripe)
      stripe
        .redirectToCheckout({
          sessionId: res.data.sessionId
        })
        .then(result => console.log(result))
  }

  return (
    <>
      <div className="container-fluid bg-secondary p-5 text-center">
        <h1>{hotel.title}</h1>
      </div>
      <div className="container-fluid">
        <div className="row">
          <HotelImagesCarousal images={hotel.images} />

          <div className="col-md-6">
            <br />
            <b>{hotel.content}</b>
            <p className="alert alert-info mt-3">${hotel.price}</p>
            <p className="card-text">
              <span className="float-right text-primary">
                for {diffDays(hotel.from, hotel.to)}{' '}
                {diffDays(hotel.from, hotel.to) <= 1 ? ' day' : ' days'}
              </span>
            </p>
            <p>
              From <br />{' '}
              {moment(new Date(hotel.from)).format('MMMM Do YYYY, h:mm:ss a')}
            </p>
            <p>
              To <br />{' '}
              {moment(new Date(hotel.to)).format('MMMM Do YYYY, h:mm:ss a')}
            </p>
            <i>Posted by {hotel.postedBy && hotel.postedBy.name}</i>
            <br />
            <button
              onClick={handleClick}
              className="btn btn-block btn-lg btn-primary mt-3"
              disabled={loading || alreadyBooked}
            >
              {loading
                ? 'Loading...'
                : alreadyBooked
                ? 'Already Booked'
                : auth && auth.token
                ? 'Book Now'
                : 'Login to Book'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HotelDetails
