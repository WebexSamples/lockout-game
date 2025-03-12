# Lockout: Team & Role Assignment Feature Spec

## Overview

This document outlines the team and role assignment system for **Lockout**, a Webex Embedded App inspired by _Codenames_.

## Roles & Teams

### **Game Host**

- The **first player to create the lobby becomes the Game Host**.
- **Host Responsibilities:**
  - Assigns **teams and roles manually** if needed.
  - Starts the game **once conditions are met** (or uses "Force Start").
  - **Has a special visual indicator** (badge/icon next to their name).
  - If the **Game Host leaves**, the role transfers to the next player in the lobby.

### **Teams**

- **Team Bluewave (Blue Team)**
- **Team Redshift (Red Team)**

### **Roles within Teams**

- **Hacker (Spymaster Equivalent)**
  - **Only one per team**.
  - **Provides encrypted clues** to their team.
  - Can **demote themselves** before the game starts.
  - If a **Hacker switches teams, they are immediately demoted** to an AI Agent.
- **AI Agents (Teammates)**
  - Work together to decipher the Hacker's clues and extract the correct files.

## Team & Role Assignment

### **Automatic Team Assignment**

- Players **automatically join the team with fewer players**.
- **Team switching is allowed** before the game starts.
- **No restriction on overloaded teams** – but the game **cannot start unless teams are balanced**.

### **Role Assignment Rules**

- **Hackers must be assigned before the game can start.**
- **A player can volunteer to become the Hacker**, if the role is available.
- **If a Hacker switches teams, they lose the role and become an AI Agent.**
- **The Game Host can manually assign roles if necessary.**

## Ready-Up System & Game Start Conditions

### **Default Start Conditions**

The Game Host **can only start the game when**:

- ✅ Each team has **exactly one Hacker**.
- ✅ Teams must be **balanced**.
- ✅ **All players are Ready**.

### **Force Start Option (Host Only)**

- Allows starting the game **without balance enforcement**.
- **All players must still be Ready**.
- A warning message appears:  
  _"Teams are unbalanced. Are you sure you want to force start?"_

## UI Updates

### **Lobby Screen Enhancements**

- **Game Host indicator** (badge/icon).
- **Clear role/team assignments displayed**.
- **Hacker demotion button** (available until the game starts).
- **Game Start button** (disabled until conditions are met, unless "Force Start" is used).

## Next Steps

This spec serves as a reference for implementing team and role assignment within the _Lockout_ game lobby.
