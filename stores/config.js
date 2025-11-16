import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
	state: () => ({
		configuration: {},
	}),

	getters: {
		getConfiguration: (state) => state.configuration,
	},

	actions: {
		setConfiguration(payload) {
			this.configuration = payload;
		},
		async fetchConfiguration() {
			const { api } = useApi();
			try {
				const response = await api.apiGet('configurations');
				this.setConfiguration(response);
			} catch (error) {
				console.error('Error fetching configuration:', error);
			}
		},
	},
});

