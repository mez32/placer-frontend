import { useState, useCallback, useRef, useEffect } from 'react'

export const useHttpClient = () => {
	const [isLoading, setIsloading] = useState(false)
	const [error, setError] = useState()

	const activeHttpRequests = useRef([])

	const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
		setIsloading(true)
		const httpAbortCrtl = new AbortController()
		activeHttpRequests.current.push(httpAbortCrtl)
		try {
			const response = await fetch(url, {
				method,
				body,
				headers,
				signal: httpAbortCrtl.signal,
			})

			const responseData = await response.json()

			activeHttpRequests.current = activeHttpRequests.current.filter(
				(reqCrtl) => reqCrtl !== httpAbortCrtl
			)

			if (!response.ok) {
				throw new Error(responseData.msg)
			}
			setIsloading(false)
			return responseData
		} catch (err) {
			setError(err.message)
			setIsloading(false)
			throw err
		}
	}, [])

	const clearError = () => {
		setError(null)
	}

	useEffect(() => {
		return () => {
			activeHttpRequests.current.forEach((abortCrtl) => abortCrtl.abort())
		}
	}, [])

	return { isLoading, error, sendRequest, clearError }
}
