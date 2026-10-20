import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../utils/api-base-url'

const AUTH_USER_KEY = 'authUser'

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password and confirm password must match')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      }

      const response = await axios.post(`${API_BASE_URL}/auth/register`, payload, {
        withCredentials: true,
      })

      const registeredUser = response?.data?.data?.user
      if (registeredUser) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(registeredUser))
        sessionStorage.removeItem(AUTH_USER_KEY)
      }
      console.log(response);

      toast.success(response?.data?.message || 'Registration successful')
      setFormData({
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      const backendMessage = error?.response?.data?.message
      if (backendMessage) {
        toast.error(backendMessage)
      } else if (error?.response?.status === 409) {
        toast.error('User with this email or username already exists')
      } else {
        toast.error('Registration failed. Please try again')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-orange-100 text-gray-800 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden'>
      <div className='absolute inset-0'>
        <div className='absolute -top-30 left-10 h-72 w-72 rounded-full bg-red-300/40 blur-3xl float-slow'></div>
        <div className='absolute top-20 right-0 h-80 w-80 rounded-full bg-orange-300/35 blur-3xl float-slow float-delay'></div>
        <div className='absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-red-200/40 blur-3xl float-slow'></div>
      </div>

      <div className='relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:py-16'>
        <div className='grid w-full items-center gap-8 lg:gap-12 lg:grid-cols-2'>
          <section className='space-y-8 w-full max-w-xl mx-auto lg:max-w-none'>
            <div className='inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-red-900'>
              <span className='h-2 w-2 rounded-full bg-red-900'></span>
              Buyer registration
            </div>
            <div className='space-y-4'>
              <h1 className='font-display text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl'>
                Register to find your perfect new bike.
              </h1>
              <p className='max-w-xl text-base text-gray-700 sm:text-lg'>
                Create your account, share your requirements, and get matched with bikes that fit your budget and riding needs.
              </p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-red-100 bg-white p-4 shadow-md'>
                <p className='text-sm text-gray-600'>Saved models</p>
                <p className='mt-2 text-2xl font-semibold text-gray-900'>Unlimited</p>
                <p className='text-xs text-red-900'>Compare anytime</p>
              </div>
              <div className='rounded-2xl border border-red-100 bg-white p-4 shadow-md'>
                <p className='text-sm text-gray-600'>Dealer connect</p>
                <p className='mt-2 text-2xl font-semibold text-gray-900'>24x7</p>
                <p className='text-xs text-red-900'>Assisted buying</p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
              <span className='rounded-full border border-red-100 bg-white px-3 py-1'>Bike matching</span>
              <span className='rounded-full border border-red-100 bg-white px-3 py-1'>Test ride request</span>
              <span className='rounded-full border border-red-100 bg-white px-3 py-1'>Budget planner</span>
              <span className='rounded-full border border-red-100 bg-white px-3 py-1'>EMI guidance</span>
            </div>
          </section>

          <section className='w-full max-w-xl mx-auto rounded-3xl border border-red-200 bg-yellow-100 shadow-red-300 border-x-orange-700 p-5 shadow-xl sm:p-8 lg:max-w-none lg:p-10'>
            <div className='space-y-3'>
              <h2 className='font-display text-2xl font-semibold text-gray-900 sm:text-3xl'>Create account</h2>
              <p className='text-sm text-gray-600'>Create a buyer profile and share your bike requirements.</p>
            </div>

            <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm text-gray-700'>Full name</label>
                  <input
                    type='text'
                    name='username'
                    placeholder='Aarav Sharma'
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className='w-full rounded-xl border border-red-100 bg-orange-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm text-gray-700'>Phone</label>
                  <input
                    type='tel'
                    name='phone'
                    placeholder='+91 9XXXX XXXXX'
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='w-full rounded-xl border border-red-100 bg-orange-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-700'>Email</label>
                <input
                  type='email'
                  name='email'
                  placeholder='you@example.com'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full rounded-xl border border-red-100 bg-orange-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
                />
              </div>


              <div className='space-y-2'>
                <label className='text-sm text-gray-700'>Password</label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Create a strong password'
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className='w-full rounded-xl border border-red-100 bg-orange-50 px-4 py-3 pr-20 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 transition hover:text-red-900'
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm text-gray-700'>Confirm password</label>
                <div className='relative'>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name='confirmPassword'
                    placeholder='Re-enter password'
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className='w-full rounded-xl border border-red-100 bg-orange-50 px-4 py-3 pr-20 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 transition hover:text-red-900'
                  >
                    {showConfirm ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='group relative w-full overflow-hidden rounded-xl bg-red-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-70'
              >
                <span className='relative z-10'>{isSubmitting ? 'Registering...' : 'Register now'}</span>
                <span className='absolute inset-0 -translate-x-full bg-linear-to-r from-red-200/0 via-white/30 to-red-200/0 transition duration-500 group-hover:translate-x-full'></span>
              </button>

              <div className='flex flex-col gap-3 text-center text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between'>
                <span>Already have an account?</span>
                <Link to='/login' className='text-red-900 hover:text-red-700'>
                  Sign in instead
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
