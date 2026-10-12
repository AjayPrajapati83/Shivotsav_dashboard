# Entry Management Guide

## Understanding Void vs Delete

### 🔴 Void Entry (Recommended)
**What it does:**
- ✅ Removes points from leaderboard calculations
- ✅ Keeps the entry in the database for audit trail
- ✅ Marks entry as "Voided" with timestamp and reason
- ✅ Can be **restored** later if needed
- ✅ Maintains compliance and accountability

**When to use:**
- Correcting mistakes
- Fixing duplicate entries
- Testing/practice entries
- Any time you might need to undo the action

**How to void:**
1. Go to **Admin → History**
2. Find the entry you want to void
3. Click the **Ban icon (🚫)** in the Actions column
4. Enter a reason (e.g., "Duplicate entry", "Wrong college")
5. Click **Void**
6. Entry will show as "Voided" in red but remain in history

**How to restore:**
- Click the **Restore icon (↻)** on any voided entry
- Points will be added back to the leaderboard immediately

---

### ⚠️ Delete Entry (Permanent)
**What it does:**
- ❌ Permanently removes entry from database
- ❌ Cannot be undone
- ❌ No audit trail after deletion
- ❌ Entry disappears completely from history

**When to use:**
- Cleaning up test data before going live
- Removing entries that should never have existed
- Only when you're 100% certain you'll never need the data

**How to delete:**
1. Go to **Admin → History**
2. Find the entry you want to delete
3. Click the **Trash icon (🗑️)** in the Actions column
4. Read the warning carefully
5. Click **Delete Forever**
6. Entry is permanently removed

---

## Best Practices

### ✅ DO:
- Use **Void** for most corrections
- Provide clear reasons when voiding
- Review history before deleting anything
- Test with void first, delete only if necessary

### ❌ DON'T:
- Delete entries during active events
- Delete without checking what the entry was for
- Use delete for routine corrections

---

## Example Scenarios

### Scenario 1: Wrong Points Assigned
**Problem:** Assigned 500 points to wrong college  
**Solution:** Use **Void** → Assign to correct college  
**Why:** Maintains audit trail of the mistake and correction

### Scenario 2: Duplicate Entry
**Problem:** Accidentally assigned same points twice  
**Solution:** Use **Void** on one entry with reason "Duplicate"  
**Why:** Shows the duplicate was identified and fixed

### Scenario 3: Test Data Before Launch
**Problem:** Have 50 test entries before festival starts  
**Solution:** Use **Delete** on all test entries  
**Why:** Clean slate with no clutter in history

### Scenario 4: Wrong Event Selected
**Problem:** Assigned dance points to drama event  
**Solution:** Use **Void** → Re-assign to correct event  
**Why:** Clear record of what happened

---

## Filters in History Page

### Status Filters:
- **All** - Shows everything (active + voided)
- **Active** - Only shows entries counting toward scores
- **Voided** - Only shows voided entries

### Other Filters:
- **College dropdown** - Filter by specific college
- **Code dropdown** - Filter by scoring type (PARTICIPATION, PODIUM, etc.)

---

## Quick Reference

| Action | Reversible? | Shows in History? | Affects Leaderboard? | Use Case |
|--------|-------------|-------------------|----------------------|----------|
| **Assign** | ✅ (via void) | ✅ Yes | ✅ Yes | Add points |
| **Void** | ✅ (via restore) | ✅ Yes | ❌ No | Temporarily remove |
| **Restore** | ✅ (via void again) | ✅ Yes | ✅ Yes | Undo void |
| **Delete** | ❌ No | ❌ No | ❌ No | Permanent removal |

---

## Keyboard Shortcuts (Coming Soon)
- `V` - Void selected entry
- `R` - Restore selected entry
- `Delete` - Permanently delete (with confirmation)

---

## Need Help?
- Check the **History** page to see all transactions
- Use **Export CSV** to analyze entries offline
- Contact admin if you accidentally deleted something important
- All actions are logged with timestamps and user info

---

**Remember:** When in doubt, use **Void** instead of **Delete**. You can always permanently delete later, but you can't restore a deleted entry!
