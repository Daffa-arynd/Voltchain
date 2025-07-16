// Blockchain dan Smart Contract Simulator

//METODE POW
class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
        this.merkleRoot = this.calculateMerkleRoot();
    }

    calculateHash() {
        return window.crypto.sha256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.transactions) + 
            this.nonce
        );
    }

    // MERKLE TREE ROOT
    calculateMerkleRoot() {
        // Untuk simulasi sederhana - Implementasi nyata akan menghitung Merkle Tree
        if (this.transactions.length === 0) return '0'.repeat(64);
        
        // Hash semua transaksi, kemudian hash lagi hasilnya
        const txHashes = this.transactions.map(tx => window.crypto.sha256(JSON.stringify(tx)));
        return window.crypto.sha256(txHashes.join(''));
    }
// METODE POW
    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        return {
            hash: this.hash,
            nonce: this.nonce
        };
    }
}

// METODE HASH TRANSAKSI
class Transaction {
    constructor(fromAddress, toAddress, amount, data = {}) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = new Date().toISOString();
        this.data = data;
        this.signature = '';
        this.txId = this.calculateTxId();
    }
    
    calculateTxId() {
        return window.crypto.sha256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.timestamp + 
            JSON.stringify(this.data)
        );
    }
    
    //METODE HASH TRANSAKSI
    // Simulasi penandatanganan transaksi
    signTransaction(privateKey) {
        // Dalam aplikasi sebenarnya, ini akan menggunakan kriptografi asimetris
        this.signature = window.crypto.sha256(this.txId + privateKey);
        return this.signature;
    }
    
    // Verifikasi transaksi
    isValid() {
        // Dalam aplikasi sebenarnya, ini akan memverifikasi tanda tangan
        if (!this.signature || this.signature.length === 0) {
            return false;
        }
        
        // Simulasi verifikasi
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Tingkat kesulitan untuk PoW
        this.pendingTransactions = [];
        this.miningReward = 5;
        this.blockTime = 30; // Target waktu blok dalam detik
    }

    createGenesisBlock() {
        const genesisBlock = new Block(0, "01/01/2024", [], "0");
        genesisBlock.hash = window.crypto.sha256("Genesis Block");
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    async minePendingTransactions(miningRewardAddress) {
        // Buat blok baru dengan semua transaksi tertunda
        const block = new Block(
            this.chain.length,
            new Date().toISOString(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        // Proses mining dengan visualisasi
        return {
            block: block,
            mine: async () => {
                // Gunakan enhanced miner dari crypto.js
                const miner = window.crypto.mineBlock(
                    {
                        blockHeader: {
                            index: block.index,
                            previousHash: block.previousHash,
                            timestamp: block.timestamp,
                            merkleRoot: block.merkleRoot
                        },
                        nonce: 0
                    }, 
                    this.difficulty
                );
                
                const miningResult = await miner.start();
                
                // Update block dengan hasil mining
                block.nonce = miningResult.nonce;
                block.hash = miningResult.hash;
                
                // Tambahkan blok ke blockchain
                this.chain.push(block);
                
                // Reset transaksi tertunda dan tambahkan transaksi reward mining
                this.pendingTransactions = [{
                    fromAddress: "SYSTEM",
                    toAddress: miningRewardAddress,
                    amount: this.miningReward,
                    type: "REWARD",
                    timestamp: new Date().toISOString()
                }];
                
                return {
                    ...miningResult,
                    blockHeight: block.index
                };
            },
            mineVisual: (callback) => {
                // Gunakan enhanced miner dengan visual dari crypto.js
                const miner = window.crypto.mineBlock(
                    {
                        blockHeader: {
                            index: block.index,
                            previousHash: block.previousHash,
                            timestamp: block.timestamp,
                            merkleRoot: block.merkleRoot
                        },
                        nonce: 0
                    }, 
                    this.difficulty
                );
                
                miner.startVisual((result) => {
                    // Update block dengan hasil mining
                    block.nonce = result.nonce;
                    block.hash = result.hash;
                    
                    // Tambahkan blok ke blockchain
                    this.chain.push(block);
                    
                    // Reset transaksi tertunda dan tambahkan transaksi reward mining
                    this.pendingTransactions = [{
                        fromAddress: "SYSTEM",
                        toAddress: miningRewardAddress,
                        amount: this.miningReward,
                        type: "REWARD",
                        timestamp: new Date().toISOString()
                    }];
                    
                    callback({
                        ...result,
                        blockHeight: block.index
                    });
                });
            }
        };
    }

    createTransaction(transaction) {
        // Verifikasi transaksi
        if (!transaction.isValid()) {
            throw new Error('Transaction signature invalid');
        }
        
        // Periksa saldo pengirim (kecuali transaksi sistem)
        if (transaction.fromAddress !== "SYSTEM") {
            const senderBalance = this.getBalanceOfAddress(transaction.fromAddress);
            if (senderBalance < transaction.amount) {
                throw new Error('Not enough balance');
            }
        }
        
        // Tambahkan transaksi ke pending pool
        this.pendingTransactions.push(transaction);
        
        return {
            txId: transaction.txId,
            timestamp: transaction.timestamp
        };
    }

    addTransaction(fromAddress, toAddress, amount, data = {}, privateKey = null) {
        const tx = new Transaction(fromAddress, toAddress, amount, data);
        
        // Tanda tangani transaksi jika private key diberikan
        if (privateKey) {
            tx.signTransaction(privateKey);
        } else if (fromAddress !== "SYSTEM") {
            // Untuk simulasi, kita tanda tangani transaksi dengan nilai dummy
            tx.signTransaction("dummy_key_for_simulation");
        }
        
        return this.createTransaction(tx);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        // Periksa semua blok untuk transaksi yang melibatkan address ini
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= parseFloat(trans.amount);
                }
                if (trans.toAddress === address) {
                    balance += parseFloat(trans.amount);
                }
            }
        }

        // Periksa juga transaksi tertunda
        for (const trans of this.pendingTransactions) {
            if (trans.fromAddress === address) {
                balance -= parseFloat(trans.amount);
            }
            if (trans.toAddress === address) {
                balance += parseFloat(trans.amount);
            }
        }

        return balance;
    }

    getTransactionsOfAddress(address) {
        const txs = [];
        
        // Cari semua transaksi di blockchain
        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];
            
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                    txs.push({
                        ...tx,
                        blockHeight: block.index,
                        confirmations: this.chain.length - i
                    });
                }
            }
        }
        
        // Tambahkan transaksi tertunda
        for (const tx of this.pendingTransactions) {
            if (tx.fromAddress === address || tx.toAddress === address) {
                txs.push({
                    ...tx,
                    confirmations: 0,
                    pending: true
                });
            }
        }
        
        return txs;
    }

    isChainValid() {
        // Periksa kevalidan blockchain
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Periksa jika hash valid
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Periksa jika previousHash benar
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
            
            // Periksa jika semua transaksi valid
            for (const tx of currentBlock.transactions) {
                if (tx instanceof Transaction && !tx.isValid()) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Adjust difficulty berdasarkan waktu blok
    adjustDifficulty() {
        const latestBlock = this.getLatestBlock();
        const previousBlock = this.chain[this.chain.length - 2];
        
        if (!previousBlock) return this.difficulty;
        
        const timeExpected = this.blockTime;
        const timeTaken = (new Date(latestBlock.timestamp).getTime() - new Date(previousBlock.timestamp).getTime()) / 1000;
        
        if (timeTaken < timeExpected / 2) {
            return this.difficulty + 1;
        } else if (timeTaken > timeExpected * 2) {
            return Math.max(1, this.difficulty - 1);
        } else {
            return this.difficulty;
        }
    }
}

// METODE SMART CONTRACT
class SmartContract {
    constructor(address, abi, owner) {
        this.address = address;
        this.abi = abi;
        this.owner = owner;
        this.state = {};
        this.events = {};
    }

    // Simulasi eksekusi smart contract
    execute(method, params, sender) {
        // Cari method dalam ABI
        const abiMethod = this.abi.methods.find(m => m.name === method);
        
        if (!abiMethod) {
            throw new Error(`Method ${method} not found in contract ABI`);
        }
        
        // Cek jika semua parameter yang diperlukan disediakan
        for (const input of abiMethod.inputs) {
            if (!(input.name in params)) {
                throw new Error(`Missing parameter: ${input.name}`);
            }
        }
        
        // Simulasi eksekusi method
        if (method === 'makePayment') {
            return this.chargingPayment(
                sender, 
                params.amount, 
                params.stationId, 
                params.kwh
            );
        } else if (method === 'getBalance') {
            return this.getBalance(params.userAddress);
        }
        
        throw new Error(`Method execution not implemented: ${method}`);
    }

    // METODE SMART CONTRACT
    // Fungsi Smart Contract EV Charging
    chargingPayment(from, amount, station, kwh) {
        // Verifikasi transaksi
        if (amount <= 0) return { success: false, message: "Invalid amount" };
        
        // Periksa saldo
        if (voltChain.getBalanceOfAddress(from) < amount) {
            return { success: false, message: "Insufficient balance" };
        }
        
        // Eksekusi transaksi dan daftar pembayaran
        const tx = new Transaction(
            from,
            this.address,
            amount,
            {
                station: station,
                kwh: kwh,
                type: "CHARGE"
            }
        );
        
        // Tanda tangani transaksi (simulasi)
        tx.signTransaction('dummy_key_for_simulation');
        
        // METODE SMART CONTRACT
        // Daftarkan di blockchain
        try {
            const txResult = voltChain.createTransaction(tx);
            
            // Update state contract
            if (!this.state[from]) {
                this.state[from] = [];
            }
            
            this.state[from].push({
                amount: amount,
                station: station,
                kwh: kwh,
                timestamp: tx.timestamp,
                txId: tx.txId
            });
            
            // Emit event (simulasi)
            this.emitEvent('PaymentReceived', {
                user: from,
                amount: amount,
                station: station,
                kwh: kwh,
                timestamp: tx.timestamp,
                txId: tx.txId
            });
            
            return { 
                success: true, 
                message: "Transaction successful", 
                txId: tx.txId, 
                timestamp: tx.timestamp 
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    getBalance(address) {
        return voltChain.getBalanceOfAddress(address);
    }

    getUserTransactions(address) {
        return this.state[address] || [];
    }
    
    // Simulasi event dalam kontrak
    emitEvent(eventName, data) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        
        this.events[eventName].push({
            data: data,
            blockNumber: voltChain.getLatestBlock().index,
            timestamp: new Date().toISOString()
        });
        
        console.log(`Event emitted: ${eventName}`, data);
    }
}

// Definisikan ABI untuk smart contract terlebih dahulu
const chargingContractABI = {
    contractName: "ChargingPayment",
    contractAddress: "0x3f81a5d62e7c4b01928a47b7c88d5a25d9d89e6f",
    methods: [
        {
            name: "makePayment",
            inputs: [
                {name: "stationId", type: "address"},
                {name: "amount", type: "uint256"},
                {name: "kwh", type: "uint256"}
            ],
            outputs: [
                {name: "success", type: "bool"},
                {name: "txId", type: "bytes32"}
            ]
        },
        {
            name: "getBalance",
            inputs: [
                {name: "userAddress", type: "address"}
            ],
            outputs: [
                {name: "balance", type: "uint256"}
            ]
        }
    ],
    events: [
        {
            name: "PaymentReceived",
            inputs: [
                {name: "user", type: "address", indexed: true},
                {name: "amount", type: "uint256"},
                {name: "station", type: "address"},
                {name: "kwh", type: "uint256"},
                {name: "timestamp", type: "uint256"},
                {name: "txId", type: "bytes32", indexed: true}
            ]
        }
    ]
};

// Inisialisasi blockchain dan smart contract
const voltChain = new Blockchain();

// Inisialisasi Smart Contract setelah blockchain
const chargingContract = new SmartContract(
    "0x3f81a5d62e7c4b01928a47b7c88d5a25d9d89e6f",
    chargingContractABI,
    "0x7a23b9c74d89e6f1a32d46b1f08239c7f1b"
);

// Simulasi transaksi awal untuk mengisi blocks
(function initializeBlockchain() {
    // Tambahkan beberapa blok awal
    for (let i = 0; i < 5; i++) {
        const dummyTx = new Transaction(
            "SYSTEM",
            "0x7a23b9c74d89e6f1a32d46b1f08239c7f1bcdef3",
            10,
            { type: "INITIAL_DISTRIBUTION" }
        );
        
        voltChain.pendingTransactions.push(dummyTx);
        
        const block = new Block(
            voltChain.chain.length,
            new Date(Date.now() - (5 - i) * 86400000).toISOString(),
            voltChain.pendingTransactions,
            voltChain.getLatestBlock().hash
        );
        
        // Lakukan mining manual
        block.nonce = Math.floor(Math.random() * 10000);
        block.hash = '0'.repeat(voltChain.difficulty) + block.calculateHash().substring(voltChain.difficulty);
        
        voltChain.chain.push(block);
        voltChain.pendingTransactions = [];
    }
})();

// Add TokenSale contract definition to blockchain.js
// This code would be added to the existing smart contract definitions

// Token Sale Contract for purchasing tokens
class TokenSaleContract extends SmartContract {
    constructor(address, abi, owner) {
        super(address, abi, owner);
        this.tokenPrice = {
            10: 5,    // 10 tokens for $5
            50: 20,   // 50 tokens for $20
            100: 35,  // 100 tokens for $35
            custom: 0.4  // $0.40 per token for custom amounts
        };
    }
    
    // Calculate price for token amount
    calculatePrice(amount) {
        if (this.tokenPrice[amount]) {
            return this.tokenPrice[amount];
        }
        // Calculate custom price
        return Math.round(amount * this.tokenPrice.custom * 100) / 100;
    }
    
    // Purchase tokens
    purchaseTokens(to, amount, paymentMethod, paymentDetails = {}) {
        // Verify transaction
        if (amount <= 0) return { success: false, message: "Invalid amount" };
        
        // Calculate price
        const price = this.calculatePrice(amount);
        
        // Create transaction data
        const txData = {
            type: "TOKEN_PURCHASE",
            amount: amount,
            price: price,
            paymentMethod: paymentMethod,
            details: paymentDetails
        };
        
        // Create transaction
        const tx = new Transaction(
            "TOKEN_MINTER",
            to,
            amount,
            txData
        );
        
        // Sign transaction (simulation)
        tx.signTransaction('token_minter_key');
        
        try {
            // Register in blockchain
            const txResult = voltChain.createTransaction(tx);
            
            // Update contract state
            if (!this.state[to]) {
                this.state[to] = [];
            }
            
            this.state[to].push({
                amount: amount,
                price: price,
                paymentMethod: paymentMethod,
                timestamp: tx.timestamp,
                txId: tx.txId
            });
            
            // Emit event (simulation)
            this.emitEvent('TokensPurchased', {
                user: to,
                amount: amount,
                price: price,
                paymentMethod: paymentMethod,
                timestamp: tx.timestamp,
                txId: tx.txId
            });
            
            return { 
                success: true, 
                message: "Token purchase successful", 
                txId: tx.txId, 
                timestamp: tx.timestamp 
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.message 
            };
        }
    }
}

// Define ABI for token sale contract
const tokenSaleABI = {
    contractName: "TokenSale",
    contractAddress: "0x4d81a9d62e7c4b01928a47b7c88d5a25d9d89e6f",
    methods: [
        {
            name: "purchaseTokens",
            inputs: [
                {name: "to", type: "address"},
                {name: "amount", type: "uint256"},
                {name: "paymentMethod", type: "string"}
            ],
            outputs: [
                {name: "success", type: "bool"},
                {name: "txId", type: "bytes32"}
            ]
        },
        {
            name: "calculatePrice",
            inputs: [
                {name: "amount", type: "uint256"}
            ],
            outputs: [
                {name: "price", type: "uint256"}
            ]
        }
    ],
    events: [
        {
            name: "TokensPurchased",
            inputs: [
                {name: "user", type: "address", indexed: true},
                {name: "amount", type: "uint256"},
                {name: "price", type: "uint256"},
                {name: "timestamp", type: "uint256"},
                {name: "txId", type: "bytes32", indexed: true}
            ]
        }
    ]
};

// Create token sale contract instance
const tokenSaleContract = new TokenSaleContract(
    "0x4d81a9d62e7c4b01928a47b7c88d5a25d9d89e6f",
    tokenSaleABI,
    "0x7a23b9c74d89e6f1a32d46b1f08239c7f1b"
);

// Add to global scope
window.tokenSaleContract = tokenSaleContract;

// Visualize token purchase transaction
function visualizeTokenPurchase(purchaseData) {
    // Close other visualizations if open
    document.getElementById('mining-visual').style.display = 'none';
    document.getElementById('contract-visual').style.display = 'none';
    
    return new Promise((resolve) => {
        // Initialize visualization
        const contractVisual = document.getElementById('contract-visual');
        contractVisual.style.display = 'flex';
        
        const contractContent = contractVisual.querySelector('.contract-content');
        contractContent.innerHTML = '';
        
        // Add contract info
        const contractInfo = document.createElement('div');
        contractInfo.className = 'contract-info';
        contractInfo.innerHTML = `
            <div>Contract: TokenSale</div>
            <div>Address: ${tokenSaleContract.address}</div>
            <div>Method: purchaseTokens(to, amount, paymentMethod)</div>
        `;
        contractContent.appendChild(contractInfo);
        
        // Display input data
        const inputData = document.createElement('div');
        inputData.className = 'mining-data';
        inputData.innerHTML = `
            <div class="data-header">Purchase Data:</div>
            <div class="data-content">${JSON.stringify({
                to: purchaseData.to,
                amount: purchaseData.amount,
                price: purchaseData.price,
                paymentMethod: purchaseData.paymentMethod
            }, null, 2)}</div>
        `;
        contractContent.appendChild(inputData);
        
        // Container for execution steps
        const steps = document.createElement('div');
        steps.className = 'contract-steps';
        contractContent.appendChild(steps);
        
        // Define execution steps
        const executionSteps = [
            { name: "Verify payment information", time: 600 },
            { name: "Process payment", time: 800 },
            { name: "Create token minting transaction", time: 700 },
            { name: "Execute smart contract", time: 900 },
            { name: "Update token balance", time: 600 },
            { name: "Emit TokensPurchased event", time: 500 }
        ];
        
        // Create element for each step
        executionSteps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'contract-step';
            stepEl.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-name">${step.name}</div>
                <div class="step-status pending">Pending</div>
            `;
            steps.appendChild(stepEl);
        });
        
        // Execute steps sequentially
        let totalDelay = 0;
        executionSteps.forEach((step, index) => {
            setTimeout(() => {
                steps.querySelectorAll('.contract-step')[index].querySelector('.step-status').textContent = 'Success';
                steps.querySelectorAll('.contract-step')[index].querySelector('.step-status').className = 'step-status success';
            }, totalDelay);
            
            totalDelay += step.time;
        });
        
        // Display final result
        setTimeout(() => {
            const result = document.createElement('div');
            result.className = 'contract-result';
            
            const txHash = window.crypto.generateTransactionHash();
            
            result.innerHTML = `
                <div class="result-success">✓ Token purchase successful</div>
                <div class="result-details">
                    <div>Tokens minted: ${purchaseData.amount} TKN</div>
                    <div>Price paid: $${purchaseData.price}</div>
                    <div>Transaction hash: ${txHash}</div>
                </div>
            `;
            contractContent.appendChild(result);
            
            // Resolve after displaying result
            setTimeout(() => {
                resolve({
                    success: true,
                    txHash: txHash, 
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        }, totalDelay);
        
        // Add event listener for close button
        document.getElementById('close-contract-visual').addEventListener('click', () => {
            contractVisual.style.display = 'none';
        });
    });
}

// Add to DOM content loaded event
document.addEventListener('DOMContentLoaded', () => {
    // Execute after existing code

    // Add token buttons to home and profile screens
    const homeScreen = document.querySelector('.home-screen');
    const profileScreen = document.querySelector('.profile-screen');
    
    // Create buttons
    const homeAddTokenButton = document.createElement('button');
    homeAddTokenButton.className = 'add-token-button';
    homeAddTokenButton.innerHTML = '<i class="fas fa-plus"></i>';
    homeAddTokenButton.id = 'home-add-token';
    
    const profileAddTokenButton = document.createElement('button');
    profileAddTokenButton.className = 'add-token-button';
    profileAddTokenButton.innerHTML = '<i class="fas fa-plus"></i>';
    profileAddTokenButton.id = 'profile-add-token';
    
    // Add buttons to screens
    homeScreen.appendChild(homeAddTokenButton);
    
    
    // Add event listeners for buttons
    homeAddTokenButton.addEventListener('click', () => {
        showScreen('token-purchase-screen');
    });
    
    profileAddTokenButton.addEventListener('click', () => {
        showScreen('token-purchase-screen');
    });
    
    // Back button for token purchase screen
    document.querySelector('.token-purchase-back-button').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // Purchase token options
    const purchaseOptions = document.querySelectorAll('.purchase-option');
    let selectedAmount = 0;
    
    purchaseOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            purchaseOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            option.classList.add('active');
            
            // Update selected amount
            selectedAmount = parseInt(option.dataset.amount);
            
            // Clear custom input
            document.getElementById('custom-token-amount').value = '';
        });
    });
    
    // Custom amount input
    const customAmountInput = document.getElementById('custom-token-amount');
    const customPriceElement = document.getElementById('custom-price');
    
    customAmountInput.addEventListener('input', () => {
        // Remove active class from predefined options
        purchaseOptions.forEach(opt => opt.classList.remove('active'));
        
        // Get custom amount
        const customAmount = parseInt(customAmountInput.value) || 0;
        selectedAmount = customAmount;
        
        // Calculate and display price
        const price = tokenSaleContract.calculatePrice(customAmount);
        customPriceElement.textContent = `$${price}`;
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method-option');
    let selectedPaymentMethod = 'credit';
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to selected method
            method.classList.add('active');
            
            // Update selected method
            selectedPaymentMethod = method.dataset.method;
        });
    });
    
    // Purchase token button
    document.getElementById('purchase-token-button').addEventListener('click', async () => {
        // Validate amount
        if (selectedAmount <= 0) {
            showNotification('Please select or enter a valid amount', false);
            return;
        }
        
        // Prepare purchase data
        const purchaseData = {
            to: userData.address,
            amount: selectedAmount,
            price: tokenSaleContract.calculatePrice(selectedAmount),
            paymentMethod: selectedPaymentMethod
        };
        
        try {
            // Show loading
            showLoading('Processing token purchase...');
            
            // Execute token purchase
            const purchaseResult = await visualizeTokenPurchase(purchaseData);
            
            if (!purchaseResult.success) {
                hideLoading();
                showNotification(purchaseResult.message || 'Token purchase failed', false);
                return;
            }
            
            // Mine the transaction
            showLoading('Mining transaction...');
            
            const miningResult = await visualizeMining({
                type: "TOKEN_PURCHASE",
                from: "TOKEN_MINTER",
                to: userData.address,
                amount: selectedAmount,
                price: purchaseData.price,
                txHash: purchaseResult.txHash,
                timestamp: purchaseResult.timestamp
            });
            
            // Update user data
            userData.balance += selectedAmount;
            
            // Create transaction record
            const txId = purchaseResult.txHash;
            const today = new Date().toISOString().split('T')[0];
            
            userData.transactions.unshift({
                id: txId.substring(2, 8),
                date: today,
                station: "Token Purchase",
                amount: selectedAmount,
                type: "PURCHASE",
                txHash: miningResult.hash,
                blockHeight: miningResult.blockHeight,
                confirmations: 1
            });
            
            // Update success screen
            document.getElementById('token-success-amount').textContent = selectedAmount;
            document.getElementById('token-success-date').textContent = formatDate(today);
            document.getElementById('token-success-method').textContent = 
                selectedPaymentMethod === 'credit' ? 'Credit Card' : 
                selectedPaymentMethod === 'bank' ? 'Bank Transfer' : 'Cryptocurrency';
            document.getElementById('token-success-balance').textContent = userData.balance;
            document.getElementById('token-success-tx-id').textContent = miningResult.hash.substring(0, 20) + '...';
            document.getElementById('token-success-block').textContent = miningResult.blockHeight;
            
            // Hide loading and show success
            hideLoading();
            updateBalanceDisplay();
            updateTransactionHistory();
            showScreen('token-transaction-success-screen');
            
            // Reset form
            purchaseOptions.forEach(opt => opt.classList.remove('active'));
            customAmountInput.value = '';
            customPriceElement.textContent = '$0';
            selectedAmount = 0;
        } catch (error) {
            hideLoading();
            showNotification('Token purchase failed: ' + error.message, false);
        }
    });
    
    // Success screen back to home
    document.getElementById('token-back-to-home-button').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // View on explorer button
    document.getElementById('token-view-on-explorer').addEventListener('click', () => {
        showNotification('Blockchain explorer view coming soon');
    });
});

// Add to global scope for use in app.js
window.Transaction = Transaction;
window.voltChain = voltChain;
window.chargingContract = chargingContract;