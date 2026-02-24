# GitHub Pages Deployment Guide

## Quick Start

1. **Update package.json** - Replace `yourusername` with your GitHub username in the `homepage` field

2. **Deploy via GitHub Actions** (Recommended):
   - The workflow `.github/workflows/deploy.yml` is already configured
   - Push your code to the `main` branch
   - Go to GitHub repository Settings → Pages → Select "github-pages" branch and `/ (root)` folder
   - Wait for the workflow to complete (usually 2-5 minutes)

3. **Manual Deployment**:
```bash
# Install dependencies
npm install

# Run the scraper to get latest data
npm run scrape

# Build and export static files
npm run export

# Deploy the 'out' folder to GitHub Pages
# You can use:
# - GitHub Actions (recommended)
# - git subtree push: git subtree push --prefix out origin gh-pages
# - Or manually upload the 'out' folder contents
```

## What Was Added

### Configuration Changes
- **next.config.js**: Added `output: 'export'` for static site generation
- **package.json**: Added `homepage` URL and `export` script
- **.gitignore**: Added `out/` and `build/` to ignore generated files

### GitHub Actions Workflow
- `.github/workflows/deploy.yml`: Automatic deployment on push to main branch
- Handles: Checkout → Setup Node → Install deps → Run scraper → Build → Export → Deploy

### Static Site Files
- `.nojekyll`: Required for GitHub Pages (prevents Jekyll processing)

## After Deployment

1. Update your repo URL in `package.json`:
   ```json
   "homepage": "https://your-username.github.io/your-repo-name"
   ```

2. Enable GitHub Pages in repository Settings → Pages

3. (Optional) Add custom domain in GitHub Pages Settings

## Known Constraints

- **Static export**: All pages are pre-rendered at build time. The home page uses 'overall' ranking mode by default.
- **Search functionality**: Fully dynamic and works via client-side JavaScript
- **Data freshness**: Scraping runs at build time. For real-time data, consider using Vercel instead.

## Troubleshooting

### "Route / couldn't be rendered statically"
- Fixed by removing dynamic searchParams and defaults to 'overall' mode

### 404 on model pages after deployment
- Ensure all model files are in the `out/models/` directory
- Check GitHub Pages is set to use `gh-pages` branch or `main` branch `/docs` folder

### Images/assets not loading
- Verify `next.config.js` has `unoptimized: true` for image optimization
