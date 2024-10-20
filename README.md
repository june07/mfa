[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/chrome-web-store/v/jlbompidiohdlmfegemphbamnglbpajj.svg)](https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj)
[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/chrome-web-store/users/jlbompidiohdlmfegemphbamnglbpajj.svg)](https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj)
<!--
[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/chrome-web-store/rating/jlbompidiohdlmfegemphbamnglbpajj.svg)](https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj)
[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/chrome-web-store/stars/jlbompidiohdlmfegemphbamnglbpajj.svg)](https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj)
[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/chrome-web-store/rating-count/jlbompidiohdlmfegemphbamnglbpajj.svg)](https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj)
-->

[![https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/jlbompidiohdlmfegemphbamnglbpajj](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fienbackjagmcjnbjihogbjikdigpejml)](https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml)
[![https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml](https://img.shields.io/badge/dynamic/json?label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fienbackjagmcjnbjihogbjikdigpejml)](https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml)
[![https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml](https://img.shields.io/badge/dynamic/json?label=rating&query=%24.averageRating&suffix=%2F5&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fienbackjagmcjnbjihogbjikdigpejml)](https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml)
[![https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml](https://img.shields.io/badge/dynamic/json?label=ratings&query=%24.ratingCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fienbackjagmcjnbjihogbjikdigpejml)](https://microsoftedge.microsoft.com/addons/detail/ienbackjagmcjnbjihogbjikdigpejml)

[![https://addons.mozilla.org/en-US/firefox/addon/mfa](https://img.shields.io/amo/v/mfa.svg)](https://addons.mozilla.org/en-US/firefox/addon/mfa)
[![https://addons.mozilla.org/en-US/firefox/addon/mfa](https://img.shields.io/amo/users/mfa.svg)](https://addons.mozilla.org/en-US/firefox/addon/mfa)

![](https://raw.githubusercontent.com/june07/ghost-content/main/2024/06/screenshot-1.webp)

# MFA (Multi-Factor Authentication Assistant) Browser Extension

The MFA browser extension automates the retrieval and filling of MFA codes, streamlining the multi-factor authentication process.

## Overview

The MFA (Multi-Factor Authentication Assistant) browser extension simplifies the often-tedious process of multi-factor authentication. It automatically retrieves MFA codes from your email and fills them into authentication forms, eliminating manual steps such as clicking "Send Code", checking your email, and copying codes.

This extension was born out of the need to enhance productivity during development sessions, particularly when frequent re-authentication is required without compromising security.

## Key Features

- **Automated MFA Code Retrieval:** Fetches MFA codes securely from your specified Gmail account using OAuth.
- **Email Forwarding Compatibility:** Supports forwarding MFA emails to a less privileged email account or a secure hosted MFA email.
- **Client-Side Operation:** All operations are performed locally, ensuring your authentication credentials remain private.
- **Short-Term and Long-Term Authentication:** Maintains Google authentication for up to an hour; optional long-term authentication with Cloudflare Worker for extended offline access.
- **Open Source:** Transparency through open-source code, encouraging community contributions and ensuring security scrutiny.

![](https://raw.githubusercontent.com/june07/ghost-content/main/2024/07/screenshot-3.webp)

## How It Works

### Setup

1. **Installation:** Install the MFA extension from the Chrome Web Store, Edge-Addons, Firefox, or via GitHub releases (side-loaded).
   
2. **OAuth Authentication:** Grant read-only access to your Gmail account for retrieving MFA codes securely.

3. **Email Forwarding (Optional):** Configure email forwarding for added security or use the secure hosted email option.

### Usage

- **Automatic Code Retrieval:** When an MFA code is sent to your email, the extension automatically fetches and inputs it into the authentication form.
- **Session Maintenance:** Ensures seamless authentication with Google for continuous development workflows.

## Security

- **Client-Side Operation:** No backend server involvement ensures that your credentials are processed locally.
- **OAuth Read-Only Access:** Safeguards your Gmail account by restricting the extension to read-only operations.
- **Transparency:** The extension's open-source nature allows users to inspect and verify its security measures.

## Benefits

- **Time-Saving:** Eliminates manual handling of MFA codes, enhancing productivity.
- **Increased Security:** Reduces the risk of exposing MFA codes during manual entry.
- **Enhanced Productivity:** Ideal for developers and professionals needing frequent authentication.

![](https://raw.githubusercontent.com/june07/ghost-content/main/2024/06/screenshot-4.webp)

## Getting Started

1. **Install the Extension:** [Download from Chrome Web Store](https://chromewebstore.google.com/detail/mfa-multi-factor-authenti/jlbompidiohdlmfegemphbamnglbpajj?ref=blog.june07.com), [Edge-Addons](https://microsoftedge.microsoft.com/addons/detail/mfa-multi-factor-authent/ienbackjagmcjnbjihogbjikdigpejml), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/mfa/?ref=blog.june07.com), or [GitHub Releases](https://github.com/june07/mfa/releases).
   
2. **Configure Email Forwarding (Optional):** Set up forwarding to enhance security.
   
3. **Authorize Gmail Access:** Follow OAuth prompts to grant necessary permissions.

4. **Enjoy Seamless MFA:** Let the extension handle MFA code retrieval and input.

## Support and Contributions

For support, feedback, or to contribute to the project, visit our [GitHub repository](https://github.com/june07/mfa/issues). Your input helps us improve the extension for everyone.

## Conclusion

The MFA (Multi-Factor Authentication Assistant) browser extension offers a secure and efficient solution to streamline multi-factor authentication. With automated code retrieval and client-side operation, it enhances security while saving valuable time. Install it today and experience the convenience it brings to your development workflow.
