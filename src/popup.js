document.addEventListener('DOMContentLoaded', async function () {
    const settings = await getSettings()
    const settingSelect = document.getElementById('settingSelect')
    const emailAddressDiv = document.getElementById('mfaPlusEmailAddress')
    const tooltip = document.getElementById('tooltip')

    updateDisplay(settings)
    // Add event listener for mouseover
    emailAddressDiv.addEventListener('mouseover', function (event) {
        // Select the text content
        const textToCopy = event.target.textContent.trim()

        // Use Clipboard API to copy text
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Show tooltip on successful copy
                showTooltip(event)

                // Optionally, provide feedback to the user
                console.log('Text copied to clipboard:', textToCopy)
            })
            .catch(err => {
                console.error('Failed to copy text:', err)
            })
    })

    function showTooltip(event) {
        // Calculate tooltip position relative to mouse pointer
        const x = event.clientX
        const y = event.clientY
        tooltip.style.display = 'block'
        tooltip.style.left = `${x}px`
        tooltip.style.top = `${y}px`

        // Hide tooltip after 2 seconds (adjust as needed)
        setTimeout(() => {
            tooltip.style.display = 'none'
        }, 2000) // 2000 milliseconds = 2 seconds
    }

    const { mfaPlusEmail } = await chrome.storage.local.get('mfaPlusEmail')
    emailAddressDiv.innerText = mfaPlusEmail
    // Set the initial selected option based on stored settings
    settingSelect.value = settings.method

    settingSelect.addEventListener('change', async function () {
        await updateSetting({ [settingSelect.name]: settingSelect.value })
        setTimeout(updateDisplay, 100)
    })
})

async function updateDisplay(passedSettings) {
    const settings = passedSettings || await getSettings()
    document.getElementById('mfaPlusEmailDiv').style.display = settings.method === 'mfaPlusEmail' ? 'block' : 'none'
    document.getElementById('refreshTokenDiv').style.display = settings.method === 'refreshToken' ? 'block' : 'none'
    document.getElementById('accessTokenDiv').style.display = settings.method === 'accessToken' ? 'block' : 'none'
    console.log(settings.method === 'mfaPlusEmail' ? 'block' : 'none', settings.method === 'refreshToken' ? 'block' : 'none', settings.method === 'accessToken' ? 'block' : 'none')
    console.log(settings.method)
}

function getSettings() {
    return new Promise(resolve => {
        // Sending a message from popup to service worker or background script
        chrome.runtime.sendMessage({ type: 'getSettings' }, function (settings) {
            console.log('getSettings:', JSON.stringify(settings))
            resolve(settings)
        })
    })
}

async function updateSetting(setting) {
    return new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'updateSetting', setting }, function (response) {
            console.log('updateSetting:', response)
            resolve(response)
        })
    })
}