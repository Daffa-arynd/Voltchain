// Data model untuk aplikasi
const userData = {
    id: "user123",
    address: "0x7a23b9c74d89e6f1a32d46b1f08239c7f1bcdef3",
    name: "Enplum",
    balance: 150,
    privateKey: "0x3d2f...", // Simulated private key (tidak ditampilkan penuh)
    transactions: [
        {
            id: "tx001",
            date: "2024-04-18",
            station: "Central Plaza",
            amount: 25,
            kwh: 15,
            txHash: "0x7a23b9c74d89e6f1a32...",
            blockHeight: 2145,
            confirmations: 32,
            gasUsed: 21000
        },
        {
            id: "tx002",
            date: "2024-04-16",
            station: "GreenCharge East",
            amount: 20,
            kwh: 10,
            txHash: "0x3f81a5d62e7c4b01928...",
            blockHeight: 2138,
            confirmations: 40,
            gasUsed: 21000
        }
    ]
};

const stationData = {
    "Central Plaza": { 
        conversionRate: 0.6, 
        location: "Downtown",
        coordinates: {
            lat: -6.2088,
            lng: 106.8456
        },
        contractAddress: "0x9876a5d62e7c4b01928a47b7c88d5a25d9d89e6f"
    },
    "GreenCharge East": { 
        conversionRate: 0.5, 
        location: "East District",
        coordinates: {
            lat: -6.2233,
            lng: 106.8578
        },
        contractAddress: "0x8765a5d62e7c4b01928a47b7c88d5a25d9d89e6f"
    },
    "Electro Avenue": { 
        conversionRate: 0.55, 
        location: "North Side",
        coordinates: {
            lat: -6.1900,
            lng: 106.8400
        },
        contractAddress: "0x7654a5d62e7c4b01928a47b7c88d5a25d9d89e6f"
    },
    "Power Hub": { 
        conversionRate: 0.65, 
        location: "West End",
        coordinates: {
            lat: -6.2100,
            lng: 106.8300
        },
        contractAddress: "0x6543a5d62e7c4b01928a47b7c88d5a25d9d89e6f"
    }
};

const blockchainData = {
    currentBlockHeight: 2177,
    networkHashrate: "125 TH/s",
    difficulty: 2,
    lastBlockTime: "30 seconds ago",
    pendingTransactions: 7,
    gasPrice: "5 gwei",
    networkName: "VoltChain Testnet",
    consensusAlgorithm: "Proof of Work",
    activeMiners: 15,
    totalNodes: 42
};

// Definisi smart contract interface
const smartContractABI = {
    "contractName": "ChargingPayment",
    "contractAddress": "0x3f81a5d62e7c4b01928a47b7c88d5a25d9d89e6f",
    "methods": [
        {
            "name": "makePayment",
            "inputs": [
                {"name": "stationId", "type": "address"},
                {"name": "amount", "type": "uint256"},
                {"name": "kwh", "type": "uint256"}
            ],
            "outputs": [
                {"name": "success", "type": "bool"},
                {"name": "txId", "type": "bytes32"}
            ]
        },
        {
            "name": "getBalance",
            "inputs": [
                {"name": "userAddress", "type": "address"}
            ],
            "outputs": [
                {"name": "balance", "type": "uint256"}
            ]
        }
    ],
    "events": [
        {
            "name": "PaymentReceived",
            "inputs": [
                {"name": "user", "type": "address", "indexed": true},
                {"name": "amount", "type": "uint256"},
                {"name": "station", "type": "address"},
                {"name": "kwh", "type": "uint256"}
            ]
        }
    ],
    "bytecode": "0x608060405234801561001057600080fd5b50610...",
    "deployedBytecode": "0x608060405234801561001057600080..."
};

// Information about the token
const tokenInfo = {
    name: "VoltChain Token",
    symbol: "TKN",
    decimals: 0,
    totalSupply: 1000000,
    contractAddress: "0x3f81a5d62e7c4b01928a47b7c88d5a25d9d89e6f",
    standard: "ERC-20"
};

// App settings
const appSettings = {
    minTransactionAmount: 1,
    maxTransactionAmount: 500,
    transactionFee: 0,
    processingTime: 1500, // ms
    refreshRate: 60000, // 1 minute
    maxBlocksToDisplay: 10,
    defaultGasLimit: 21000
};