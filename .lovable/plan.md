

# Mobile Responsiveness Refinement

## What's Already Done
The app has basic mobile support: `useIsMobile()` hook, mobile prop passed to components, Sheet-based drawers for explorer/inspector, and a compact mobile toolbar. However, several areas need polish.

## Changes

### 1. GraphCanvas.tsx — Mobile toolbar and canvas improvements
- Add `FilterBar` access on mobile via the overflow menu (currently desktop-only)
- Increase touch target sizes on mobile toolbar buttons from `h-8 w-8` to `h-10 w-10`
- Add `minZoom={0.2}` and larger node drag threshold for touch
- Move mobile toolbar padding to avoid conflicting with the floating nav buttons (currently `px-12` is a rough workaround)
- Show Controls with larger touch-friendly buttons on mobile

### 2. InspectorPanel.tsx — Mobile form improvements
- Increase input heights from `h-8` to `h-10` on mobile for better tap targets
- Add more vertical spacing between form sections on mobile
- Make action buttons (Delete, Duplicate) larger on mobile
- Ensure the bottom sheet scrolls smoothly with touch

### 3. GraphExplorer.tsx — Mobile drawer polish
- Increase graph card tap targets and spacing on mobile
- Make search input and "New Graph" button taller on mobile
- Always show delete button on mobile (no hover state on touch)

### 4. OrgNode.tsx — Touch-friendly nodes
- Increase handle sizes slightly for easier edge connection on touch
- Ensure minimum node dimensions work well at mobile zoom levels

### 5. NodeSearchDialog.tsx — Mobile search
- Ensure the command dialog is full-width on mobile with proper padding
- Increase tap targets for search results on mobile

### 6. Index.tsx — Layout adjustments
- Ensure floating toggle buttons don't overlap the mobile toolbar
- Add safe area padding for notched devices
- Improve the inspector bottom sheet height to `60vh` with better handle styling

### 7. FilterBar.tsx — Mobile adaptation
- Create a mobile-friendly version that renders as a scrollable row or sheet-based toggle list when accessed from the mobile overflow menu

### 8. Global CSS (index.css)
- Add touch-action utilities for better mobile scrolling
- Ensure React Flow controls have adequate mobile sizing via CSS overrides

## Technical Approach
- Use the existing `mobile` prop pattern throughout
- Conditionally apply larger sizing classes (`h-10` vs `h-8`, `p-4` vs `p-3`) based on `mobile` prop
- No new dependencies needed
- All changes are CSS/class-based responsive adjustments within existing component structure

