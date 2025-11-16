/**
 * SessionStorage Service Composable
 * Provides generic sessionStorage management functionality for Nuxt 3 components
 */

const isClient = () => process.client

const getItem = (key) => {
	if (!isClient()) return null

	try {
		const item = sessionStorage.getItem(key)
		if (!item) return null

		try {
			return JSON.parse(item)
		} catch {
			return item
		}
	} catch (error) {
		console.warn(`Failed to get item from sessionStorage: ${key}`, error)
		return null
	}
}

const setItem = (key, value) => {
	if (!isClient()) return

	try {
		const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
		sessionStorage.setItem(key, stringValue)
	} catch (error) {
		console.warn(`Failed to set item in sessionStorage: ${key}`, error)
	}
}

const removeItem = (key) => {
	if (!isClient()) return

	try {
		sessionStorage.removeItem(key)
	} catch (error) {
		console.warn(`Failed to remove item from sessionStorage: ${key}`, error)
	}
}

const clear = () => {
	if (!isClient()) return

	try {
		sessionStorage.clear()
	} catch (error) {
		console.warn('Failed to clear sessionStorage', error)
	}
}

export const useSessionService = () => {
	return {
		getItem,
		setItem,
		removeItem,
		clear,
	}
}
