# Fix Commit Author - Step by Step

## Current Situation
You committed with the wrong GitHub account. Let's fix it!

## Step 1: Set Your Correct Git Identity

Replace with YOUR GitHub username and email:

```bash
git config user.name "Your GitHub Username"
git config user.email "your-email@example.com"
```

**Example:**
```bash
git config user.name "john-doe"
git config user.email "john.doe@gmail.com"
```

## Step 2: Amend the Last Commit

Change the author of the last commit:

```bash
git commit --amend --reset-author --no-edit
```

This will:
- Keep the same commit message
- Change the author to your current git config
- Reset the commit date

## Step 3: Verify the Change

Check that the author is now correct:

```bash
git log -1
```

You should see your name and email as the author.

## Step 4: Force Push (if already pushed)

**⚠️ WARNING: Only do this if you haven't pushed yet, or if you're the only one working on this repo!**

If you already pushed to GitHub and want to update it:

```bash
git push -f origin main
```

**OR if using master branch:**
```bash
git push -f origin master
```

## Alternative: Change Author for All Commits

If you have multiple commits to fix:

```bash
git rebase -i HEAD~N
# Replace N with number of commits
# Change 'pick' to 'edit' for commits you want to fix
# Then for each commit:
git commit --amend --reset-author --no-edit
git rebase --continue
```

## Quick Command Summary

```bash
# 1. Set your identity
git config user.name "Your Name"
git config user.email "your-email@example.com"

# 2. Fix the commit
git commit --amend --reset-author --no-edit

# 3. Verify
git log -1

# 4. Push (if needed)
git push -f origin main
```

## Important Notes

- ⚠️ **Force push** (`-f`) rewrites history - only use if you're sure!
- If others are working on this repo, coordinate with them first
- Your `.env` file is still safe (it's in .gitignore)

