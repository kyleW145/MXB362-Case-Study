// eventHandlers.js
import { state } from './state.js';
import { loadCrimeData } from './dataManager.js';
import { 
    getDateFromWeekDay, 
    getDayName, 
    getTimeRange, 
    updateScrubberVisibility 
} from './utils.js';
import { setupFilterListeners } from './filters.js';

export function setupEventListeners() {
    setupViewControls();
    setupTimeControls();
    setupRegionControls();
    setupDateControls();
    setupFilterToggles();  // Add this line
    setupFilterListeners(() => {
        const date = document.getElementById('dateInput').value;
        loadCrimeData(date, state.current);
    });
}

function setupViewControls() {
    document.getElementById('dailyButton').addEventListener('click', function() {
        if (state.isWeeklyView) {
            state.isWeeklyView = false;
            this.classList.add('active');
            document.getElementById('weeklyButton').classList.remove('active');
            updateScrubberVisibility(state.isWeeklyView);
            loadCrimeData(document.getElementById('dateInput').value, state.current);
        }
    });

    document.getElementById('weeklyButton').addEventListener('click', function() {
        if (!state.isWeeklyView) {
            state.isWeeklyView = true;
            this.classList.add('active');
            document.getElementById('dailyButton').classList.remove('active');
            updateScrubberVisibility(state.isWeeklyView);
            state.currentWeekDay = 1;
            document.getElementById('weekScrubber').value = state.currentWeekDay;
            document.getElementById('weekScrubberValue').innerText = getDayName(state.currentWeekDay);
            loadCrimeData(document.getElementById('dateInput').value, state.current);
        }
    });
}

function setupTimeControls() {
    document.getElementById('playButton').addEventListener('click', function() {
        if (!state.isPlaying) {
            state.isPlaying = true;
            state.interval = setInterval(() => {
                if (state.isWeeklyView) {
                    handleWeeklyPlayback();
                } else {
                    handleDailyPlayback();
                }
            }, 1400);
        }
    });

    document.getElementById('pauseButton').addEventListener('click', function() {
        if (state.isPlaying) {
            clearInterval(state.interval);
            state.isPlaying = false;
        }
    });

    document.getElementById('stopButton').addEventListener('click', handleStop);

    document.getElementById('scrubber').addEventListener('input', function() {
        state.current = parseInt(this.value);
        document.getElementById('scrubberValue').innerText = getTimeRange(state.current);
        handleTimeUpdate();
    });

    document.getElementById('weekScrubber').addEventListener('input', function() {
        state.currentWeekDay = parseInt(this.value);
        document.getElementById('weekScrubberValue').innerText = getDayName(state.currentWeekDay);
        handleTimeUpdate();
    });
}

function setupRegionControls() {
    document.getElementById('regionsButton').addEventListener('click', function() {
        state.currentViewState = 'region';
        state.currentAprec = null;
        if (state.currentChoroplethLayer) {
            state.map.removeLayer(state.currentChoroplethLayer);
        }
        loadCrimeData(document.getElementById('dateInput').value, state.current);
    });
}

function setupDateControls() {
    document.getElementById('dateInput').addEventListener('input', handleTimeUpdate);
}

function handleDailyPlayback() {
    if (state.current < 6) {
        state.current++;
        document.getElementById('scrubber').value = state.current;
        document.getElementById('scrubberValue').innerText = getTimeRange(state.current);
        handleTimeUpdate();
    } else {
        clearInterval(state.interval);
        state.isPlaying = false;
    }
}

function handleWeeklyPlayback() {
    if (state.currentWeekDay < 7) {
        state.currentWeekDay++;
        document.getElementById('weekScrubber').value = state.currentWeekDay;
        document.getElementById('weekScrubberValue').innerText = getDayName(state.currentWeekDay);
        handleTimeUpdate();
    } else {
        clearInterval(state.interval);
        state.isPlaying = false;
    }
}

function handleStop() {
    clearInterval(state.interval);
    state.isPlaying = false;
    
    const date = document.getElementById('dateInput').value;
    
    if (state.isWeeklyView) {
        state.currentWeekDay = 1;
        document.getElementById('weekScrubber').value = state.currentWeekDay;
        document.getElementById('weekScrubberValue').innerText = getDayName(state.currentWeekDay);
    } else {
        state.current = 1;
        document.getElementById('scrubber').value = state.current;
        document.getElementById('scrubberValue').innerText = getTimeRange(state.current);
    }
    
    handleTimeUpdate();
}

function handleTimeUpdate() {
    const date = document.getElementById('dateInput').value;
    if (state.isWeeklyView) {
        const effectiveDate = getDateFromWeekDay(date, state.currentWeekDay);
        loadCrimeData(effectiveDate, state.current);
    } else {
        loadCrimeData(date, state.current);
    }
}

function setupFilterToggles() {
    // Add click handlers for each toggle button
    document.getElementById('toggleCrimeCategories').addEventListener('click', function() {
        const content = document.getElementById('crimeCategoryFilters');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    document.getElementById('toggleWeaponCategories').addEventListener('click', function() {
        const content = document.getElementById('weaponCategoryFilters');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    document.getElementById('toggleVictimSex').addEventListener('click', function() {
        const content = document.getElementById('victimSexFilters');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    document.getElementById('toggleVictimDescent').addEventListener('click', function() {
        const content = document.getElementById('victimDescentFilters');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    document.getElementById('toggleVictimAge').addEventListener('click', function() {
        const content = document.getElementById('victimAgeFilters');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? '+' : '-';
    });

    // Initialize the filters as hidden
    ['crimeCategoryFilters', 'weaponCategoryFilters', 'victimSexFilters', 
     'victimDescentFilters', 'victimAgeFilters'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}