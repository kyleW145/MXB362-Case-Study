// utils.js
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export function getDayName(dayIndex) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayIndex - 1];
}

export function getTimeRange(sixth) {
    switch (sixth) {
        case 1: return "12:00 AM - 4:00 AM";
        case 2: return "4:00 AM - 8:00 AM";
        case 3: return "8:00 AM - 12:00 PM";
        case 4: return "12:00 PM - 4:00 PM";
        case 5: return "4:00 PM - 8:00 PM";
        case 6: return "8:00 PM - 12:00 AM";
        default: return "";
    }
}

export function getWeekRange(date) {
    const selectedDate = new Date(date);
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
        start: weekStart,
        end: weekEnd,
        startStr: formatDate(weekStart),
        endStr: formatDate(weekEnd)
    };
}

export function getDateFromWeekDay(baseDate, targetDay) {
    const weekRange = getWeekRange(baseDate);
    const result = new Date(weekRange.start);
    result.setDate(result.getDate() + (targetDay - 1));
    return formatDate(result);
}

export function updateWeekDisplay(date, isWeeklyView) {
    const weekRange = getWeekRange(date);
    const weekDisplay = document.getElementById('weekDisplay');
    const weekRangeText = document.getElementById('weekRange');

    if (isWeeklyView) {
        weekDisplay.style.display = 'block';
        weekRangeText.textContent = `${weekRange.startStr} to ${weekRange.endStr}`;
    } else {
        weekDisplay.style.display = 'none';
    }
}

export function updateScrubberVisibility(isWeeklyView) {
    document.getElementById('dailyScrubber').style.display = isWeeklyView ? 'none' : 'block';
    document.getElementById('weeklyScrubber').style.display = isWeeklyView ? 'block' : 'none';
    document.getElementById('scrubberValue').style.display = isWeeklyView ? 'none' : 'block';
}