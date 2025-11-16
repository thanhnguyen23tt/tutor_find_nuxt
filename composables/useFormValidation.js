// Auto-imported: ref

/**
 * Composable for handling form validation errors
 * @returns {Object} Form validation utilities
 */
export function useFormValidation() {
    const formErrors = ref({});

    /**
     * Handle API validation errors (422 status)
     * @param {Error} error - The error object from API response
     * @param {string} defaultMessage - Default error message if not validation error
     * @returns {boolean} True if validation errors were handled, false otherwise
     */
    const handleValidationError = (error, defaultMessage = 'Có lỗi xảy ra!') => {
        if (error?.response?.status === 422 && error?.response?.data?.errors) {
            const errors = error.response.data.errors;

            // Extract first error message for each field
            formErrors.value = Object.keys(errors).reduce((acc, key) => {
                acc[key] = errors[key][0];
                return acc;
            }, {});

            // Show general notification for validation errors
            const { error: notifyError } = useNotification();
            notifyError('Vui lòng kiểm tra lại thông tin!');
            return true;
        }

        // Show error message for non-validation errors
        const errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
        const { error: notifyError } = useNotification();
        notifyError(errorMessage);
        return false;
    };

    /**
     * Clear error for a specific field
     * @param {string} fieldName - The field name to clear error for
     */
    const clearError = (fieldName) => {
        if (formErrors.value[fieldName]) {
            delete formErrors.value[fieldName];
        }
    };

    /**
     * Clear all errors
     */
    const clearAllErrors = () => {
        formErrors.value = {};
    };

    /**
     * Set a specific field error manually
     * @param {string} fieldName - The field name
     * @param {string} errorMessage - The error message
     */
    const setError = (fieldName, errorMessage) => {
        formErrors.value[fieldName] = errorMessage;
    };

    /**
     * Check if a field has error
     * @param {string} fieldName - The field name
     * @returns {boolean} True if field has error
     */
    const hasError = (fieldName) => {
        return !!formErrors.value[fieldName];
    };

    /**
     * Get error message for a field
     * @param {string} fieldName - The field name
     * @returns {string} Error message or empty string
     */
    const getError = (fieldName) => {
        return formErrors.value[fieldName] || '';
    };

    return {
        formErrors,
        handleValidationError,
        clearError,
        clearAllErrors,
        setError,
        hasError,
        getError
    };
}

