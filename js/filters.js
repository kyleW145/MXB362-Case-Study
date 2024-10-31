// filters.js
export function getSelectedFilters() {
    return {
        weaponCategories: getSelectedCheckboxValues('#weaponCategoryFilters input[type="checkbox"]'),
        crimeCategories: getSelectedCheckboxValues('#crimeCategoryFilters input[type="checkbox"]'),
        victimSex: getSelectedCheckboxValues('#victimSexFilters input[type="checkbox"]'),
        victimDescent: getSelectedCheckboxValues('#victimDescentFilters input[type="checkbox"]'),
        victimAge: getSelectedCheckboxValues('#victimAgeFilters input[type="checkbox"]')
    };
}

function getSelectedCheckboxValues(selector) {
    const checkboxes = document.querySelectorAll(selector);
    return Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

export function setupFilterListeners(callback) {
    const filterSelectors = [
        '#weaponCategoryFilters input[type="checkbox"]',
        '#crimeCategoryFilters input[type="checkbox"]',
        '#victimSexFilters input[type="checkbox"]',
        '#victimDescentFilters input[type="checkbox"]',
        '#victimAgeFilters input[type="checkbox"]'
    ];

    filterSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(checkbox => {
            checkbox.addEventListener('change', callback);
        });
    });
}