import { useSessionService } from './useSessionService'

export const useBookingSession = () => {
	const storage = useSessionService()
	const KEY = 'bookingData'

	const getBookingData = () => storage.getItem(KEY)
	const setBookingData = (data) => storage.setItem(KEY, data)
	const removeBookingData = () => storage.removeItem(KEY)

	return {
		getBookingData,
		setBookingData,
		removeBookingData,
	}
}
