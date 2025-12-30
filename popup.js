// Popup script
let isHighlightingEnabled = false;
let currentStats = null; // Store current stats for report generation

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  
  // Setup event listeners
  document.getElementById('highlightBtn').addEventListener('click', toggleHighlight);
  document.getElementById('refreshBtn').addEventListener('click', refreshAnalysis);
  document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
});

async function loadStats() {
  try {
    showLoading();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStats' });
    
    if (response) {
      displayStats(response);
      showContent();
    } else {
      showError();
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    showError();
  }
}

function displayStats(stats) {
  // Store stats for report generation
  currentStats = stats;
  
  // Update percentages
  document.getElementById('ssrPercentage').textContent = `${stats.ssrPercentage}%`;
  document.getElementById('csrPercentage').textContent = `${stats.csrPercentage}%`;
  
  // Update counts
  document.getElementById('ssrCount').textContent = `${stats.ssrCount} elements`;
  document.getElementById('csrCount').textContent = `${stats.csrCount} elements`;
  
  // Update total
  document.getElementById('totalElements').textContent = stats.total.toLocaleString();
  
  // Update HTML size
  const sizeInKB = (stats.initialHTMLSize / 1024).toFixed(2);
  document.getElementById('htmlSize').textContent = `${sizeInKB} KB`;
  
  // Update chart bars
  document.getElementById('ssrBar').style.width = `${stats.ssrPercentage}%`;
  document.getElementById('csrBar').style.width = `${stats.csrPercentage}%`;
  
  // Show chart percentages if significant
  if (parseFloat(stats.ssrPercentage) > 10) {
    document.getElementById('ssrBar').textContent = `${stats.ssrPercentage}%`;
  }
  if (parseFloat(stats.csrPercentage) > 10) {
    document.getElementById('csrBar').textContent = `${stats.csrPercentage}%`;
  }
  
  // Update frameworks
  if (stats.frameworks && stats.frameworks.length > 0) {
    document.getElementById('frameworkRow').style.display = 'flex';
    document.getElementById('frameworks').textContent = stats.frameworks.join(', ');
  }
  
  // Update performance metrics
  if (stats.metrics) {
    document.getElementById('performanceSection').style.display = 'block';
    document.getElementById('domInteractive').textContent = `${stats.metrics.domInteractive}ms`;
    document.getElementById('domContentLoaded').textContent = `${stats.metrics.domContentLoaded}ms`;
    document.getElementById('loadComplete').textContent = `${stats.metrics.loadComplete}ms`;
  }
  
  // Update analysis summary
  updateAnalysisSummary(stats);
}

function updateAnalysisSummary(stats) {
  const ssrPercent = parseFloat(stats.ssrPercentage);
  
  // You can add insights based on the analysis
  let renderStrategy = '';
  if (ssrPercent > 80) {
    renderStrategy = 'Primarily SSR';
  } else if (ssrPercent > 50) {
    renderStrategy = 'Hybrid (SSR + CSR)';
  } else if (ssrPercent > 20) {
    renderStrategy = 'Hybrid (CSR-heavy)';
  } else {
    renderStrategy = 'Primarily CSR';
  }
  
  // Store for potential display
  console.log('Render Strategy:', renderStrategy);
}

async function toggleHighlight() {
  try {
    isHighlightingEnabled = !isHighlightingEnabled;
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, { 
      action: 'toggleHighlight', 
      enabled: isHighlightingEnabled 
    });
    
    // Update button text
    const btn = document.getElementById('highlightBtn');
    const text = document.getElementById('highlightText');
    
    if (isHighlightingEnabled) {
      text.textContent = 'Disable Highlighting';
      btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else {
      text.textContent = 'Enable Highlighting';
      btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  } catch (error) {
    console.error('Error toggling highlight:', error);
  }
}

async function refreshAnalysis() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.style.opacity = '0.6';
  
  await loadStats();
  
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 500);
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');
}

function showContent() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
}

function showError() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
}

async function downloadReport() {
  if (!currentStats) {
    alert('No data available. Please refresh the analysis.');
    return;
  }

  const btn = document.getElementById('downloadReportBtn');
  btn.disabled = true;
  btn.style.opacity = '0.6';

  try {
    const report = generateReport(currentStats);
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssr-csr-report-${formatDateForFilename()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success feedback
    const originalText = btn.querySelector('span').textContent;
    btn.querySelector('span').textContent = '✓ Downloaded!';
    setTimeout(() => {
      btn.querySelector('span').textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }, 2000);
  } catch (error) {
    console.error('Error downloading report:', error);
    alert('Failed to download report. Please try again.');
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function formatDateForFilename() {
  const now = new Date();
  return now.toISOString().split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '-');
}

function generateReport(stats) {
  const ssrPercent = parseFloat(stats.ssrPercentage);
  let renderStrategy = '';
  let recommendation = '';
  
  if (ssrPercent > 80) {
    renderStrategy = 'Primarily Server-Side Rendered';
    recommendation = 'Excellent for SEO and initial page load performance. Consider adding client-side interactivity where needed.';
  } else if (ssrPercent > 50) {
    renderStrategy = 'Hybrid (SSR-heavy)';
    recommendation = 'Good balance between SEO and interactivity. Monitor performance metrics to ensure optimal user experience.';
  } else if (ssrPercent > 20) {
    renderStrategy = 'Hybrid (CSR-heavy)';
    recommendation = 'Consider moving critical content to SSR for better SEO and initial render performance.';
  } else {
    renderStrategy = 'Primarily Client-Side Rendered';
    recommendation = 'Consider implementing SSR for critical content to improve SEO and initial page load. Consider frameworks like Next.js or Nuxt.js.';
  }

  const url = new URL(stats.url);
  const sizeInKB = (stats.initialHTMLSize / 1024).toFixed(2);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSR/CSR Audit Report - ${url.hostname}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 8px;
        }
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section:last-child {
            margin-bottom: 0;
        }
        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #667eea;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            border: 2px solid #e2e8f0;
        }
        .stat-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 36px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
        }
        .stat-subtitle {
            font-size: 14px;
            color: #64748b;
        }
        .stat-card.ssr .stat-value {
            color: #22c55e;
        }
        .stat-card.csr .stat-value {
            color: #3b82f6;
        }
        .chart-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .chart-bar {
            height: 50px;
            display: flex;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .chart-fill {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            color: white;
            transition: width 0.3s ease;
        }
        .ssr-fill {
            background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
        }
        .csr-fill {
            background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
        }
        .chart-legend {
            display: flex;
            justify-content: center;
            gap: 30px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
        .legend-color.ssr {
            background: #22c55e;
        }
        .legend-color.csr {
            background: #3b82f6;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        .info-table tr:last-child {
            border-bottom: none;
        }
        .info-table td {
            padding: 16px 0;
        }
        .info-table td:first-child {
            font-weight: 600;
            color: #64748b;
            width: 40%;
        }
        .info-table td:last-child {
            color: #1e293b;
        }
        .recommendation-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .recommendation-box h3 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .recommendation-box p {
            color: #78350f;
            line-height: 1.6;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.excellent {
            background: #dcfce7;
            color: #166534;
        }
        .badge.good {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge.warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge.poor {
            background: #fee2e2;
            color: #991b1b;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer strong {
            color: #1e293b;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 SSR/CSR Audit Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <!-- Summary Section -->
            <div class="section">
                <h2>Executive Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card ssr">
                        <div class="stat-label">Server-Side Rendered</div>
                        <div class="stat-value">${stats.ssrPercentage}%</div>
                        <div class="stat-subtitle">${stats.ssrCount.toLocaleString()} elements</div>
                    </div>
                    <div class="stat-card csr">
                        <div class="stat-label">Client-Side Rendered</div>
                        <div class="stat-value">${stats.csrPercentage}%</div>
                        <div class="stat-subtitle">${stats.csrCount.toLocaleString()} elements</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Elements</div>
                        <div class="stat-value">${stats.total.toLocaleString()}</div>
                        <div class="stat-subtitle">Analyzed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Initial HTML Size</div>
                        <div class="stat-value">${sizeInKB}</div>
                        <div class="stat-subtitle">KB</div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-bar">
                        <div class="chart-fill ssr-fill" style="width: ${stats.ssrPercentage}%;">
                            ${parseFloat(stats.ssrPercentage) > 15 ? stats.ssrPercentage + '%' : ''}
                        </div>
                        <div class="chart-fill csr-fill" style="width: ${stats.csrPercentage}%;">
                            ${parseFloat(stats.csrPercentage) > 15 ? stats.csrPercentage + '%' : ''}
                        </div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <div class="legend-color ssr"></div>
                            <span>Server-Side Rendered</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color csr"></div>
                            <span>Client-Side Rendered</span>
                        </div>
                    </div>
                </div>
                
                <p><strong>Rendering Strategy:</strong> ${renderStrategy} ${getBadge(ssrPercent)}</p>
            </div>
            
            <!-- Page Details Section -->
            <div class="section">
                <h2>Page Details</h2>
                <table class="info-table">
                    <tr>
                        <td>URL</td>
                        <td><a href="${stats.url}" target="_blank">${stats.url}</a></td>
                    </tr>
                    <tr>
                        <td>Domain</td>
                        <td>${url.hostname}</td>
                    </tr>
                    <tr>
                        <td>Analysis Date</td>
                        <td>${new Date().toLocaleString()}</td>
                    </tr>
                    ${stats.frameworks && stats.frameworks.length > 0 ? `
                    <tr>
                        <td>Detected Frameworks</td>
                        <td>${stats.frameworks.join(', ')}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            ${stats.metrics ? `
            <!-- Performance Metrics Section -->
            <div class="section">
                <h2>Performance Metrics</h2>
                <table class="info-table">
                    <tr>
                        <td>DOM Interactive</td>
                        <td>${stats.metrics.domInteractive}ms ${getPerformanceBadge(stats.metrics.domInteractive, 1000)}</td>
                    </tr>
                    <tr>
                        <td>DOM Content Loaded</td>
                        <td>${stats.metrics.domContentLoaded}ms ${getPerformanceBadge(stats.metrics.domContentLoaded, 1500)}</td>
                    </tr>
                    <tr>
                        <td>Load Complete</td>
                        <td>${stats.metrics.loadComplete}ms ${getPerformanceBadge(stats.metrics.loadComplete, 3000)}</td>
                    </tr>
                </table>
            </div>
            ` : ''}
            
            <!-- Analysis & Recommendations Section -->
            <div class="section">
                <h2>Analysis & Recommendations</h2>
                <p style="margin-bottom: 20px;">Based on the analysis of your page's rendering strategy, here are our findings:</p>
                
                <div class="recommendation-box">
                    <h3>💡 Recommendation</h3>
                    <p>${recommendation}</p>
                </div>
                
                <h3 style="margin-top: 30px; margin-bottom: 15px; color: #1e293b;">Key Insights:</h3>
                <ul style="margin-left: 20px; color: #64748b; line-height: 2;">
                    <li><strong>SEO Impact:</strong> ${ssrPercent > 60 ? 'Good - Most content is server-rendered and visible to search engines.' : ssrPercent > 30 ? 'Moderate - Some content may not be indexed by search engines.' : 'Poor - Most content requires JavaScript to render, which may impact SEO.'}</li>
                    <li><strong>Initial Load:</strong> ${ssrPercent > 60 ? 'Fast - Users see content quickly as it\'s server-rendered.' : ssrPercent > 30 ? 'Medium - Users see some content immediately, rest loads dynamically.' : 'Slow - Users must wait for JavaScript to render most content.'}</li>
                    <li><strong>Interactivity:</strong> ${parseFloat(stats.csrPercentage) > 40 ? 'High - Significant client-side functionality for rich user experience.' : 'Low to Medium - Limited client-side interactivity.'}</li>
                </ul>
            </div>
            
            <!-- Understanding SSR vs CSR Section -->
            <div class="section">
                <h2>Understanding SSR vs CSR</h2>
                
                <h3 style="margin-bottom: 10px; color: #1e293b;">Server-Side Rendering (SSR)</h3>
                <p style="margin-bottom: 20px; color: #64748b;">Content rendered on the server and included in the initial HTML response. Better for SEO, faster first paint, works without JavaScript.</p>
                
                <h3 style="margin-bottom: 10px; color: #1e293b;">Client-Side Rendering (CSR)</h3>
                <p style="margin-bottom: 20px; color: #64748b;">Content rendered by JavaScript after page load. Better for interactivity, reduces server load, enables rich user experiences.</p>
                
                <h3 style="margin-bottom: 10px; color: #1e293b;">Hybrid Approach (Recommended)</h3>
                <p style="color: #64748b;">Modern frameworks like Next.js, Nuxt.js, and SvelteKit enable a hybrid approach: SSR for initial content and SEO, CSR for dynamic features and interactivity.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>SSR/CSR Auditor</strong> - Developed by Jose Fontanez</p>
            <p style="margin-top: 8px; font-size: 12px;">This report was automatically generated by the SSR/CSR Auditor Chrome Extension</p>
        </div>
    </div>
</body>
</html>`;
}

function getBadge(ssrPercent) {
  if (ssrPercent > 80) return '<span class="badge excellent">Excellent</span>';
  if (ssrPercent > 50) return '<span class="badge good">Good</span>';
  if (ssrPercent > 20) return '<span class="badge warning">Needs Improvement</span>';
  return '<span class="badge poor">Poor</span>';
}

function getPerformanceBadge(value, threshold) {
  if (value < threshold) return '<span class="badge excellent">Good</span>';
  if (value < threshold * 1.5) return '<span class="badge warning">Fair</span>';
  return '<span class="badge poor">Slow</span>';
}
