(async function (scripting) {
    scripting.mongodb = {
        waitForAuth: function () {
            console.log('Waiting for auth...')

            let interval = setInterval(() => {
                console.log('Waiting for button...')
                const button = Array.from(document.querySelectorAll('button')).find(button => /send code/i.test(button.innerText))
                if (button) {
                    button.addEventListener('click', function () {
                        console.log('Sending auth message...')
                        chrome.runtime.sendMessage({ type: 'auth' })
                    })
                    clearInterval(interval)
                }
            }, 500)
        },
        fillMfaCode: function (code) {
            console.log('Filling MFA code...')
            const inputs = document.querySelectorAll('[data-testid="autoAdvanceInput"]')

            if (inputs.length !== 6) {
                console.error('Expected 6 input fields for the MFA code')
                return
            }

            for (let i = 0; i < code.length; i++) {
                if (inputs[i]) {
                    inputs[i].value = code[i]
                    // Trigger input event to simulate user input
                    inputs[i].dispatchEvent(new Event('input', { bubbles: true }))
                }
            }
        }
    }
})(typeof module !== 'undefined' && module.exports ? module.exports : (self.scripting = self.scripting || {}))