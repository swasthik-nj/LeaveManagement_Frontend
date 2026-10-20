import React, { useEffect, useState } from 'react'
import Nav from './components/Nav'
import { Link } from 'react-router-dom'
import { popularBikes } from './data/data.js'
import Footer from './components/Footer.jsx'

const AUTH_USER_KEY = 'authUser'

export default function Home() {
  const [registeredUser, setRegisteredUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY)
    if (!storedUser) {
      return
    }

    try {
      setRegisteredUser(JSON.parse(storedUser))
    } catch {
      setRegisteredUser(null)
    }
  }, [])

 

  return (
    <div className='bg-orange-100 min-h-screen text-gray-800'>
      <Nav />

      <section
        id='home'
        className='pt-28 md:pt-32 px-4 sm:px-8 lg:px-16 min-h-[90vh] flex items-center'
      >
        <div className='max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'>
          <div>
            <p className='text-red-900 font-semibold tracking-wide mb-3'>Premium Bike Showroom</p>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5'>
              Find Your Next Ride With Confidence
            </h1>
            <p className='text-base sm:text-lg text-gray-700 mb-8'>
              Discover top brands, compare popular models, and book a test ride from one trusted
              showroom.
            </p>
            <div className='flex flex-wrap gap-4'>
              <a
                href='#collection'
                className='px-6 py-3 bg-red-950 text-white rounded-full text-base font-semibold hover:bg-red-800 transition duration-300'
              >
                Explore Bikes
              </a>
              <a
                href='#about'
                className='px-6 py-3 border-2 border-red-950 text-red-950 rounded-full text-base font-semibold hover:bg-red-950 hover:text-white transition duration-300'
              >
                About Showroom
              </a>
            </div>

            {/* <div className='mt-8 rounded-2xl border border-red-200 bg-white p-5 shadow-md'>
              <p className='text-sm font-semibold text-red-900 mb-2'>Registered User</p>
              {registeredUser ? (
                <div className='space-y-1 text-sm text-gray-700'>
                  <p>
                    <span className='font-semibold'>Name:</span> {registeredUser.username || 'N/A'}
                  </p>
                  <p>
                    <span className='font-semibold'>Email:</span> {registeredUser.email || 'N/A'}
                  </p>
                  <p>
                    <span className='font-semibold'>Phone:</span> {registeredUser.phone || 'N/A'}
                  </p>
                </div>
              ) : (
                <p className='text-sm text-gray-600'>No registered user data found. Please register or login.</p>
              )}
            </div> */}
          </div>

          <div className='rounded-3xl overflow-hidden shadow-xl'>
            <img
              src='https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=80'
              alt='Sports bike in showroom'
              className='w-full h-[300px] sm:h-[420px] object-cover'
            />
          </div>
        </div>
      </section>

      <section id='collection' className='px-4 sm:px-8 lg:px-16 py-16 bg-orange-200/20'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl sm:text-4xl font-bold mb-3'>Popular Bikes</h2>
          <p className='text-gray-700 mb-10'>Top picks our customers are booking this season.</p>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7'>
            {popularBikes.slice(0,6).map((bike) => (
              <article
                key={bike.name}
                className='bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300'
              >
                <img src={bike.image} alt={bike.name} className='w-full h-52 object-cover' />
                <div className='p-5'>
                  <h3 className='text-xl font-bold mb-2'>{bike.name}</h3>
                  <p className='text-gray-600 text-sm mb-3'>{bike.brand} | {bike.engine_cc}cc</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-red-900 font-bold text-lg'>{bike.price}</span>
                    <Link
                      to={`/bikes/${bike.id}`}
                      className='px-4 py-2 bg-red-950 text-white rounded-lg hover:bg-red-800 transition duration-300'
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id='about' className='px-4 sm:px-8 lg:px-16 py-16'>
        <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'>
          <div className='rounded-3xl overflow-hidden shadow-xl'>
            <img
              src='https://www.otocapital.in/_next/image?url=https%3A%2F%2Fassets.otocapital.in%2Fproduction%2Fnew-jawa-perak-unveiled-with-stealth-edition.png&w=1024&q=75'
              alt='Bike showroom interior'
              className='w-full h-[280px] sm:h-[360px] object-cover'
            />
          </div>

          <div>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4'>About Our Showroom</h2>
            <p className='text-gray-700 mb-4'>
              We are a trusted multi-brand bike showroom helping riders choose the right bike for
              city travel, touring, and performance riding.
            </p>
            <p className='text-gray-700 mb-6'>
              From expert guidance to transparent pricing and easy finance support, our team makes
              your bike-buying journey smooth from first visit to delivery.
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white p-4 rounded-xl shadow text-center'>
                <p className='text-2xl font-bold text-red-900'>10+</p>
                <p className='text-sm text-gray-600'>Top Brands</p>
              </div>
              <div className='bg-white p-4 rounded-xl shadow text-center'>
                <p className='text-2xl font-bold text-red-900'>5000+</p>
                <p className='text-sm text-gray-600'>Happy Riders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id='contact' className='bg-red-950 text-white px-4 sm:px-8 lg:px-16 py-10'>
          <Footer/>
      </footer>
    </div>
  )
}
