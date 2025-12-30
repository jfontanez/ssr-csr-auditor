# SSR/CSR Auditor Chrome Extension

**Developed by Jose Fontanez**

A powerful Chrome extension to audit and visualize Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) content on any webpage.

## 🌟 Features

### Core Features
- **Real-time Detection**: Automatically detects which elements are SSR vs CSR
- **Visual Highlighting**: Color-coded overlay showing SSR (green) and CSR (blue) elements
- **Percentage Breakdown**: Clear statistics showing the ratio of SSR to CSR content
- **Performance Metrics**: Displays DOM loading times and performance indicators
- **Framework Detection**: Automatically identifies React, Vue, Angular, Next.js, Nuxt.js, and SvelteKit

### Analytics
- **Element Count**: Total count of SSR vs CSR elements
- **Initial HTML Size**: Size of the server-rendered HTML
- **DOM Timing Metrics**: DOM Interactive, Content Loaded, and Load Complete times
- **Visual Chart**: Interactive bar chart showing rendering distribution

### Developer Tools
- **Interactive Highlighting**: Toggle visual highlighting on/off
- **Hover Details**: See render type on element hover
- **Real-time Updates**: Automatically tracks dynamic content additions
- **Refresh Analysis**: Re-analyze the page at any time
- **Download Summary Report**: Export a comprehensive HTML report with analysis and recommendations

## 📦 Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd ssr-csr-auditor
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `ssr-csr-auditor` folder

3. **Verify installation**
   - You should see the SSR/CSR Auditor icon in your extensions toolbar
   - If not visible, click the puzzle piece icon and pin it

### Creating Icons (Optional)

The extension includes placeholder icons. To create proper icons:

**Option 1: Use a design tool**
- Create PNG images at 16x16, 48x48, and 128x128 pixels
- Use the purple gradient theme (#667eea to #764ba2)
- Include "SR" or a search/analysis icon
- Save as `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder

**Option 2: Use ImageMagick** (if available)
```bash
cd icons
convert -size 128x128 xc:none -fill "#667eea" -draw "roundrectangle 10,10 118,118 20,20" -fill white -pointsize 60 -gravity center -annotate +0+0 "SR" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

## 🚀 Usage

### Basic Usage

1. **Navigate to any webpage** you want to analyze
2. **Click the extension icon** in your toolbar
3. **View the analysis** in the popup dashboard

### Understanding the Results

#### Percentage Breakdown
- **Green (SSR)**: Content that was rendered on the server and included in the initial HTML
- **Blue (CSR)**: Content that was added dynamically by JavaScript after page load

#### What the Numbers Mean
- **High SSR (>80%)**: Great for SEO, fast initial render, content visible to crawlers
- **Balanced (40-60%)**: Hybrid approach, initial content SSR with dynamic features
- **High CSR (>80%)**: Single-page app style, may need SEO considerations

### Visual Highlighting

1. Click **"Enable Highlighting"** in the popup
2. SSR elements will have a green outline and background tint
3. CSR elements will have a blue outline and background tint
4. Hover over any element to see its render type
5. Click **"Disable Highlighting"** to remove the overlay

### Download Summary Report

1. After analyzing a page, click **"Download Summary Report"**
2. An HTML report will be downloaded automatically
3. Open the report in any browser to view:
   - Executive summary with charts
   - Detailed statistics and metrics
   - Performance analysis
   - Recommendations for improvement
   - SEO and performance insights
4. Reports are timestamped and can be saved for future reference
5. Share reports with your team or clients

### Interpreting Performance Metrics

- **DOM Interactive**: Time until the DOM is ready for interaction
- **DOM Content Loaded**: Time until the DOM is fully loaded and parsed
- **Load Complete**: Time until all resources (images, etc.) are loaded

## 🎯 Use Cases

### For Developers
- **Debug SSR/CSR Issues**: Verify that your SSR setup is working correctly
- **Performance Optimization**: Identify CSR-heavy sections that could be moved to SSR
- **Framework Migration**: Track changes when migrating from CSR to SSR frameworks
- **Code Review**: Ensure critical content is server-rendered for SEO
- **Documentation**: Generate reports to document rendering architecture

### For SEO Specialists
- **Content Visibility**: Verify that important content is SSR for search engine crawlers
- **Competitor Analysis**: Analyze how competitors structure their rendering
- **Site Audits**: Quick assessment of rendering strategy across pages
- **Client Reports**: Download professional reports to share with clients

### For Product Managers
- **Performance Assessment**: Understand the rendering strategy of your product
- **Technical Debt**: Identify pages that may need SSR improvements
- **Competitive Research**: Compare rendering approaches across products
- **Stakeholder Communication**: Generate reports for non-technical stakeholders

## 🔍 How It Works

### Detection Algorithm

1. **Initial Capture**: When a page loads, the extension captures all elements in the initial DOM
2. **SSR Marking**: All initial elements are marked as Server-Side Rendered
3. **Mutation Observation**: A MutationObserver watches for new elements added to the DOM
4. **CSR Tracking**: Any element added after initial load is marked as Client-Side Rendered
5. **Statistical Analysis**: Calculates percentages and generates visualizations

### Framework Detection

The extension detects common frameworks by looking for:
- **React**: `window.React`, `data-reactroot`, `data-reactid` attributes
- **Vue**: `window.Vue`, `data-v-*` attributes
- **Angular**: `window.angular`, `ng-version` attributes
- **Next.js**: `window.next`, `#__next` element
- **Nuxt.js**: `window.__NUXT__`, `#__nuxt` element
- **SvelteKit**: `data-svelte-h` attributes

## 📊 Understanding SSR vs CSR

### Server-Side Rendering (SSR)
✅ **Pros:**
- Better SEO - content visible to search engines
- Faster first contentful paint
- Better performance on low-powered devices
- Works without JavaScript enabled

❌ **Cons:**
- Higher server load
- Slower time to interactive
- More complex deployment
- Higher hosting costs

### Client-Side Rendering (CSR)
✅ **Pros:**
- Lower server costs
- Rich interactive experiences
- Faster page transitions
- Easier deployment (static hosting)

❌ **Cons:**
- Slower initial load
- SEO challenges
- Requires JavaScript enabled
- Blank page until JS loads

### Hybrid Approach (Recommended)
The best modern apps use a hybrid approach:
- SSR for initial page load and critical content
- CSR for interactive features and dynamic updates
- Frameworks like Next.js, Nuxt.js, and SvelteKit make this easy

## 🛠️ Technical Details

### Files Structure
```
ssr-csr-auditor/
├── manifest.json          # Extension configuration
├── content.js            # Main detection logic
├── popup.html            # Extension popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

### Permissions Used
- `activeTab`: Access to the current active tab
- `scripting`: Inject content scripts
- `storage`: Store user preferences (future use)

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Any Chromium-based browser supporting Manifest V3

## 🔧 Development

### Adding New Features

The codebase is modular and easy to extend:

**To add new detection methods:**
Edit `content.js` and add to the `detectFrameworks()` function

**To add new metrics:**
Edit `content.js` in the `calculateStats()` function

**To modify the UI:**
Edit `popup.html` and `popup.css`

**To add new functionality:**
Edit `popup.js` for popup logic or `content.js` for page analysis

### Testing

Test on various types of websites:
- ✅ Static sites (all SSR)
- ✅ React SPAs (mostly CSR)
- ✅ Next.js apps (hybrid)
- ✅ WordPress sites (mostly SSR)
- ✅ Complex web applications

## 📝 Future Enhancements

Potential features for future versions:
- [x] Export analysis reports (HTML format)
- [ ] Export to JSON/CSV formats
- [ ] Historical tracking across page loads
- [ ] Comparison between pages
- [ ] Performance recommendations engine
- [ ] Lighthouse integration
- [ ] Custom element filtering
- [ ] Hydration timing detection
- [ ] Network waterfall analysis
- [ ] Batch analysis for multiple pages

## 🐛 Troubleshooting

**Extension doesn't show stats:**
- Refresh the page and try again
- Check if the page allows content scripts
- Some internal browser pages block extensions

**Highlighting doesn't work:**
- Click "Refresh Analysis" and try again
- Some websites with strict CSP policies may block styling

**Inaccurate percentages:**
- Very dynamic apps may have constantly changing ratios
- Click "Refresh Analysis" to update

**Framework not detected:**
- The framework may use a custom build or unusual configuration
- Detection is based on common patterns

## 📄 License

MIT License - feel free to modify and distribute

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or issues, please open an issue on the repository.

---

**Developed by Jose Fontanez**

**Built with ❤️ for developers who care about performance and SEO**
