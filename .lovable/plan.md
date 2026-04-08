
# OrgGraph — Organizational Graph Editor MVP

## Overview
A polished single-page graph editor for creating, editing, and managing organizational hierarchy graphs. Premium B2B SaaS aesthetic with three-panel layout.

## Layout Structure
Three-panel layout with collapsible sidebars:
- **Left sidebar (~280px)**: Graph explorer with logo, search, create button, and saved graph cards
- **Center area (flex)**: Graph canvas with toolbar and inline-editable title
- **Right sidebar (~320px)**: Context-sensitive inspector panel for selected node/edge

## Left Sidebar — Graph Explorer
- App logo "OrgGraph" with subtle icon at top
- Search input with filter
- "New Graph" primary button
- List of graph cards showing: title, version badge, last updated timestamp
- Active graph highlighted with accent border
- Hover reveals quick-delete (trash icon)
- Empty state with illustration when no graphs exist
- Subtle scroll area

## Center — Graph Canvas & Toolbar
- **Toolbar bar** above canvas: Save, Add Node (dropdown by type), Add Edge, Auto-layout, Fit View buttons
- **Graph title** inline-editable with "unsaved changes" dot indicator
- **Canvas area** using React Flow for interactive node/edge rendering:
  - Nodes as styled cards with type-specific colors and icons:
    - **Organization**: Large blue card, Building2 icon
    - **OrgUnit**: Medium teal card, Network icon
    - **Position**: Medium purple card, Briefcase icon
    - **Person**: Compact warm card, User icon
    - **Account**: Small gray/technical card, Key icon
  - Edges with labeled relation types, styled by type
  - Pan, zoom, minimap, background grid
  - Selected node/edge gets highlighted border
- **Empty state**: Centered illustration + "Select or create a graph" message when nothing is open

## Right Sidebar — Inspector Panel
- **Node selected**: Type badge, common fields form (label, description, externalId, parentId), dynamic type-specific fields section, metadata section (id, timestamps), delete node button
- **Edge selected**: Relation type dropdown, source/target display, delete edge button
- **Nothing selected**: Helpful prompt text
- Form styling inspired by Notion/Linear — clean inputs, grouped sections, subtle separators

## Data & State Management
- All state in React (useState/useReducer), no backend
- Graphs persisted to localStorage for save/load/delete
- Unsaved changes tracked by comparing current state vs last saved
- Pre-populated with 3 realistic demo graphs; one auto-opened with ~8-10 nodes showing a believable org structure

## Demo Data
Open graph "Acme Corp Structure" containing:
- 1 Organization (Acme Corp)
- 2 OrgUnits (Engineering, HR)
- 3 Positions (CTO, Senior Engineer, HR Manager)
- 2 Persons (John Doe, Jane Smith)
- 1 Account (LDAP account)
- Connected with appropriate relation types

Two additional saved graphs in sidebar: "Beta Holdings Group", "Startup Inc Org"

## Design System
- Light theme with soft gray background (`#f8f9fb`)
- White floating panels with `rounded-xl`, soft `shadow-sm`
- Color palette per node type (blue, teal, purple, amber, slate)
- Inter-like typography, generous spacing
- Subtle gradients on primary buttons
- Minimal Lucide icons throughout

## Tech
- React Flow (`@xyflow/react`) for the graph canvas
- Shadcn UI components for forms, buttons, dialogs
- localStorage for persistence
- Single page, no routing needed beyond index
