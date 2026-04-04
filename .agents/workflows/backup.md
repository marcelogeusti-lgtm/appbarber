---
description: Local Backup and Rapid Restoration Workflow
---

This workflow defines the local backup and rapid restoration system for the AppBarber project, allowing for "one-click" manual versioning and quick rollbacks.

## Commands

### 🔹 ATUALIZAR BACKUP
When the user gives this command, the agent MUST:
1. Run the backup command: `node manage-backup.js --backup`.
2. Confirm the backup creation and the location.

### 🔹 RESTAURAR BACKUP
When the user gives this command, the agent MUST:
1. Run the restoration command: `node manage-backup.js --restore`.
2. Warn the user that this will overwrite current local changes.
3. Confirm the restoration and the success of the operation.

## Configuration
- **Backup Root**: `../backup` (Relative to project root).
- **Tool**: `robocopy` (Native Windows fast copy).
- **Exclusions**: `node_modules`, `.next`, `.git` (To speed up the process).
