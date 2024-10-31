// index.js
import { initializeMap } from './map.js';
import { setupEventListeners } from './eventHandlers.js';
import { loadCrimeData } from './dataManager.js';
import { state } from './state.js';
import { updateScrubberVisibility } from './utils.js';

// Initialize the application
function initializeApp() {
    // Initialize map
    initializeMap();

    // Setup event handlers
    setupEventListeners();

    // Initial load
    const initialDate = "2024-01-01";
    loadCrimeData(initialDate, state.current);
    updateScrubberVisibility(state.isWeeklyView);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);