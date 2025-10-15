# Visual Editor User Guide
**Complete Guide for Life CEO Platform Visual Editing**  
**Version:** 1.0  
**Last Updated:** October 15, 2025  
**For:** Super Admins

---

## 🎯 What is the Visual Editor?

The Visual Editor is a Replit-style visual page editing system that lets you modify any page on the Life CEO platform **without writing code**. It uses AI to convert your visual changes into production-ready React and Tailwind CSS code, with full Git integration for safe deployment.

### Key Features
✅ **Click-to-select** any element on any page  
✅ **Drag & drop** to reposition elements visually  
✅ **AI-powered** code generation (OpenAI GPT-4o)  
✅ **Live preview** with shareable staging URLs  
✅ **Git workflow** - automatic branches, commits, PRs  
✅ **Mr Blue AI** - Your personal design assistant  
✅ **Undo/Redo** - Full change history  
✅ **Auto-testing** - Tests run before production deploy

---

## 🚀 Getting Started

### Step 1: Access Visual Editor
Navigate to **any page** and add `?edit=true` to the URL:

**Examples:**
- `/memories?edit=true` - Edit the Memories page
- `/groups?edit=true` - Edit the Groups page
- `/profile?edit=true` - Edit your Profile page
- `/housing-marketplace?edit=true` - Edit Housing page

### Step 2: Visual Editor Interface
You'll see a **split-screen interface**:

```
┌─────────────────────────────────────────────────────┐
│ Visual Editor                    [Fullscreen] [X]   │
├──────────────────────┬──────────────────────────────┤
│  LIVE PREVIEW        │  MR BLUE AI ASSISTANT        │
│  (Left Panel)        │  (Right Panel)               │
│                      │                              │
│  • Click any element │  • Ask design questions      │
│  • Drag to reposition│  • Get AI suggestions        │
│  • Edit controls     │  • View recent edits         │
│                      │  • Learning insights         │
└──────────────────────┴──────────────────────────────┘
```

### Step 3: Select an Element
**Click any element** on the left preview panel. You'll see:
- Blue border highlighting the selected element
- Element name displayed (e.g., "button-create-memory")
- Edit controls panel appears at the bottom

---

## 🎨 Editing Elements

### Option 1: Edit Controls Panel
When you select an element, a control panel appears with **4 tabs**:

#### 🔹 Position Tab
Move elements precisely:
- **X Position**: Horizontal position in pixels
- **Y Position**: Vertical position in pixels
- **Quick Actions**: Center, Align Left, Align Right

#### 🔹 Size Tab
Resize elements:
- **Width**: Element width (px, %, rem, auto)
- **Height**: Element height (px, %, rem, auto)
- **Aspect Ratio**: Maintain proportions checkbox

#### 🔹 Style Tab
Customize appearance:
- **Background Color**: Color picker or hex code
- **Text Color**: Color picker or hex code
- **Border**: Width, style, color
- **Border Radius**: Rounded corners
- **Padding**: Inner spacing
- **Margin**: Outer spacing
- **Font Size**: Text size
- **Font Weight**: Light, Regular, Medium, Bold

#### 🔹 Text Tab
Edit content:
- **Text Content**: Edit the actual text
- **Font Family**: Choose font
- **Text Align**: Left, Center, Right, Justify
- **Line Height**: Spacing between lines

### Option 2: Drag & Drop (Visual Repositioning)
**Simply drag** the selected element to a new position:
1. Click element to select it
2. Drag it anywhere on the page
3. Release to apply the new position
4. Changes are tracked automatically

**Tip:** You'll see "Dragging... Release to apply" overlay while dragging.

---

## 🤖 AI Code Generation

### How It Works
After making visual changes, the Visual Editor uses **OpenAI GPT-4o** to convert your edits into production-ready code.

### Generate Code
1. Make your visual changes (edit controls or drag & drop)
2. Click **"Generate Code"** button
3. Wait 3-10 seconds for AI processing
4. View the generated code in the preview panel

### Code Preview
You'll see:
- **Before/After Diff**: Visual comparison of changes
- **Updated Code**: Full component code with your changes
- **Explanation**: AI-generated description of what changed
- **File Path**: Which file will be updated

**Example:**
```diff
- <h1 className="text-2xl">Memories</h1>
+ <h1 className="text-3xl font-bold text-blue-600">My Memories</h1>
```

---

## 🌐 Preview & Deployment

### Step 1: Deploy to Preview (Staging)
**Purpose:** Test your changes before going live

1. Click **"Deploy Preview"** button
2. Wait 30-60 seconds for deployment
3. Get a **shareable staging URL**
4. Link expires in **24 hours**

**Preview URL Example:**
```
https://preview-visual-edit-1729012345.your-domain.replit.app
```

**What Happens:**
- Creates Git branch: `visual-edit-1729012345`
- Commits your changes with descriptive message
- Pushes to remote repository
- Generates preview deployment

### Step 2: Deploy to Production
**Purpose:** Make your changes live for all users

1. Test your preview thoroughly
2. Click **"Deploy to Production"**
3. **Confirmation dialog** appears (safety check)
4. Click **"Confirm Deploy"**

**What Happens:**
- Creates GitHub Pull Request (PR)
- Runs automated tests (Playwright)
- **If tests pass:** Auto-merges to main branch
- **If tests fail:** Shows error details, blocks merge

**Safety Features:**
- ✅ Automatic backups (`.backup` files created)
- ✅ Rollback available (Git history preserved)
- ✅ Tests must pass before merge
- ✅ PR review option (disable auto-merge if needed)

---

## 💬 Mr Blue AI Assistant

### What is Mr Blue?
Your personal AI design assistant built into the Visual Editor. Mr Blue understands your entire platform and provides context-aware suggestions.

### How to Use Mr Blue
**Located in the right panel**, Mr Blue offers:

#### 1. Ask Design Questions
**Examples:**
- "How can I make this button more accessible?"
- "What's a good color for error messages?"
- "Should I use padding or margin here?"
- "How do I make this mobile-friendly?"

#### 2. Get AI Suggestions
**Examples:**
- "Make this section more prominent"
- "Improve the visual hierarchy here"
- "Suggest better spacing for this card"
- "What Tailwind classes should I use?"

#### 3. View Recent Edits
See your last 5 changes with:
- Timestamp
- Component edited
- Type of change
- AI's assessment

#### 4. Learning Insights
Mr Blue learns your patterns:
- **Detected Patterns**: "You often add 16px padding to cards"
- **Auto-Suggestions**: "Apply your usual button style?"
- **Best Practices**: "Consider using semantic colors"

**Example Conversation:**
```
You: "How do I make this button stand out more?"

Mr Blue: "I recommend increasing the button size and using 
a high-contrast color. Try:
- Font size: text-lg (18px)
- Padding: px-6 py-3
- Background: bg-blue-600 (primary action color)
- Add shadow: shadow-lg

Would you like me to apply these changes?"
```

---

## 🔄 Multi-Page Editing

### Edit Multiple Pages in One Session
You can edit several pages without losing your work:

1. Edit page 1: `/memories?edit=true`
2. Make changes, click **"Save Draft"**
3. Navigate to page 2: `/groups?edit=true`
4. Make changes, click **"Save Draft"**
5. Click **"View Drafts"** to see all saved edits

### Draft Management
- **Save Draft**: Saves changes locally (not deployed)
- **View Drafts**: Lists all saved drafts
- **Apply Draft**: Deploy selected draft
- **Delete Draft**: Remove saved draft

**Use Case:** Make edits across 10 pages, review all together, then deploy as a batch.

---

## ⏮️ Undo / Redo

### Change History
Every edit is tracked with full undo/redo support:

### How to Undo
1. Click **"Undo"** button (or press `Ctrl+Z` / `Cmd+Z`)
2. Last change is reverted
3. Change moves to redo stack

### How to Redo
1. Click **"Redo"** button (or press `Ctrl+Y` / `Cmd+Y`)
2. Undone change is reapplied

### History Panel
View your complete change history:
- All edits with timestamps
- Jump to any point in history
- Compare versions side-by-side

**Example:**
```
10:45 AM - Changed button color to blue
10:43 AM - Moved card 20px down
10:41 AM - Updated heading text
10:39 AM - Added padding to section
```

---

## 🧪 Testing & Quality

### Automated Testing
Before production deployment, **8 functional tests** run automatically:

1. ✅ Component selection works
2. ✅ AI code generation accurate
3. ✅ Preview deployment successful
4. ✅ Drag & drop functional
5. ✅ Multi-page editing works
6. ✅ Undo/Redo operational
7. ✅ Learning system active
8. ✅ Production merge safe

### Test Results
After clicking "Deploy to Production", you'll see:
- **Test Progress**: Real-time status
- **Pass/Fail**: Each test result
- **Error Details**: If any test fails
- **Deploy Status**: "Ready to merge" or "Blocked"

**If Tests Fail:**
- Review error messages
- Fix the issues
- Click "Re-run Tests"
- Deploy when all tests pass

---

## 🎓 Pro Tips & Best Practices

### Design Tips
1. **Start Small**: Edit one element at a time
2. **Use Preview**: Always test in staging first
3. **Consistent Spacing**: Use multiples of 4px (4, 8, 16, 24, 32)
4. **Color Contrast**: Ensure text is readable (use Mr Blue for suggestions)
5. **Mobile First**: Check responsive behavior in preview

### Workflow Tips
1. **Save Drafts**: Make multiple edits, review together, deploy as batch
2. **Use Mr Blue**: Ask questions before making changes
3. **Check History**: Undo is always available
4. **Test Thoroughly**: Use preview extensively before production
5. **Learn Patterns**: Mr Blue learns your style and suggests it

### Performance Tips
1. **Avoid Large Moves**: Drag short distances for precision
2. **Batch Changes**: Group related edits together
3. **Clear Drafts**: Delete old drafts to keep interface clean
4. **Use Shortcuts**: `Ctrl+Z` (undo), `Ctrl+Y` (redo), `Esc` (deselect)

---

## 🚨 Troubleshooting

### Issue: "Cannot select element"
**Solution:**
- Ensure element has `data-testid` attribute
- Check if Visual Editor is active (`?edit=true` in URL)
- Verify you're a Super Admin

### Issue: "Code generation failed"
**Solution:**
- Check internet connection
- Verify OPENAI_API_KEY is configured
- Try again in 10 seconds (API rate limit)

### Issue: "Preview deployment failed"
**Solution:**
- Check Git repository is connected
- Verify branch permissions
- Review console for detailed error

### Issue: "Tests failing"
**Solution:**
- Review specific test errors
- Fix the highlighted issues
- Common: Missing `data-testid` on new elements
- Re-run tests after fixes

### Issue: "Drag & drop not working"
**Solution:**
- Select element first (click it)
- Ensure you're in Visual Editor mode
- Try using Edit Controls as alternative

---

## 🔐 Security & Permissions

### Who Can Use Visual Editor?
- **Super Admins Only**: Must have `super_admin` role
- **Authentication Required**: Must be logged in
- **Session Active**: Session must be valid

### What Can Be Edited?
- ✅ Components in `client/src` directory
- ✅ Pages, sections, cards, buttons
- ✅ Text, styles, layouts
- ❌ Server-side code (restricted)
- ❌ Database schemas (restricted)
- ❌ Authentication logic (restricted)

### Safety Features
1. **Automatic Backups**: `.backup` files created before changes
2. **Git History**: Full version control
3. **Test Gates**: Tests must pass before production
4. **Rollback**: Can revert to any previous version
5. **Audit Trail**: All changes logged with timestamps

---

## 📚 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo last change |
| `Ctrl+Y` / `Cmd+Y` | Redo change |
| `Esc` | Deselect element |
| `Ctrl+S` / `Cmd+S` | Save draft |
| `Ctrl+P` / `Cmd+P` | Deploy to preview |
| `Arrow Keys` | Move selected element (1px) |
| `Shift+Arrow` | Move selected element (10px) |
| `Ctrl+D` / `Cmd+D` | Duplicate element |

---

## 🎯 Quick Start Checklist

- [ ] Navigate to page with `?edit=true`
- [ ] Click element to select it
- [ ] Make changes (drag or edit controls)
- [ ] Click "Generate Code"
- [ ] Review AI-generated code
- [ ] Click "Deploy Preview"
- [ ] Test preview URL thoroughly
- [ ] Click "Deploy to Production"
- [ ] Confirm deployment
- [ ] Verify tests pass
- [ ] Changes are live! 🎉

---

## 📞 Support

### Need Help?
1. **Ask Mr Blue**: AI assistant knows everything about Visual Editor
2. **Check Logs**: View recent edits and error messages
3. **Review Docs**: This guide covers all features
4. **Contact Dev Team**: For advanced issues

### Common Questions

**Q: Can I edit mobile view?**  
A: Yes! The preview shows responsive breakpoints. Edit any screen size.

**Q: How long do preview links last?**  
A: 24 hours. After that, they expire automatically.

**Q: Can I edit without deploying?**  
A: Yes! Use "Save Draft" to save locally without deploying.

**Q: What if I break something?**  
A: Use Undo, or rollback via Git history. All changes are reversible.

**Q: Can multiple admins edit simultaneously?**  
A: Not yet. Collaborative editing is planned for future release.

---

## 🚀 Advanced Features (Coming Soon)

### Planned Enhancements
- **Responsive Breakpoints**: Edit tablet, mobile views separately
- **Component Library**: Pre-built components to drag & drop
- **Template System**: Save layouts, reuse across pages
- **Collaborative Editing**: Multiple admins editing together
- **A/B Testing**: Deploy variants, measure performance
- **Design System Integration**: Auto-apply brand guidelines

---

**Happy Editing! 🎨**  
The Visual Editor makes professional page editing accessible to everyone, no code required.

---

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Maintained by:** Agent #78 (Visual Page Editor)  
**For Questions:** Ask Mr Blue AI Assistant
