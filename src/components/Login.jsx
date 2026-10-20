import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../utils/api-base-url'

const AUTH_USER_KEY = 'authUser'

export default function Login() {
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		keepSignedIn: false,
	})

	const handleInputChange = (event) => {
		const { name, value, type, checked } = event.target
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		try {
			setIsSubmitting(true)

			const payload = {
				email: formData.email.trim(),
				password: formData.password,
			}

			const response = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
				withCredentials: true,
			})
			console.log(response);
			
			const loggedInUser = response?.data?.data?.user
			if (loggedInUser) {
				const serializedUser = JSON.stringify(loggedInUser)
				if (formData.keepSignedIn) {
					localStorage.setItem(AUTH_USER_KEY, serializedUser)
					sessionStorage.removeItem(AUTH_USER_KEY)
				} else {
					sessionStorage.setItem(AUTH_USER_KEY, serializedUser)
					localStorage.removeItem(AUTH_USER_KEY)
				}
			}

			toast.success(response?.data?.message || 'Login successful')
			navigate('/')
		} catch (error) {
			const backendMessage = error?.response?.data?.message
			if (backendMessage) {
				toast.error(backendMessage)
			} else if (error?.response?.status === 400) {
				toast.error('Invalid email or password')
			} else {
				toast.error('Login failed. Please try again')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
    <div className='min-h-screen lg:h-screen bg-orange-100 text-gray-800 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden'>
			<div className='absolute inset-0'>
				<div className='absolute -top-32 -left-24 h-72 w-72 rounded-full bg-red-300/40 blur-3xl float-slow'></div>
				<div className='absolute top-24 right-10 h-80 w-80 rounded-full bg-orange-300/35 blur-3xl float-slow float-delay'></div>
				<div className='absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-red-200/40 blur-3xl float-slow'></div>
			</div>

			<div className='relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16'>
				<div className='grid w-full items-center gap-12 lg:grid-cols-2'>
					<section className='space-y-8'>
						<div className='inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-red-900'>
							<span className='h-2 w-2 rounded-full bg-red-900'></span>
							Bike showroom management
						</div>
						<div className='space-y-4'>
							<h1 className='font-display text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl'>
								Command your showroom with speed, clarity, and control.
							</h1>
							<p className='max-w-xl text-base text-gray-700 sm:text-lg'>
								Log in to track inventory, service slots, and sales performance in a single cockpit built
								for modern bike dealers.
							</p>
						</div>

						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='rounded-2xl border border-red-100 bg-white p-4 shadow-md'>
								<p className='text-sm text-gray-600'>Live inventory</p>
								<p className='mt-2 text-2xl font-semibold text-gray-900'>2,184</p>
								<p className='text-xs text-red-900'>+14% this month</p>
							</div>
							<div className='rounded-2xl border border-red-100 bg-white p-4 shadow-md'>
								<p className='text-sm text-gray-600'>Service bays</p>
								<p className='mt-2 text-2xl font-semibold text-gray-900'>08</p>
								<p className='text-xs text-red-900'>3 open now</p>
							</div>
						</div>

						<div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
							<span className='rounded-full border border-red-100 bg-white px-3 py-1'>Dealer CRM</span>
							<span className='rounded-full border border-red-100 bg-white px-3 py-1'>Warranty</span>
							<span className='rounded-full border border-red-100 bg-white px-3 py-1'>Test ride</span>
							<span className='rounded-full border border-red-100 bg-white px-3 py-1'>Smart reports</span>
						</div>
					</section>

						<section className='rounded-3xl border border-red-200 bg-yellow-100  shadow-red-300 border-x-orange-700 p-8 shadow-xl sm:p-10'>
						<div className='space-y-3'>
							<h2 className='font-display text-3xl font-semibold text-gray-900'>Welcome back</h2>
							<p className='text-sm text-gray-600'>Sign in to manage your showroom floor.</p>
						</div>

						<form className='mt-8 space-y-5' onSubmit={handleSubmit}>
							<div className='space-y-2'>
								<label className='text-sm text-gray-700'>Work email</label>
								<input
									type='email'
									name='email'
									placeholder='manager@bikehouse.com'
									value={formData.email}
									onChange={handleInputChange}
									required
									className='w-full rounded-xl border border-red-100 bg-orange-5	0 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
								/>
							</div>
							<div className='space-y-2'>
								<label className='text-sm text-gray-700'>Password</label>
								<div className='relative'>
									<input
										type={showPassword ? 'text' : 'password'}
										name='password'
										placeholder='Enter your password'
										value={formData.password}
										onChange={handleInputChange}
										required
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

							<div className='flex items-center justify-between text-sm text-gray-600'>
								<label className='flex items-center gap-2'>
									<input
										type='checkbox'
										name='keepSignedIn'
										checked={formData.keepSignedIn}
										onChange={handleInputChange}
										className='h-4 w-4 rounded border-red-300 bg-white text-red-900 focus:ring-red-500'
									/>
									Keep me signed in
								</label>
								<button type='button' className='text-red-900 hover:text-red-700'>
									Forgot password?
								</button>
							</div>

							<button
								type='submit'
								disabled={isSubmitting}
								className='group relative w-full overflow-hidden rounded-xl bg-red-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-70'
							>
								<span className='relative z-10'>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
								<span className='absolute inset-0 -translate-x-full bg-gradient-to-r from-red-200/0 via-white/30 to-red-200/0 transition duration-500 group-hover:translate-x-full'></span>
							</button>

							<div className='flex flex-col gap-3 text-center text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between'>
								<span>Need access for a new branch?</span>
								<button type='button' className='text-red-900 hover:text-red-700'>
									Request an invite
								</button>
							</div>
							<div className='text-center text-xs text-gray-600'>
								<span>New to the platform? </span>
								<Link to='/register' className='text-red-900 hover:text-red-700'>
									Create an account
								</Link>
							</div>
						</form>
					</section>
				</div>
			</div>
		</div>
	)
}
