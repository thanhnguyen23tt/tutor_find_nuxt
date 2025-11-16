/**
 * SessionStorage Service - Centralized sessionStorage management
 * Provides consistent sessionStorage operations across the application
 */

/**
 * Get an item from sessionStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed value or null
 */
export const getItem = (key) => {
	if (!process.client) return null;
	
	try {
		const item = sessionStorage.getItem(key);
		if (!item) return null;
		
		// Try to parse as JSON, fallback to string
		try {
			return JSON.parse(item);
		} catch {
			return item;
		}
	} catch (error) {
		console.warn(`Failed to get item from sessionStorage: ${key}`, error);
		return null;
	}
};

/**
 * Set an item in sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be stringified if object)
 */
export const setItem = (key, value) => {
	if (!process.client) return;
	
	try {
		const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
		sessionStorage.setItem(key, stringValue);
	} catch (error) {
		console.warn(`Failed to set item in sessionStorage: ${key}`, error);
	}
};

/**
 * Remove an item from sessionStorage
 * @param {string} key - Storage key
 */
export const removeItem = (key) => {
	if (!process.client) return;
	
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.warn(`Failed to remove item from sessionStorage: ${key}`, error);
	}
};

/**
 * Clear all items from sessionStorage
 */
export const clear = () => {
	if (!process.client) return;
	
	try {
		sessionStorage.clear();
	} catch (error) {
		console.warn('Failed to clear sessionStorage', error);
	}
};

/**
 * Get booking data from sessionStorage
 * @returns {object|null} Booking data or null
 */
export const getBookingData = () => {
	return getItem('bookingData');
};

/**
 * Set booking data in sessionStorage
 * @param {object} data - Booking data to store
 */
export const setBookingData = (data) => {
	setItem('bookingData', data);
};

/**
 * Remove booking data from sessionStorage
 */
export const removeBookingData = () => {
	removeItem('bookingData');
};

/**
 * Get token from sessionStorage (legacy support)
 * @returns {string|null} Token value or null
 */
export const getToken = () => {
	return getItem('token');
};

/**
 * Set token in sessionStorage (legacy support)
 * @param {string} token - Token value
 */
export const setToken = (token) => {
	setItem('token', token);
};

/**
 * Remove token from sessionStorage (legacy support)
 */
export const removeToken = () => {
	removeItem('token');
};

