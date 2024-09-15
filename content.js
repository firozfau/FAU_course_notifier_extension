// content.js

 
window.__contentScriptInjected = true;

console.log('Content script loaded.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);

    if (message.action === 'getUrls') {
        try {
            const urls = JSON.parse(localStorage.getItem('fau_urls')) || [];
            console.log('Sending URLs from content script:', urls);
            sendResponse({ urls: urls });
        } catch (error) {
            console.error('Error retrieving URLs from localStorage:', error);
            sendResponse({ urls: [] });
        }
        return true; 
    }
});
