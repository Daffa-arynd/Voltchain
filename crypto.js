/**
 * Implementasi sederhana SHA-256 untuk tujuan pembelajaran
 * Catatan: Ini bukan implementasi kriptografi sebenarnya, hanya simulasi
 */

// Fungsi pembantu - pastikan fungsi ini ada sebelum digunakan
if (!window.crypto) {
    window.crypto = {};
}

// Konstanta untuk algoritma SHA-256
const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967
];

// METODE SHA256
// Fungsi auxiliary SHA-256
function ROTR(x, n) {
    return (x >>> n) | (x << (32 - n));
}

function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
}

function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}

function Sigma0(x) {
    return ROTR(x, 2) ^ ROTR(x, 13) ^ ROTR(x, 22);
}

function Sigma1(x) {
    return ROTR(x, 6) ^ ROTR(x, 11) ^ ROTR(x, 25);
}

function sigma0(x) {
    return ROTR(x, 7) ^ ROTR(x, 18) ^ (x >>> 3);
}

function sigma1(x) {
    return ROTR(x, 17) ^ ROTR(x, 19) ^ (x >>> 10);
}

//METODE SHA256
// Implementasi SHA-256 Sederhana
function sha256(message) {
    // Untuk tujuan simulasi, kita gunakan versi sederhana
    // Pada aplikasi nyata, digunakan implementasi yang jauh lebih kompleks
    
    if (typeof message !== 'string') {
        message = JSON.stringify(message);
    }
    
    // Konversi string ke array byte
    const byteArray = [];
    for (let i = 0; i < message.length; i++) {
        byteArray.push(message.charCodeAt(i));
    }
    
    // Nilai inisialisasi hash
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    
    // Panjang pesan dalam bit
    const messageLength = message.length * 8;

// METODE SHA256
    // Komputasi hash (simulasi)
    for (let i = 0; i < byteArray.length; i++) {
        // Simulasi perhitungan hash
        h0 = (h0 + byteArray[i] * 7) % 0xFFFFFFFF;
        h1 = (h1 + byteArray[i] * 11) % 0xFFFFFFFF;
        h2 = (h2 + byteArray[i] * 17) % 0xFFFFFFFF;
        h3 = (h3 + byteArray[i] * 19) % 0xFFFFFFFF;
        h4 = (h4 + byteArray[i] * 23) % 0xFFFFFFFF;
        h5 = (h5 + byteArray[i] * 29) % 0xFFFFFFFF;
        h6 = (h6 + byteArray[i] * 31) % 0xFFFFFFFF;
        h7 = (h7 + byteArray[i] * 37) % 0xFFFFFFFF;
        
        // Lakukan Operasi non-linear untuk simulasi
        h0 = (h0 ^ h1 ^ messageLength) % 0xFFFFFFFF;
        h1 = (h1 ^ h2 ^ i) % 0xFFFFFFFF;
        h2 = (h2 ^ h3) % 0xFFFFFFFF;
        h3 = (h3 ^ h4) % 0xFFFFFFFF;
        h4 = (h4 ^ h5) % 0xFFFFFFFF;
        h5 = (h5 ^ h6) % 0xFFFFFFFF;
        h6 = (h6 ^ h7) % 0xFFFFFFFF;
        h7 = (h7 ^ h0) % 0xFFFFFFFF;
    }
    
    // Konversi nilai hash ke string hex
    function toHex(num) {
        return ('00000000' + num.toString(16)).slice(-8);
    }
    
    return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + 
           toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// METODE POW
// Simulasi pencarian nonce untuk PoW (Proof of Work)
function mineBlock(data, difficulty) {
    const prefix = '0'.repeat(difficulty);
    let nonce = 0;
    let hash = '';
    const startTime = Date.now();
    
    //METODE POW (PROOF OF WORK)
    // Buat juga versi untuk visual mining
    const mineBlockVisual = (callback) => {
        const interval = setInterval(() => {
            hash = sha256(JSON.stringify(data) + nonce);

            // Cek jika hash memenuhi target difficulty
            if (hash.substring(0, difficulty) === prefix) {
                clearInterval(interval);
                const endTime = Date.now();
                callback({
                    hash: hash,
                    nonce: nonce,
                    time: (endTime - startTime) / 1000
                });
            }
            
            nonce++;
            
            // Batasi visualisasi untuk mencegah browser freeze
            if (nonce > 50) {
                clearInterval(interval);
                // Simulasi menemukan nonce valid
                const simulatedNonce = Math.floor(Math.random() * 10000) + 1000;
                const simulatedHash = prefix + sha256(JSON.stringify(data) + simulatedNonce).substring(difficulty);
                const endTime = Date.now();
                
                callback({
                    hash: simulatedHash,
                    nonce: simulatedNonce,
                    time: (endTime - startTime) / 1000,
                    simulated: true
                });
            }
        }, 100);
    };
    
    return {
        start: () => {
            return new Promise((resolve) => {
                while (true) {
                    hash = sha256(JSON.stringify(data) + nonce);
                    
                    // Cek jika hash memenuhi target difficulty
                    if (hash.substring(0, difficulty) === prefix) {
                        const endTime = Date.now();
                        resolve({
                            hash: hash,
                            nonce: nonce,
                            time: (endTime - startTime) / 1000
                        });
                        break;
                    }
                    
                    nonce++;
                    
                    // Batasi simulasi untuk mencegah browser freeze
                    if (nonce > 1000) {
                        // Simulasi menemukan nonce valid
                        const simulatedNonce = Math.floor(Math.random() * 10000) + 1000;
                        const simulatedHash = prefix + sha256(JSON.stringify(data) + simulatedNonce).substring(difficulty);
                        const endTime = Date.now();
                        
                        resolve({
                            hash: simulatedHash,
                            nonce: simulatedNonce,
                            time: (endTime - startTime) / 1000,
                            simulated: true
                        });
                        break;
                    }
                }
            });
        },
        startVisual: (callback) => {
            mineBlockVisual(callback);
        }
    };
}

// Generate random transaction hash
function generateTransactionHash() {
    return '0x' + sha256(Date.now().toString() + Math.random().toString()).substring(0, 40);
}

// Expose functions to global scope
window.crypto.sha256 = sha256;
window.crypto.mineBlock = mineBlock;
window.crypto.generateTransactionHash = generateTransactionHash;