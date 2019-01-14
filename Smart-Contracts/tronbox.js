module.exports = {
	networks: {
		development: {
			privateKey: '',
			consume_user_resource_percent: 100,
			fee_limit: 1000000000,
			fullNode: "http://127.0.0.1:8090",
			solidityNode: "http://127.0.0.1:8091",
			eventServer: "http://127.0.0.1:8092",
			network_id: "*"
		},
		testnet: {
			//from: 'TXCaZi9wh8wLNnrTvQnBiMUqKqbBnXdGQE',
			privateKey: '',
			consume_user_resource_percent: 100,
			fee_limit: 1000000000,
			fullNode: "https://api.shasta.trongrid.io",
			solidityNode: "https://api.shasta.trongrid.io",
			eventServer:  "https://api.shasta.trongrid.io",
			network_id: "*" // Match any network id
		},
		mainnet: {
			//from: 'some other address',
			privateKey: '',
			consume_user_resource_percent: 100,
			fee_limit: 1000000000,
			fullNode: "https://api.trongrid.io",
			solidityNode: "https://api.trongrid.io",
			eventServer:  "https://api.trongrid.io",
			network_id: "*" // Match any network id
		}
	}
};
