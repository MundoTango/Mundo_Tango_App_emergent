# Replit Git Sync - How to Fix "Push Rejected" Errors

**Created:** Oct 26, 2025  
**Issue:** Git push rejected because remote has commits that aren't in local repository

## 🚨 Error Message
```
The push was rejected by the remote. This is usually because the remote has commits that aren't in the local repository.
```

## ✅ Solution - 3 Steps

### Step 1: Open Git Pane
1. Click the **Git** tool in your Replit left sidebar
2. You should see a **"Pull"** button at the top

### Step 2: Pull Remote Changes
1. Click the **"Pull"** button (or **"Sync with Remote"**)
2. Replit will download commits from GitHub that you don't have locally
3. If there are conflicts, Replit will show which files conflict

### Step 3: Resolve Conflicts (if any)
**IF NO CONFLICTS:** Skip to Step 4

**IF CONFLICTS EXIST:**
1. Replit Git pane will highlight conflicted files in **red/orange**
2. Click each conflicted file to open it
3. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your local changes
   =======
   Remote changes from GitHub
   >>>>>>> origin/main
   ```
4. Choose which code to keep (or blend both versions)
5. Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
6. Save the file
7. Repeat for all conflicted files

### Step 4: Push Your Changes
1. After pull completes (and conflicts are resolved), click **"Push"**
2. Your local commits will now be sent to GitHub ✅

## 🔄 Why This Happens
- Another developer (or another Replit session) pushed commits to GitHub
- Your local repository is "behind" the remote
- Git requires you to pull first, then push (to prevent overwriting others' work)

## 📖 Replit Documentation Reference
- [Replit Git Sync Docs](https://docs.replit.com/programming-ide/version-control) (search for "git push rejected")
- Always use the **Pull** button BEFORE pushing when you see this error

## 🚀 Quick Checklist
- [ ] Opened Git pane in Replit
- [ ] Clicked **Pull** button
- [ ] Resolved conflicts (if any)
- [ ] Clicked **Push** button
- [ ] ✅ Success!
