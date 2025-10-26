# Visual Editor User Guide - Point and Ask Workflow

**For Non-Technical Users**

Welcome to Mundo Tango's Visual Editor! This guide will show you how to make changes to your website by simply pointing at elements and chatting with Mr Blue AI.

---

## 🎯 What is "Point and Ask"?

"Point and Ask" means you can:
1. **Point** at any element on your website (text, button, image, etc.)
2. **Ask** Mr Blue to make changes using natural language
3. **See** a preview of the changes
4. **Save** all changes to GitHub with one click

No coding required!

---

## 🚀 Getting Started

### Step 1: Open Visual Editor

1. Navigate to any page on your site
2. Add `?edit=true` to the URL, or click the **Visual Editor** button
3. You'll see the Visual Editor sidebar appear on the right

### Step 2: Enable Inspector Mode

1. In the Visual Editor sidebar, click the **Inspector** tab
2. You'll see two modes:
   - **Page Mode**: Select elements on the main page
   - **Sidebar Mode**: Select elements in the sidebar
3. Click **Page Mode** to start

---

## 🖱️ How to Select Elements

There are two ways to select an element:

### Method 1: Simple Click (Recommended for Beginners)
- **Hover** over any element - it will highlight with a blue outline
- **Click** the element to select it
- The Inspector Panel will show the element's details

### Method 2: Cmd+Click (Advanced)
- Hold **Cmd** (Mac) or **Ctrl** (Windows)
- **Click** the element
- This allows you to select nested elements more precisely

**Example:**
```
"I want to change the color of the Login button"

1. Hover over the Login button → it highlights
2. Click it → Inspector shows "button" selected
3. Ready to make changes!
```

---

## 💬 Talking to Mr Blue

Once you've selected an element, switch to the **AI** tab and chat naturally:

### Simple Examples:

**Change Colors:**
```
"Make this button blue"
"Change the background to teal"
"Use a darker shade of gray for the text"
```

**Adjust Sizes:**
```
"Make this heading bigger"
"Reduce the padding around this card"
"Make the font size 18px"
```

**Edit Text:**
```
"Change the text to 'Get Started'"
"Make this say 'Welcome to Mundo Tango'"
```

**Layout Changes:**
```
"Center this element"
"Move this to the right side"
"Add more space between these sections"
```

### Advanced Examples:

**Multiple Changes:**
```
"Make this button larger, blue, and add a shadow effect"
```

**Responsive Design:**
```
"Hide this element on mobile devices"
"Make the sidebar stack vertically on tablets"
```

---

## 👁️ Preview Your Changes

After Mr Blue generates the code:

1. Click **Apply Changes** button
2. The preview will update in real-time
3. Switch to the **Preview** tab to see different device sizes:
   - 📱 Mobile
   - 📱 Tablet  
   - 🖥️ Desktop

**Not happy with the result?**
- Click the **Undo** button
- Try a different description
- Mr Blue will remember your selected element

---

## 💾 Saving Changes

When you're happy with all your changes:

1. Click the **SAVE** button (top-right corner)
2. All changes are committed to GitHub automatically
3. You'll see a success message with the commit hash

**What happens behind the scenes:**
- All code changes are batched together
- One Git commit is created
- Changes are deployed automatically
- You get a backup in case you need to rollback

---

## 🛟 Common Scenarios

### Scenario 1: "I want to change the hero section background"

1. Enable Visual Editor (`?edit=true`)
2. Click the **Inspector** tab → **Page Mode**
3. Click on the hero section background
4. Switch to **AI** tab
5. Type: "Change the background to a teal gradient"
6. Click **Generate Code**
7. Review the preview → Click **Apply Changes**
8. Click **SAVE** when done

### Scenario 2: "I want to make all buttons look consistent"

1. Select the first button
2. Tell Mr Blue: "Make this button teal with white text, rounded corners, and a subtle shadow"
3. Apply the changes
4. Select the second button
5. Tell Mr Blue: "Make this look exactly like the previous button"
6. Repeat for all buttons
7. Click **SAVE**

### Scenario 3: "I broke something and want to undo it"

**Option A: Undo Recent Change**
- Click the **Undo** button in the Visual Editor

**Option B: Rollback to Previous Version**
- Click the **Git** tab
- View the commit history
- Click **Rollback** on the last working version

---

## ⚠️ Safety Features

### High-Risk Operations Require Approval

Some changes need admin approval for safety:
- Deleting files
- Changing configuration files
- Running database migrations

**What you'll see:**
1. A modal appears: "This operation requires approval"
2. Shows the risk level (🟡 Medium, 🟠 High, 🔴 Critical)
3. Admin reviews and approves/rejects
4. You get notified of the decision

### Audit Trail

All actions are logged:
- What was changed
- Who made the change
- When it happened
- Whether it was approved

Admins can view the full audit trail in the **Console** tab.

---

## 🎨 Best Practices

### 1. Start Small
- Make one change at a time
- Preview before saving
- Save frequently

### 2. Be Specific
**Good:** "Make the Login button 20% larger and blue"  
**Bad:** "Make it better"

### 3. Use the Preview
- Check Mobile, Tablet, and Desktop views
- Make sure changes look good on all devices

### 4. Save Regularly
- Don't accumulate too many changes before saving
- Each save creates a restore point

### 5. Ask Questions
Mr Blue can explain things:
- "What does this element do?"
- "Why is this button not centered?"
- "How do I make this responsive?"

---

## 🆘 Troubleshooting

### "I clicked but nothing was selected"
- Make sure Inspector Mode is enabled
- Check that you're in the correct mode (Page vs Sidebar)
- Try Cmd+Click instead of regular click

### "Mr Blue didn't understand my request"
- Be more specific about what you want
- Use simpler language
- Break complex requests into smaller steps

### "The preview looks wrong"
- Try refreshing the preview (click the refresh icon)
- Clear your browser cache
- Check the Console tab for errors

### "I can't save my changes"
- Make sure you have network connection
- Check that you're logged in
- Contact support if the problem persists

---

## 📚 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Click` | Select nested element |
| `Esc` | Deselect current element |
| `Cmd/Ctrl + Z` | Undo last change |
| `Cmd/Ctrl + S` | Save all changes |
| `Cmd/Ctrl + K` | Open command palette |

---

## 🎓 Video Tutorials

Coming soon:
- [ ] "Your First Edit" (5 min)
- [ ] "Advanced Techniques" (10 min)
- [ ] "Troubleshooting Common Issues" (8 min)

---

## 💡 Tips from the Community

> **Elena (Tango Instructor):** "I use the Visual Editor to update event photos every week. It takes me 2 minutes instead of calling my web developer!"

> **Carlos (Studio Owner):** "The best feature is the Preview on mobile. I can make sure everything looks perfect on phones before publishing."

> **Sofia (Community Manager):** "I love that I can just describe what I want in plain English. No code knowledge needed!"

---

## 🔗 Related Resources

- [Mundo Tango Help Center](https://help.mundotango.life)
- [Mr Blue AI Guide](./MR_BLUE_USER_GUIDE.md)
- [Community Forum](https://community.mundotango.life)

---

**Need Help?**

- Chat with Mr Blue: Click the 🔵 icon
- Email: support@mundotango.life
- Community: community.mundotango.life

---

*Last Updated: October 26, 2025*  
*Version: 1.0 (MB.MD Phase 3)*
