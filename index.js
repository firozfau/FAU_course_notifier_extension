document.addEventListener('DOMContentLoaded', () => {
    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('studon-url');
    const errorMessage = document.getElementById('error-message');
    const urlList = document.getElementById('url-list');
    const addUrlButton = document.getElementById('add-url');

    // Load URLs from chrome.storage.local and display them
    const loadUrls = () => {
        chrome.storage.local.get('fau_urls', (result) => {
            const urls = result.fau_urls || [];

            // Render the list of URLs
            urlList.innerHTML = urls.map((url, index) =>
                `<span class="eachCourseSpan">
                    <a href="${url}" target="_blank">Course number ${index + 1}</a>
                    <button data-index="${index}" class="delete-url">Delete</button>
                </span>`
            ).join('');

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-url').forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.getAttribute('data-index');
                    deleteUrl(index);
                });
            });
        });
    };

    // Validate URL
    const isValidUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.pathname.endsWith('join.html');
        } catch (error) {
            return false; // Invalid URL
        }
    };

    // Check if URL already exists
    const urlExists = (url, urls) => {
        return urls.includes(url);
    };

    // Add URL to the list and chrome.storage.local
    const addUrl = (url) => {
        chrome.storage.local.get('fau_urls', (result) => {
            let urls = result.fau_urls || [];
            if (!urlExists(url, urls)) {
                urls.push(url);
                chrome.storage.local.set({ 'fau_urls': urls }, () => {
                    loadUrls();
                });
            }
        });
    };

    // Delete URL from the list and chrome.storage.local
    const deleteUrl = (index) => {
        chrome.storage.local.get('fau_urls', (result) => {
            let urls = result.fau_urls || [];
            if (index >= 0 && index < urls.length) {
                urls.splice(index, 1); // Remove the URL from the array
                chrome.storage.local.set({ 'fau_urls': urls }, () => {
                    loadUrls(); // Reload the list
                });
            }
        });
    };

    // Handle URL submission
    addUrlButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (isValidUrl(url)) {
            chrome.storage.local.get('fau_urls', (result) => {
                const urls = result.fau_urls || [];
                if (urlExists(url, urls)) {
                    errorMessage.textContent = 'URL already exists. Please provide a different course URL.';
                } else {
                    addUrl(url);
                    errorMessage.textContent = ''; // Clear any previous error message
                }
            });
        } else {
            errorMessage.textContent = 'Please provide a valid course URL.';
        }
        urlInput.value = ''; // Clear the input field
    });

    // Initial load of saved URLs
    loadUrls();
});
