// Helper functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.querySelector(`.${screenId}`).classList.add('active');
}

function showNotification(message, isSuccess = true) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateBalanceDisplay() {
    const balance = Math.floor(userData.balance);
    document.querySelectorAll('.token-balance').forEach(el => {
        el.textContent = `${balance} TKN`;
    });
}

function showLoading(message = 'Processing...') {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Fungsi yang disempurnakan untuk visualisasi mining
function visualizeMining(transactionData) {
    // Tutup visualisasi kontrak jika terbuka
    document.getElementById('contract-visual').style.display = 'none';
    
    return new Promise((resolve) => {
        // Inisialisasi visualisasi
        const miningVisual = document.getElementById('mining-visual');
        miningVisual.style.display = 'flex';
        
        const miningContent = miningVisual.querySelector('.mining-content');
        miningContent.innerHTML = '';
        
        // Tambahkan detail mining
        const details = document.createElement('div');
        details.className = 'mining-details';
        details.innerHTML = `
            <div>Network: ${blockchainData.networkName}</div>
            <div>Difficulty: ${blockchainData.difficulty}</div>
            <div>Target: ${'0'.repeat(blockchainData.difficulty)}... (${blockchainData.difficulty} leading zeros)</div>
        `;
        miningContent.appendChild(details);
        
        // Tampilkan data transaksi
        const txData = document.createElement('div');
        txData.className = 'mining-data';
        txData.innerHTML = `
            <div class="data-header">Block Data:</div>
            <div class="data-content">${JSON.stringify({
                blockHeight: blockchainData.currentBlockHeight + 1,
                previousHash: voltChain.getLatestBlock().hash.substring(0, 20) + '...',
                timestamp: new Date().toISOString(),
                transactions: [transactionData]
            }, null, 2)}</div>
        `;
        miningContent.appendChild(txData);
        
        // Container untuk proses hashing
        const hashProcess = document.createElement('div');
        hashProcess.className = 'hash-process';
        miningContent.appendChild(hashProcess);
        
        // Gunakan miner dari blockchain.js
        const miner = window.crypto.mineBlock(
            {
                blockHeader: {
                    index: blockchainData.currentBlockHeight + 1,
                    previousHash: voltChain.getLatestBlock().hash,
                    timestamp: new Date().toISOString(),
                    transaction: transactionData
                },
                nonce: 0
            }, 
            blockchainData.difficulty
        );
        
        // Visualisasi proses mining
        miner.startVisual((result) => {
            // Tampilkan hash attempts setiap kali mencoba
            const updateMiningVisual = (nonce, hash, isValid = false) => {
                const attempt = document.createElement('div');
                attempt.className = 'hash-attempt';
                attempt.innerHTML = `
                    <span class="nonce">Nonce: ${nonce}</span>
                    <span class="hash-result">Hash: <span class="${isValid ? 'valid-hash' : ''}">${hash}</span></span>
                `;
                hashProcess.appendChild(attempt);
                hashProcess.scrollTop = hashProcess.scrollHeight;
            };
            
            // Tampilkan beberapa percobaan nonce
            for (let i = 0; i < Math.min(result.nonce, 5); i++) {
                const fakeNonce = i;
                const fakeHash = window.crypto.sha256(JSON.stringify(transactionData) + fakeNonce);
                updateMiningVisual(fakeNonce, fakeHash);
            }
            
            // Jika nonce tinggi, tampilkan bahwa kita melewati beberapa langkah
            if (result.nonce > 5) {
                const skipMessage = document.createElement('div');
                skipMessage.className = 'mining-skipped';
                skipMessage.textContent = `... ${result.nonce - 5} attempts skipped ...`;
                hashProcess.appendChild(skipMessage);
            }
            
            // Tampilkan nonce valid
            updateMiningVisual(result.nonce, result.hash, true);
            
            // Tampilkan success message
            const successMsg = document.createElement('div');
            successMsg.className = 'mining-success';
            successMsg.innerHTML = `
                <div>✓ Valid hash found!</div>
                <div>Nonce: ${result.nonce}</div>
                <div>Hash: ${result.hash}</div>
                <div>Time: ${result.time.toFixed(2)} seconds</div>
                <div>Block: ${blockchainData.currentBlockHeight + 1}</div>
            `;
            miningContent.appendChild(successMsg);
            
            // Tunggu sebentar sebelum menyelesaikan
            setTimeout(() => {
                // Perbarui nilai blockchain
                blockchainData.currentBlockHeight++;
                blockchainData.lastBlockTime = "just now";
                
                // Resolve promise dengan hasil mining
                resolve({
                    hash: result.hash,
                    nonce: result.nonce,
                    blockHeight: blockchainData.currentBlockHeight
                });
            }, 2000);
        });
        
        // Tambahkan event listener untuk tombol close
        document.getElementById('close-mining-visual').addEventListener('click', () => {
            miningVisual.style.display = 'none';
        });
    });
}

// Fungsi untuk visualisasi eksekusi smart contract
function visualizeSmartContract(contractData) {
    return new Promise((resolve) => {
        // Tutup visualisasi mining jika terbuka
        document.getElementById('mining-visual').style.display = 'none';
        
        // Tampilkan visualisasi kontrak
        const contractVisual = document.getElementById('contract-visual');
        contractVisual.style.display = 'flex';
        
        const contractContent = contractVisual.querySelector('.contract-content');
        contractContent.innerHTML = '';
        
        // Tambahkan kontrak info
        const contractInfo = document.createElement('div');
        contractInfo.className = 'contract-info';
        contractInfo.innerHTML = `
            <div>Contract: ${smartContractABI.contractName}</div>
            <div>Address: ${chargingContract.address}</div>
            <div>Method: makePayment(stationId, amount, kwh)</div>
        `;
        contractContent.appendChild(contractInfo);
        
        // Tampilkan input data
        const inputData = document.createElement('div');
        inputData.className = 'mining-data';
        inputData.innerHTML = `
            <div class="data-header">Input Data:</div>
            <div class="data-content">${JSON.stringify(contractData, null, 2)}</div>
        `;
        contractContent.appendChild(inputData);
        
        // Container untuk langkah-langkah eksekusi
        const steps = document.createElement('div');
        steps.className = 'contract-steps';
        contractContent.appendChild(steps);
        
        // Definisikan langkah-langkah eksekusi
        const executionSteps = [
            { name: "Verify sender signature", time: 500 },
            { name: "Check token balance", time: 700 },
            { name: "Validate EV station", time: 600 },
            { name: "Execute smart contract", time: 1000 },
            { name: "Update contract state", time: 800 },
            { name: "Emit PaymentReceived event", time: 500 }
        ];
        
        // Buat elemen untuk setiap langkah
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
        
        // Lanjutkan menjalankan langkah-langkah
        let totalDelay = 0;
        executionSteps.forEach((step, index) => {
            setTimeout(() => {
                steps.querySelectorAll('.contract-step')[index].querySelector('.step-status').textContent = 'Success';
                steps.querySelectorAll('.contract-step')[index].querySelector('.step-status').className = 'step-status success';
            }, totalDelay);
            
            totalDelay += step.time;
        });
        
        // Tampilkan hasil akhir
        setTimeout(() => {
            const result = document.createElement('div');
            result.className = 'contract-result';
            
            const txHash = window.crypto.generateTransactionHash();
            
            result.innerHTML = `
                <div class="result-success">✓ Contract executed successfully</div>
                <div class="result-details">
                    <div>Transaction added to mempool</div>
                    <div>Gas used: ${appSettings.defaultGasLimit}</div>
                    <div>Transaction hash: ${txHash}</div>
                </div>
            `;
            contractContent.appendChild(result);
            
            // Tunggu sebelum resolve
            setTimeout(() => {
                resolve({
                    success: true,
                    txHash: txHash, 
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        }, totalDelay);
        
        // Tambahkan event listener untuk tombol close
        document.getElementById('close-contract-visual').addEventListener('click', () => {
            contractVisual.style.display = 'none';
        });
    });
}

// Update transaction history
function updateTransactionHistory() {
    const historyContainer = document.getElementById('transaction-history');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';

    if (userData.transactions.length === 0) {
        historyContainer.innerHTML = '<div class="transaction-item">No transactions yet</div>';
        return;
    }

    userData.transactions.forEach(tx => {
        const txItem = document.createElement('div');
        txItem.className = 'transaction-item';
        txItem.innerHTML = `
            <div class="transaction-date">${formatDate(tx.date)}</div>
            <div class="transaction-details">
                <span class="transaction-station">${tx.station}</span>
                <span class="transaction-amount">${tx.amount} TKN</span>
            </div>
            <div class="transaction-details">
                <span class="transaction-kwh">${tx.kwh} kWh</span>
                <span class="transaction-hash">${tx.txHash.substring(0, 10)}...</span>
            </div>
            <div class="transaction-blockchain-info">
                <span class="block-height">Block: ${tx.blockHeight}</span>
                <span class="confirmations">Confirms: ${tx.confirmations}</span>
            </div>
        `;
        historyContainer.appendChild(txItem);
    });

    // Update transaction count in profile
    const totalTxElement = document.getElementById('total-transactions');
    if (totalTxElement) {
        totalTxElement.textContent = userData.transactions.length;
    }
}

// Update blockchain stats
function updateBlockchainStats() {
    // Update blockchain stats in UI
    const elements = {
        'current-block': blockchainData.currentBlockHeight,
        'network-hashrate': blockchainData.networkHashrate,
        'blockchain-current-block': blockchainData.currentBlockHeight,
        'blockchain-hashrate': blockchainData.networkHashrate, 
        'blockchain-difficulty': blockchainData.difficulty,
        'blockchain-last-block': blockchainData.lastBlockTime
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Update profile info
function updateProfileInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userData'));
    if (userInfo) {
        document.getElementById('profile-name').textContent = userInfo.name;
        document.getElementById('profile-email').textContent = userInfo.email;
        document.getElementById('member-since').textContent = formatDate(userInfo.registrationDate);
        
        // Update wallet addresses
        const walletElements = document.querySelectorAll('.wallet-address');
        walletElements.forEach(el => {
            el.textContent = userInfo.walletAddress;
        });
        
        // Update home wallet address
        const homeWalletElement = document.getElementById('home-wallet-address');
        if (homeWalletElement) {
            homeWalletElement.textContent = userInfo.walletAddress.substring(0, 10) + '...';
        }
    }
}

// Validasi email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Validasi password
function validatePassword(password) {
    return password.length >= 6;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login screen
    document.getElementById('login-button').addEventListener('click', () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showNotification('Please enter email and password', false);
            return;
        }
        
        const userInfo = JSON.parse(localStorage.getItem('userData'));
        
        if (!userInfo) {
            showNotification('Please sign up first', false);
            return;
        }
        
        if (userInfo.email === email && userInfo.password === password) {
            showLoading('Authenticating...');
            setTimeout(() => {
                hideLoading();
                showScreen('home-screen');
                updateBalanceDisplay();
                updateTransactionHistory();
                updateProfileInfo();
                updateBlockchainStats();
                
                // Set wallet address to header
                const homeWalletElement = document.getElementById('home-wallet-address');
                if (homeWalletElement) {
                    homeWalletElement.textContent = userInfo.walletAddress.substring(0, 10) + '...';
                }
            }, 1000);
        } else {
            showNotification('Invalid email or password', false);
        }
    });

    // Switch to sign up screen
    document.getElementById('show-signup-button').addEventListener('click', () => {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        showScreen('signup-screen');
    });

    // Back to login
    document.getElementById('back-to-login-button').addEventListener('click', () => {
        showScreen('login-screen');
    });

    // Sign up functionality
    document.getElementById('signup-button').addEventListener('click', () => {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill all fields', false);
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email', false);
            return;
        }
        
        if (!validatePassword(password)) {
            showNotification('Password must be at least 6 characters', false);
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', false);
            return;
        }
        
        showLoading('Creating wallet...');
        
        setTimeout(() => {
            // Generate a wallet address
            const walletAddress = '0x' + window.crypto.sha256(email + new Date().getTime()).substring(0, 40);
            
            // Store user info
            const registrationDate = new Date().toISOString();
            const userInfo = {
                name,
                email,
                password,
                registrationDate,
                walletAddress
            };
            
            localStorage.setItem('userData', JSON.stringify(userInfo));
            
            // Update user name in home screen
            userData.name = name;
            userData.address = walletAddress;
            
            hideLoading();
            
            // Show success notification
            showNotification('Account created successfully! Please log in.');
            
            // Clear form and go back to login
            document.getElementById('signup-name').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
            showScreen('login-screen');
        }, 1500);
    });

    // Home screen
    document.getElementById('charge-now-button').addEventListener('click', () => {
        showScreen('station-screen');
    });

    // Navigation tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.screen) {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                showScreen(tab.dataset.screen);

                // Update profile if navigating to profile screen
                if (tab.dataset.screen === 'profile-screen') {
                    updateProfileInfo();
                } else if (tab.dataset.screen === 'blockchain-screen') {
                    updateBlockchainStats();
                } else if (tab.dataset.screen === 'history-screen') {
                    updateTransactionHistory();
                }
            } else {
                showNotification('Feature coming soon');
            }
        });
    });

    // Station screen
    document.getElementById('locate-station-button').addEventListener('click', () => {
        showLoading('Finding nearby stations...');
        
        setTimeout(() => {
            hideLoading();
            showNotification('Found 4 stations nearby');
            
            // Animate station markers
            const marker = document.querySelector('.station-marker');
            if (marker) {
                marker.classList.add('pulse');
                setTimeout(() => marker.classList.remove('pulse'), 2000);
            }
        }, 1000);
    });

    const stationSelector = document.getElementById('station-selector');
    stationSelector.addEventListener('change', () => {
        document.getElementById('select-station-button').disabled = !stationSelector.value;
        
// Show station blockchain info if selected
const selectedStation = stationSelector.value;
if (selectedStation && stationData[selectedStation]) {
    const stationInfo = document.getElementById('station-blockchain-info');
    if (stationInfo) {
        stationInfo.innerHTML = `
            <div class="station-contract">
                <div class="contract-label">Smart Contract:</div>
                <div class="contract-address">${stationData[selectedStation].contractAddress}</div>
            </div>
            <div class="station-rate">
                <div class="rate-label">Conversion Rate:</div>
                <div class="rate-value">${stationData[selectedStation].conversionRate} kWh/TKN</div>
            </div>
            <div class="station-location">
                <div class="location-label">Location:</div>
                <div class="location-value">${stationData[selectedStation].location}</div>
            </div>
        `;
        stationInfo.style.display = 'block';
    }
}
});

document.getElementById('select-station-button').addEventListener('click', () => {
const selectedStation = stationSelector.value;
document.getElementById('selected-station-display').textContent = selectedStation;
showScreen('payment-screen');
});

document.querySelector('.back-button').addEventListener('click', () => {
showScreen('home-screen');
});

// Payment screen
const tokenAmountInput = document.getElementById('token-amount');
const kwhEstimateInput = document.getElementById('kwh-estimate');
const payButton = document.getElementById('pay-button');

tokenAmountInput.addEventListener('input', () => {
const amount = parseInt(tokenAmountInput.value) || 0;
const selectedStation = document.getElementById('selected-station-display').textContent;
const conversionRate = stationData[selectedStation].conversionRate;

kwhEstimateInput.value = (amount * conversionRate).toFixed(2);
payButton.disabled = amount <= 0 || amount > userData.balance;

// Update gas estimate
const gasEstimate = document.getElementById('gas-estimate');
if (gasEstimate) {
    gasEstimate.textContent = `Gas Limit: ${appSettings.defaultGasLimit} | Gas Price: ${blockchainData.gasPrice}`;
}
});

document.querySelector('.payment-back-button').addEventListener('click', () => {
showScreen('station-screen');
});

payButton.addEventListener('click', async () => {
const amount = parseInt(tokenAmountInput.value);
const kwh = parseFloat(kwhEstimateInput.value);
const selectedStation = document.getElementById('selected-station-display').textContent;

if (amount <= 0 || amount > userData.balance) {
    showNotification('Invalid amount', false);
    return;
}

// Prepare transaction data
const transactionData = {
    from: userData.address,
    to: stationData[selectedStation].contractAddress,
    amount: amount,
    station: selectedStation,
    kwh: kwh,
    gasLimit: appSettings.defaultGasLimit,
    gasPrice: blockchainData.gasPrice
};

try {
    // 1. Execute smart contract
    showLoading('Executing smart contract...');
    
    const contractResult = await visualizeSmartContract({
        method: "makePayment",
        params: {
            stationId: stationData[selectedStation].contractAddress,
            amount: amount,
            kwh: kwh
        },
        sender: userData.address
    });
    
    if (!contractResult.success) {
        hideLoading();
        showNotification(contractResult.message || 'Transaction failed', false);
        return;
    }
    
    // 2. Mine the transaction to add to blockchain
    showLoading('Mining transaction...');
    
    const miningResult = await visualizeMining({
        ...transactionData,
        txHash: contractResult.txHash,
        timestamp: contractResult.timestamp
    });
    
    // 3. Update user data and UI
    userData.balance -= amount;
    
    const txId = contractResult.txHash;
    const today = new Date().toISOString().split('T')[0];
    
    userData.transactions.unshift({
        id: txId.substring(2, 8),
        date: today,
        station: selectedStation,
        amount: amount,
        kwh: kwh,
        txHash: miningResult.hash,
        blockHeight: miningResult.blockHeight,
        confirmations: 1,
        gasUsed: appSettings.defaultGasLimit
    });

    // Update UI for success screen
    document.getElementById('success-amount').textContent = amount;
    document.getElementById('success-station').textContent = selectedStation;
    document.getElementById('success-date').textContent = formatDate(today);
    document.getElementById('success-kwh').textContent = kwh;
    document.getElementById('success-balance').textContent = userData.balance;
    document.getElementById('success-tx-id').textContent = miningResult.hash.substring(0, 20) + '...';
    document.getElementById('success-block').textContent = miningResult.blockHeight;
    document.getElementById('success-nonce').textContent = miningResult.nonce;

    // Hide loader and show success screen
    hideLoading();
    updateBalanceDisplay();
    updateTransactionHistory();
    showScreen('transaction-success-screen');
    
    // Reset payment form
    tokenAmountInput.value = '';
    kwhEstimateInput.value = '';
    payButton.disabled = true;
} catch (error) {
    hideLoading();
    showNotification('Transaction failed: ' + error.message, false);
}
});

// Success screen
document.getElementById('back-to-home-button').addEventListener('click', () => {
showScreen('home-screen');
});

// View transaction on blockchain explorer
document.getElementById('view-on-explorer').addEventListener('click', () => {
showNotification('Blockchain explorer view coming soon');
});

// Blockchain screen
document.getElementById('refresh-blockchain').addEventListener('click', () => {
showLoading('Synchronizing blockchain data...');

setTimeout(() => {
    // Increment block heights and confirmations
    blockchainData.currentBlockHeight += Math.floor(Math.random() * 3) + 1;
    userData.transactions.forEach(tx => {
        tx.confirmations += Math.floor(Math.random() * 3) + 1;
    });
    
    // Update network stats
    blockchainData.networkHashrate = `${Math.floor(120 + Math.random() * 20)} TH/s`;
    blockchainData.lastBlockTime = `${Math.floor(Math.random() * 30) + 5} sec ago`;
    
    updateBlockchainStats();
    updateTransactionHistory();
    hideLoading();
    showNotification('Blockchain data updated');
}, 1000);
});

// Close mining and contract visualizations on ESC key
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
    document.getElementById('mining-visual').style.display = 'none';
    document.getElementById('contract-visual').style.display = 'none';
}
});

// Logout functionality
document.getElementById('logout-button').addEventListener('click', () => {
showLoading('Logging out...');
setTimeout(() => {
    hideLoading();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showScreen('login-screen');
}, 1000);
});

// Init station-blockchain-info (hide it initially)
const stationBlockchainInfo = document.getElementById('station-blockchain-info');
if (stationBlockchainInfo) {
stationBlockchainInfo.style.display = 'none';
}
});

// Function to initialize the map feature
function initializeMap() {
    // Get elements
    const mapSvg = document.getElementById('map-svg');
    const stationPoints = document.querySelectorAll('.station-point');
    const stationListItems = document.querySelectorAll('.station-list-item');
    const mapToStationButton = document.getElementById('map-to-station-button');
    
    // Selected station
    let selectedStation = null;
    
    // Function to update selected station
    function updateSelectedStation(stationName) {
        // Reset previous selections
        stationPoints.forEach(point => {
            point.classList.remove('active');
        });
        
        stationListItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // If no station selected, disable button
        if (!stationName) {
            mapToStationButton.disabled = true;
            selectedStation = null;
            return;
        }
        
        // Update selected station
        selectedStation = stationName;
        
        // Highlight the selected station on map
        stationPoints.forEach(point => {
            if (point.dataset.station === stationName) {
                point.classList.add('active');
            }
        });
        
        // Highlight the selected station in list
        stationListItems.forEach(item => {
            if (item.dataset.station === stationName) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        
        // Enable the button
        mapToStationButton.disabled = false;
    }
    
    // Add click event listeners to station points on map
    stationPoints.forEach(point => {
        point.addEventListener('click', () => {
            updateSelectedStation(point.dataset.station);
        });
    });
    
    // Add click event listeners to station list items
    stationListItems.forEach(item => {
        item.addEventListener('click', () => {
            updateSelectedStation(item.dataset.station);
        });
    });
    
    // Add click event listener to the continue button
    mapToStationButton.addEventListener('click', () => {
        if (selectedStation) {
            // Set the selected station in the station selector dropdown
            const stationSelector = document.getElementById('station-selector');
            if (stationSelector) {
                stationSelector.value = selectedStation;
                
                // Trigger change event
                const event = new Event('change');
                stationSelector.dispatchEvent(event);
            }
            
            // Navigate to station screen
            showScreen('station-screen');
        }
    });
    
    // Back button
    document.querySelector('.station-map-screen .back-button').addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    // Disable button initially
    mapToStationButton.disabled = true;
    
    // Simulate real-time availability updates
    setInterval(() => {
        stationListItems.forEach(item => {
            const availableElement = item.querySelector('.station-list-available');
            if (availableElement) {
                const parts = availableElement.textContent.split('/');
                if (parts.length === 2) {
                    const available = Math.floor(Math.random() * parseInt(parts[1])) + 1;
                    availableElement.textContent = `${available}/${parts[1]} Available`;
                    
                    // Change color based on availability
                    if (available === 0) {
                        availableElement.style.color = '#dc3545';
                    } else if (available < parseInt(parts[1]) / 2) {
                        availableElement.style.color = '#ffc107';
                    } else {
                        availableElement.style.color = '#28a745';
                    }
                }
            }
        });
    }, 10000); // Update every 10 seconds
}