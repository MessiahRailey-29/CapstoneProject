# Documentation

This folder contains comprehensive documentation for the Shopping List Application.

## 📚 Available Documentation

### [Use Case Diagram](./USE_CASE_DIAGRAM.md)
Complete use case diagrams showing all system functionality, actors, and interactions.

**Includes:**
- Complete system overview
- Feature-specific diagrams (Authentication, Shopping Lists, Recipes, Notifications, Recommendations)
- Actor definitions
- Use case specifications
- Relationships and dependencies

---

## 🎨 How to View Diagrams

### Method 1: GitHub (Easiest)
Just open the markdown files on GitHub - Mermaid diagrams render automatically!

### Method 2: Mermaid Live Editor
1. Go to https://mermaid.live/
2. Copy any Mermaid code block from the docs
3. Paste and view/export

### Method 3: VS Code
1. Install extension: "Markdown Preview Mermaid Support"
2. Open any `.md` file
3. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)

### Method 4: Command Line
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG from markdown
mmdc -i docs/USE_CASE_DIAGRAM.md -o diagrams/use-case.png
```

---

## 📊 Diagram Types

### Use Case Diagrams ✅
- [x] System overview
- [x] Authentication flow
- [x] Shopping list lifecycle
- [x] Recipe integration
- [x] Notification system
- [x] ML recommendation engine

### Architecture Diagrams (Coming Soon)
- [ ] High-level system architecture
- [ ] Data flow diagram
- [ ] Component diagram
- [ ] Deployment diagram

### Sequence Diagrams (Coming Soon)
- [ ] User authentication flow
- [ ] Real-time sync sequence
- [ ] Notification delivery
- [ ] Recipe to shopping list flow

---

## 🔗 Quick Links

- **Codebase**: `../client/` and `../server/`
- **Use Case Diagrams**: [USE_CASE_DIAGRAM.md](./USE_CASE_DIAGRAM.md)
- **Project README**: [../README.md](../README.md)

---

## 📝 Contributing to Documentation

When adding new features, please update:
1. Use case diagrams (if new user-facing functionality)
2. Architecture diagrams (if system structure changes)
3. Sequence diagrams (if new interaction flows)

### Adding a New Use Case

1. **Add to the use case table** in `USE_CASE_DIAGRAM.md`
2. **Update the Mermaid diagram** code
3. **Create detailed specification** with:
   - Actor
   - Preconditions
   - Main flow
   - Alternative flows
   - Postconditions
   - Related files

### Example:
```markdown
| UC99 | New Feature | Shopper | Description here | High | `path/to/file.tsx` |
```

Then add to Mermaid diagram:
```mermaid
UC99((New Feature))
Shopper --> UC99
```

---

## 🛠️ Tools Used

- **Mermaid.js** - Diagram generation from code
- **Markdown** - Documentation format
- **GitHub** - Automatic diagram rendering

---

## 📞 Contact

For questions about the documentation, please contact the development team.
