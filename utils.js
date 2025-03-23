const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to store user group data
const dataFile = path.join(__dirname, './data/userGroupData.json');

// Load user group data
const loadUserGroupData = () => {
    try {
        if (fs.existsSync(dataFile)) {
            return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        }
        return { users: [], groups: [], antilink: {} };
    } catch (error) {
        console.error('Error loading user group data:', error);
        return { users: [], groups: [], antilink: {} };
    }
};

// Save user group data
const saveUserGroupData = (data) => {
    try {
        const dir = path.dirname(dataFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving user group data:', error);
        return false;
    }
};

// Encrypt session data
async function encryptSession(data) {
    try {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        let encrypted = cipher.update(JSON.stringify(data));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        return {
            key: key.toString('hex'),
            iv: iv.toString('hex'),
            data: encrypted.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Decrypt session data
async function decryptSession(encrypted) {
    try {
        const key = Buffer.from(encrypted.key, 'hex');
        const iv = Buffer.from(encrypted.iv, 'hex');
        const encryptedData = Buffer.from(encrypted.data, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return JSON.parse(decrypted.toString());
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Handle custom commands and user actions
module.exports = {
    loadCommands,
    loadUserGroupData,
    saveUserGroupData,
    generateSessionId,
    saveSession,
    loadSession,
    getSessionInfo,
    // Remove "KnightBot" and replace forward messages with normal ones
    sendCustomMessage: async (sock, chatId, message) => {
        const messageText = message.replace('KnightBot', ''); // Remove 'KnightBot' from the message
        const customMessage = {
            text: messageText,
            footer: 'Join our WhatsApp group: https://chat.whatsapp.com/KLKN82qCRvv5Mt4n3eZjGQ' // Add your link
        };
        await sock.sendMessage(chatId, customMessage); // Send the normal message
    }
};
