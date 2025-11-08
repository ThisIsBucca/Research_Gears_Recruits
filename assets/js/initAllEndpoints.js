// Initialize all site endpoints safely and efficiently
function initAllEndpoints() {
  // Prevent multiple event listener attachments
  if (window._endpointsInitialized) return;
  window._endpointsInitialized = true;

  // Run when the DOM is fully parsed (faster than waiting for images)
  window.addEventListener("DOMContentLoaded", () => {
    
  // Helper to safely execute initialization functions
    const safeRun = (fn) => {
      try {
        if (typeof fn === "function") fn();
        else console.warn("Skipped: not a function ->", fn);
      } catch (err) {
        console.error(`Error in ${fn.name || "anonymous function"}:`, err);
      }
    };

    // Run all initialization routines
    safeRun(initGetStories);
    safeRun(initAddStory);
    safeRun(loadExplorePosts);
    safeRun(applyCartData);
    safeRun(profilePicChanges);
    safeRun(applyRole);
    safeRun(displayConversations);
    safeRun(handleOnlineStatus);
  });
}

