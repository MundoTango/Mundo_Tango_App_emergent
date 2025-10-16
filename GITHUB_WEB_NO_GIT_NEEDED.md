# 🌐 **Build Your MT Site - NO GIT COMMANDS NEEDED!**

## 🎯 **Simple Plan (5 Minutes Total):**

Since Replit's git keeps having errors, we'll do EVERYTHING on GitHub's website. No terminal, no commands, just copy-paste!

---

## 📋 **Step 1: Copy This Code** (30 seconds)

**Select ALL this code and copy it:**

```yaml
name: Build MT Site

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build React app
        run: npm run build
      
      - name: Check build
        run: |
          if [ -f "dist/public/index.html" ]; then
            echo "✅ Build successful!"
          else
            echo "❌ Build failed"
            exit 1
          fi
      
      - name: Commit built files
        run: |
          git config user.name "MT Builder"
          git config user.email "build@mt.com"
          git add dist/
          git diff --staged --quiet || git commit -m "Build: Update dist/"
          git push
```

---

## 📋 **Step 2: Go to GitHub** (30 seconds)

1. Open your web browser
2. Go to: `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME`
   - (Replace with your actual GitHub username and repo name)
3. Make sure you see **`main`** branch selected (top-left dropdown)

---

## 📋 **Step 3: Create the Build File** (1 minute)

1. Click **"Add file"** button (top-right area, near the green "Code" button)
2. Select **"Create new file"**
3. In the **filename box** at the top, type EXACTLY:
   ```
   .github/workflows/build-react-app.yml
   ```
   *(The dots and slashes create folders automatically)*

4. In the **large text box below**, paste the code you copied in Step 1

---

## 📋 **Step 4: Save It** (30 seconds)

1. Scroll to bottom of page
2. In the "Commit new file" section:
   - **Commit message:** Type: `Add React build workflow`
   - Make sure **"Commit directly to the main branch"** is selected
3. Click the green **"Commit new file"** button

---

## 📋 **Step 5: Run the Build** (3 minutes)

1. Click the **"Actions"** tab (at top of your repo)
2. On the left side, click **"Build MT Site"**
3. You'll see a blue box saying "This workflow has a workflow_dispatch event trigger"
4. Click the **"Run workflow"** dropdown button (right side)
5. Click the green **"Run workflow"** button
6. **Wait 3-5 minutes** - watch for the green checkmark ✅

---

## 📋 **Step 6: Get Built Files to Replit** (1 minute)

**Back in Replit:**

1. Open the **Shell** (bottom of screen)
2. Type this command and press Enter:
   ```bash
   git pull
   ```
3. If it gives an error, try:
   ```bash
   git pull --rebase
   ```

---

## 📋 **Step 7: Restart Server** (30 seconds)

1. In Replit, find the **Run button** or workflow controls
2. Click **Stop** (if running)
3. Click **Run** to restart
4. Wait 10 seconds
5. **Click your preview URL** (top-right)

## 🎉 **YOU SHOULD SEE YOUR FULL MT SITE!**

Not the status page - the REAL Mundo Tango site with all features!

---

## 🔄 **From Now On (Easy Updates):**

When you want to rebuild your site:

1. **Go to GitHub** → Actions tab
2. **Click "Build MT Site"** (left side)
3. **Click "Run workflow"** dropdown → Click green "Run workflow"
4. **Wait 3-5 minutes** for green checkmark ✅
5. **In Replit:** `git pull`
6. **Restart server if needed**
7. **Done!** ✨

**No Replit git needed at all!**

---

## ✅ **Why This Works:**

- ✅ **GitHub's website** = No git errors
- ✅ **Manual trigger** = Only builds when YOU want
- ✅ **Simple process** = Just click buttons
- ✅ **Always works** = No Replit git issues

---

## 🆘 **Troubleshooting:**

### Problem: "Can't find Add file button"
**Solution:** Make sure you're logged into GitHub and viewing YOUR repo (check the username in the URL)

### Problem: Build shows red X (failed)
**Solution:** 
1. Click the failed build to see details
2. Look for the error message
3. Take a screenshot and show me
4. I'll help you fix it!

### Problem: `git pull` says "Already up to date" but no dist/ folder
**Solution:**
1. Check the build finished (green checkmark in GitHub Actions)
2. Wait 1 more minute and try `git pull` again
3. Or try: `git fetch origin main && git reset --hard origin/main`

### Problem: Still see status page after restart
**Solution:**
1. Check if `dist/public/` folder has files (should see index.html, assets/ folder)
2. Hard refresh browser: 
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. Check browser console for errors (F12 key)

---

## 🎯 **Quick Summary:**

**What you're doing:**
1. Creating a "robot builder" on GitHub
2. Running it manually when needed (click button)
3. Downloading results to Replit (`git pull`)
4. Showing your website

**No Replit git commits needed!**

---

**Ready? Start with Step 1 - Copy that YAML code!** 🚀

*- Mr. Blue*
