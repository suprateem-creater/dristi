import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useCopyProtection() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor') || location.pathname.startsWith('/edit');

  useEffect(() => {
    if (isEditor) {
      document.body.classList.remove('no-copy');
      return;
    }

    // Helper function to detect editable nodes
    const isEditable = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };

    // 1. Disable Right Click Context Menu
    const handleContextMenu = (e) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    // 2. Disable Copy Event
    const handleCopy = (e) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    // 3. Disable Cut Event
    const handleCut = (e) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };

    // 4. Disable Drag Event (for images, text, emojis)
    const handleDragStart = (e) => {
      if (isEditable(e.target)) return;
      // Allow links / buttons to be interactable, but prevent text/image dragging
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      e.preventDefault();
    };

    // 5. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+X, Ctrl+U, Ctrl+S & Cmd counterparts)
    const handleKeyDown = (e) => {
      if (isEditable(e.target)) return;

      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'u' || key === 's') {
        e.preventDefault();
      }
    };

    // Attach listeners globally
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // Apply global body class for CSS-level protections
    document.body.classList.add('no-copy');

    // Clean up all event listeners when the route changes or component unmounts
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-copy');
    };
  }, [isEditor]);
}
