importScripts(
    '../dist/nacl-fast.min.js',
    '../dist/nacl-util.min.js',
    './utilities.js',
    './google-analytics.js',
    './scripting.js',
    './settings.js',
)

const BACKEND_ORIGIN = 'https://black-cell-45d3.inprogress.workers.dev'
const INSTALL_URL = 'https://june07.com/mfa-install/?utm_source=mfa&utm_medium=chrome_extension&utm_campaign=extension_install&utm_content=1'
let cache = {
    injected: {}
}

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        const mfaPlusEmail = `mfa+${generateSecureRandomString(21)}@june07.com`

        googleAnalytics.fireEvent('mfaPlusEmail', { address: mfaPlusEmail })
        chrome.tabs.create({ url: INSTALL_URL })
        chrome.storage.local.set({
            mfaPlusEmail
        })
        // analytics.push({ event: 'install', onInstalledReason: details.reason })
        googleAnalytics.fireEvent('install', { onInstalledReason: details.reason })
    }
})
function generateSecureRandomString(length) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789-_'
    const alphabetLength = alphabet.length
    let randomString = ''

    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)

    for (let i = 0; i < length; i++) {
        randomString += alphabet[randomValues[i] % alphabetLength]
    }

    return randomString
}
function extractVerificationCode(message) {
    const code = atob(message.payload.parts[0].body.data).split(/\r\n/).map(p => p.replace(/\s*|\,/, '')).filter(p => p).find(code => /\d{6}/.test(code))

    googleAnalytics.fireEvent('extractVerificationCode')

    return code
}
async function fetchMessageFromBackend(tabId, toEmail, fromEmail, subjectQuery, afterTimestamp) {
    const timestamp = cache.injected[tabId]
    let fullMessage, tries = 1

    googleAnalytics.fireEvent('fetchMessageFromBackend')

    async function fetchMessage() {
        // 
        const response = await fetch(`${BACKEND_ORIGIN}/api/v1/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toEmail,
                fromEmail,
                subjectQuery,
                afterTimestamp
            }),
        }).then(res => res.json())

        if (!response.success) {
            throw response.error
        }
        return response.data
    }

    while (tries <= 10 && !fullMessage && timestamp === cache.injected[tabId]) {
        try {
            fullMessage = await fetchMessage()
            return fullMessage
        } catch (error) {
            console.error('Error fetching message:', error)
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, tries) * 1000))
        tries++
    }
    if (timestamp !== cache.injected[tabId]) {
        console.log('Fetch cancelled because the tab timestamp has changed.')
    }
}
// Function to fetch a message from Gmail based on sender, subject, and timestamp
async function fetchMessageFromGmail(tabId, accessToken, fromEmail, subjectQuery, afterTimestamp) {
    const timestamp = cache.injected[tabId]

    googleAnalytics.fireEvent('fetchMessageFromGmail')

    async function fetchMessages() {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${fromEmail} subject:${subjectQuery} after:${afterTimestamp}&maxResults=1`
        let response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Replace with your access token
            },
        })

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
        }

        response = await response.json()
        return response
    }
    async function fetchMessageDetails(messageId) {
        const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`
        let response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Replace with your access token
            },
        })

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
        }

        response = response.json()
        return response
    }
    async function checkMessages() {
        try {
            const response = await fetchMessages()
            const messages = response.messages

            if (messages?.length) {
                return messages.pop()
            } else {
                console.log('No messages found matching criteria.')
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    let fullMessage, tries = 1

    while (tries <= 10 && !fullMessage && timestamp === cache.injected[tabId]) {
        try {
            const message = await checkMessages()
            if (message) {
                fullMessage = await fetchMessageDetails(message.id)
                if (fullMessage) {
                    return fullMessage
                }
            }
        } catch (error) {
            console.error('Error fetching message:', error)
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, tries) * 1000))
        tries++
    }
    if (timestamp !== cache.injected[tabId]) {
        console.log('Fetch cancelled because the tab timestamp has changed.')
    }
}
function injectMfaCode(tabId, mfaCode) {
    googleAnalytics.fireEvent('injectMfaCode')
    chrome.scripting.executeScript({
        target: { tabId },
        func: scripting.mongodb.fillMfaCode,
        args: [mfaCode]
    })
}
function injectListener(tabId) {
    const timestamp = Date.now()

    chrome.scripting.executeScript({
        target: { tabId },
        func: scripting.mongodb.waitForAuth,
    })
    cache.injected[tabId] = timestamp
}
async function getAuthTokenNonChrome() {
    const { client_id: clientId, scopes } = await chrome.runtime.getManifest().oauth2

    if (settings.method === 'refreshToken') {
        const { refreshToken, accessToken, tokenExpiry } = await getStoredTokens()

        if (accessToken && isTokenValid(tokenExpiry)) {
            googleAnalytics.fireEvent('accessTokenReuse', { tokenExpiry })
            return accessToken
        } else if (refreshToken) {
            // If refresh token exists and is still valid, use it to get a new access token
            googleAnalytics.fireEvent('refreshTokenReuse')
            const accessToken = await getAccessTokenUsingRefreshToken({ clientId, refreshToken })
            return accessToken
        } else {
            // Otherwise, obtain a new refresh token and access token
            googleAnalytics.fireEvent('newRefreshToken')
            const accessToken = await getNewRefreshTokenAndAccessToken({ clientId, scopes })
            return accessToken
        }
    }
    googleAnalytics.fireEvent('newAccessToken')
    return getAccessToken({ clientId, scopes })
}
async function getStoredTokens() {
    // Retrieve tokens and expiry time from localStorage
    return new Promise(resolve => {
        chrome.storage.local.get(['refreshToken', 'accessToken', 'tokenExpiry'], result => {
            const { refreshToken, accessToken, tokenExpiry } = result
            resolve({ refreshToken, accessToken, tokenExpiry })
        })
    })
}
function isTokenValid(tokenExpiry) {
    // Check if the token expiry time is in the future
    return tokenExpiry > new Date().getTime()
}
async function getAccessTokenUsingRefreshToken({ clientId, scopes, refreshToken }) {
    const tokenResponse = await fetch('https://black-cell-45d3.inprogress.workers.dev/api/v1/oauth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: clientId,
            grant_type: 'refresh_token'
        }),
    }).then(res => res.json())

    if (!tokenResponse.success) {
        console.error('Failed to refresh access token:', tokenResponse)
        return getNewRefreshTokenAndAccessToken({ clientId, scopes })
    }

    const { access_token: accessToken, expires_in: expiresIn } = tokenResponse.data
    const tokenExpiry = new Date().getTime() + expiresIn * 1000 // Expiry time in milliseconds

    // Store the new access token (refresh token remains unchanged)
    await chrome.storage.local.set({ accessToken, tokenExpiry })

    return accessToken
}
async function getAccessToken({ clientId, scopes }) {
    const authUrl = 'https://accounts.google.com/o/oauth2/auth'
    const urlParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: (chrome || browser).identity.getRedirectURL(),
        scope: scopes,
        response_type: 'token',
    })
    const response = await (chrome || browser).identity.launchWebAuthFlow({
        interactive: true,
        url: `${authUrl}?${urlParams.toString()}`
    })

    const token = new URL(response).hash.match(/access_token=([^&]*)/)[1]
    return token
}
async function getNewRefreshTokenAndAccessToken({ clientId, scopes }) {
    const authUrl = 'https://accounts.google.com/o/oauth2/auth'
    const urlParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: (chrome || browser).identity.getRedirectURL(),
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent',
        response_type: 'code',
    })
    const response = await (chrome || browser).identity.launchWebAuthFlow({
        interactive: true,
        url: `${authUrl}?${urlParams.toString()}`
    })

    const authorizationCode = new URL(response).searchParams.get('code')

    // Exchange authorization code for access and refresh tokens
    const tokenResponse = await fetch('https://black-cell-45d3.inprogress.workers.dev/api/v1/oauth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: authorizationCode,
            client_id: clientId,
            redirect_uri: (chrome || browser).identity.getRedirectURL(),
            grant_type: 'authorization_code',
        }),
    }).then(res => res.json())

    if (!tokenResponse.success) return
    const { access_token: accessToken, expires_in: expiresIn, refresh_token: refreshToken } = tokenResponse.data
    const tokenExpiry = new Date().getTime() + expiresIn * 1000 // Expiry time in milliseconds

    // Store access and refresh tokens and expiry time
    await chrome.storage.local.set({ accessToken, tokenExpiry, refreshToken })

    return accessToken
}
async function getAuthToken() {
    try {
        if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
            // Chrome or compatible browsers
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: true }, token => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError)
                    } else {
                        resolve(token)
                    }
                })
            })
            return token
        } else {
            return await getAuthTokenNonChrome()
        }
    } catch (error) {
        if (/This API is not supported on Microsoft Edge/i.test(error?.message)) {
            return await getAuthTokenNonChrome()
        }
        console.error('Error fetching OAuth2 token:', error)
    }
}
async function autofill(tabId, fromEmail, subjectQuery, afterTimestamp) {
    let message

    if (settings.method !== 'mfaPlusEmail') {
        const token = await getAuthToken()
        message = await fetchMessageFromGmail(tabId, token, fromEmail, subjectQuery, afterTimestamp)
    } else if (settings.method === 'mfaPlusEmail') {
        // fetch from backend feature to be added so users can just forward to a provided secure random email
        const { mfaPlusEmail: toEmail } = await chrome.storage.local.get('mfaPlusEmail')
        message = await fetchMessageFromBackend(tabId, toEmail, fromEmail, subjectQuery, afterTimestamp)
    }

    if (!message) return
    // parse the code from the message
    const code = extractVerificationCode(message)
    // inject the code into the page
    injectMfaCode(tabId, code)
    googleAnalytics.fireEvent('autofill')
}
chrome.webNavigation.onBeforeNavigate.addListener(details => {
    const { url, tabId } = details

    // inject into the frame and continue to poll gmail for the mfa email code
    if (url.match('https://account.mongodb.com/account/security/mfa')) {
        // autofill(tabId, 'mongodb-account@mongodb.com', 'One-time verification code', Math.floor(Date.now() / 1000))
        setTimeout(() => injectListener(tabId), 1000)
    }
}, {
    url: [
        { urlMatches: 'https:\/\/account.mongodb.com\/account\/security\/mfa' },
    ]
})
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.type) {
        case 'getSettings': settings.get(settings).then(sendResponse(settings))
            break
        case 'updateSetting':
            await settings.set({ [Object.keys(message.setting)[0]]: Object.values(message.setting)[0] })
            break
        case 'auth':
            if (sender.tab.url.match('https://account.mongodb.com/account/security/mfa')) {
                autofill(sender.tab.id, 'mongodb-account@mongodb.com', 'One-time verification code', Math.floor((Date.now() / 1000) - 30))
                const window = (await chrome.windows.getAll({
                    windowTypes: ['popup'],
                    populate: true
                })).find(window => {
                    return window.tabs.find(tab => tab.url.match('june07.com/mfa'))
                })
                if (window) {
                    chrome.windows.remove(window.id)
                }
                if (chrome.system?.display) {
                    chrome.system.display.getInfo((displays) => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message)
                            return
                        }

                        // Assuming the primary display is the one to center the window on
                        const display = displays.find(d => d.isPrimary) || displays[0]

                        // Desired window dimensions
                        const windowWidth = 1280
                        const windowHeight = 1024

                        // Calculate positions to center the window
                        const left = Math.round((display.workArea.width - windowWidth) / 2) + display.workArea.left
                        const top = Math.round((display.workArea.height - windowHeight) / 2) + display.workArea.top

                        // Create the centered window
                        chrome.windows.create({
                            url: 'https://june07.com/mfa',
                            type: 'popup',
                            width: windowWidth,
                            height: windowHeight,
                            left: left,
                            top: top,
                            focused: true
                        })
                    })
                } else {
                    // Fallback for Firefox or other browsers
                    const screenWidth = window.screen.availWidth
                    const screenHeight = window.screen.availHeight

                    // Calculate positions to center the window
                    const left = Math.round((screenWidth - windowWidth) / 2)
                    const top = Math.round((screenHeight - windowHeight) / 2)

                    // Create the centered window
                    browser.windows.create({
                        url: url,
                        type: 'popup',
                        width: windowWidth,
                        height: windowHeight,
                        left: left,
                        top: top,
                        focused: true
                    })
                }
            }
            break
    }
    sendResponse({ success: true })
})