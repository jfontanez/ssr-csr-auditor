// Content script that runs on every page
let ssrElements = new Set();
let csrElements = new Set();
let initialHTML = '';
let isHighlighting = false;

// Capture initial HTML (SSR content)
if (document.readyState === 'loading') {
  initialHTML = document.documentElement.innerHTML;
} else {
  initialHTML = document.documentElement.innerHTML;
}

// Mark all initially present elements as SSR
function markInitialElements() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      ssrElements.add(node);
      node.setAttribute('data-render-type', 'ssr');
    }
  }
}

// Observe DOM mutations to detect CSR content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if this element was added after initial load
        if (!ssrElements.has(node)) {
          csrElements.add(node);
          node.setAttribute('data-render-type', 'csr');
          
          // Mark all children as CSR too
          const children = node.querySelectorAll('*');
          children.forEach(child => {
            if (!ssrElements.has(child)) {
              csrElements.add(child);
              child.setAttribute('data-render-type', 'csr');
            }
          });
        }
      }
    });
  });
});

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    markInitialElements();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  });
} else {
  markInitialElements();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

// Function to calculate statistics
function calculateStats() {
  const ssrCount = ssrElements.size;
  const csrCount = csrElements.size;
  const total = ssrCount + csrCount;
  
  const ssrPercentage = total > 0 ? ((ssrCount / total) * 100).toFixed(2) : 0;
  const csrPercentage = total > 0 ? ((csrCount / total) * 100).toFixed(2) : 0;
  
  // Detect hydration frameworks
  const frameworks = detectFrameworks();
  
  // Get performance metrics
  const metrics = getPerformanceMetrics();
  
  return {
    ssrCount,
    csrCount,
    total,
    ssrPercentage,
    csrPercentage,
    initialHTMLSize: new Blob([initialHTML]).size,
    frameworks,
    metrics,
    url: window.location.href
  };
}

// Detect frameworks and hydration patterns
function detectFrameworks() {
  const frameworks = [];
  
  if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('[data-reactid]')) {
    frameworks.push('React');
  }
  
  if (window.Vue || document.querySelector('[data-v-]') || document.querySelector('[data-vue-]')) {
    frameworks.push('Vue');
  }
  
  if (window.angular || document.querySelector('[ng-version]')) {
    frameworks.push('Angular');
  }
  
  if (window.next || document.querySelector('#__next')) {
    frameworks.push('Next.js');
  }
  
  if (window.__NUXT__ || document.querySelector('#__nuxt')) {
    frameworks.push('Nuxt.js');
  }
  
  if (document.querySelector('[data-svelte-h]')) {
    frameworks.push('SvelteKit');
  }
  
  return frameworks;
}

// Get performance metrics
function getPerformanceMetrics() {
  if (!window.performance) return null;
  
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation) return null;
  
  return {
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
    loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
    domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart)
  };
}

// Toggle highlighting
function toggleHighlighting(enable) {
  isHighlighting = enable;
  
  if (enable) {
    // Add styles
    let style = document.getElementById('ssr-csr-highlight-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ssr-csr-highlight-styles';
      style.textContent = `
        [data-render-type="ssr"] {
          outline: 2px solid rgba(34, 197, 94, 0.5) !important;
          background-color: rgba(34, 197, 94, 0.05) !important;
        }
        [data-render-type="csr"] {
          outline: 2px solid rgba(59, 130, 246, 0.5) !important;
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        [data-render-type="ssr"]:hover::before,
        [data-render-type="csr"]:hover::before {
          content: attr(data-render-type);
          position: absolute;
          background: black;
          color: white;
          padding: 2px 6px;
          font-size: 10px;
          border-radius: 3px;
          z-index: 999999;
          text-transform: uppercase;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    // Remove styles
    const style = document.getElementById('ssr-csr-highlight-styles');
    if (style) {
      style.remove();
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse(calculateStats());
  } else if (request.action === 'toggleHighlight') {
    toggleHighlighting(request.enabled);
    sendResponse({ success: true });
  }
  return true;
});
