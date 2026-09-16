# Phase 3 Guide — UX Power Features

Phase 3 is fully client-side (plus one new bulk API). No new env vars or external services needed — just merge, restart and explore.

## What's new

### 1. Dark mode
- Toggle: topbar sun/moon button. First visit follows your OS preference; your choice is remembered.
- Light mode stays pixel-identical to the approved design.

### 2. Keyboard shortcuts
| Shortcut | Action |
| --- | --- |
| `Ctrl + K` | Focus the search bar |
| `Ctrl + S` | Save the note (editor) |
| `Ctrl + /` | Open the shortcuts help |
| `Ctrl + B / I / U` | Bold / italic / underline (editor) |
| `Esc` | Close dialogs, menus, suggestions |

(Command key on macOS.) The help modal also opens from the keyboard button in the topbar.

### 3. Version history UI
- Any note → `...` menu → **Version history**.
- A version is saved every time you save with `Ctrl+S` / Save button.
- **Restore** brings back an old version; your current content is kept as a new version first, so undo is always possible.

### 4. Bulk actions
- All Notes → **Select** → tick notes (or the header checkbox for all).
- Floating bar appears: move to folder, add tag, pin, favorite, trash, clear selection.
- Works on any number of selected notes in one request (`PATCH /api/notes/bulk`).

### 5. Note templates
- Create Note → **Start from a template**: Blank, Lecture notes, Meeting notes, Revision sheet.
- Applying a template pre-fills headings/lists/task lists so notes start structured.

### 6. List upgrades (All Notes)
- **Table / grid view** toggle (remembered per browser).
- **Sortable columns**: click Title or Last modified headers to flip ascending/descending.

## Test checklist

1. Toggle dark mode → sidebar, cards, editor, modals all switch; toggle back → light design unchanged.
2. Press `Ctrl+K` → search focused; `Ctrl+/` → shortcuts modal opens.
3. Edit a note → `Ctrl+S` → open `...` → Version history → see the saved version → Restore → old title/content back.
4. All Notes → Select → pick 3 notes → pin them all → all show pin icons; then trash all → all in Trash; restore all.
5. Bulk move 2 notes into a folder → folder page shows them; bulk add a tag → tag filter finds them.
6. Create Note → choose "Meeting notes" template → structured draft appears → save.
7. All Notes → switch to grid view → reload page → still grid; click Title header → order flips.

## Sync + push

```bat
robocopy "C:\Downloads\notes-heaven" "C:\Projects\notes-heaven" /E /XD node_modules dist .git /XF .env /NFL /NDL /NJH /NJS
```
(run in CMD, or use the `cp -rf` Git Bash command from Phase 2)

```bat
git add .
git commit -m "Phase 3: dark mode, shortcuts, version history UI, bulk actions, templates, view toggles"
git push origin main
```
