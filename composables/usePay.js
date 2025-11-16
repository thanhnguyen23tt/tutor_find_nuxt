export const usePay = () => {
	const {
		api,
	} = useApi();

	const createVnpayBooking = async (payload) => {
        const response = await api.apiPost('bookings/vnpay', payload);
        return response;
    }

    const createZalopayBooking = async (payload) => {
        const response = await api.apiPost('bookings/zalopay', payload);
        return response;
    }

    const createPayment = async (payload) => {
        const response = await api.apiPost('vnpay/create-payment', payload);
        return response;
    }

    const createZalopayPayment = async (payload) => {
        const response = await api.apiPost('zalopay/create-payment', payload);
        return response;
    }

    const createMomoPayment = async (payload) => {
        const response = await api.apiPost('momo/create-payment', payload);
        return response;
    }

    const returnPayment = async (payload) => {
        const response = await api.apiPost('vnpay/return-payment', payload);
        return response;
    }

    const ipnPayment = async (payload) => {
        const response = await api.apiPost('vnpay/ipn-payment', payload);
        return response;
    }


	return {
		createVnpayBooking,
		createZalopayBooking,
		createPayment,
		createZalopayPayment,
		createMomoPayment,
		returnPayment,
		ipnPayment,
	};
};

