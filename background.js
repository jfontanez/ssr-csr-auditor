// Background service worker for the extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('SSR/CSR Auditor extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // The popup will open automatically due to the action.default_popup in manifest
});

// Listen for tab updates to reset analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Page has finished loading
    console.log('Page loaded:', tab.url);
  }
});
