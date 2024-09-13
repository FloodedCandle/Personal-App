export const chartThemes = {
    default: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4'],
    neon: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF3300', '#0033FF'],
    earth: ['#8B4513', '#228B22', '#4682B4', '#D2691E', '#556B2F', '#B8860B'],
    berry: ['#8E354A', '#C71585', '#DB7093', '#FF69B4', '#FFB6C1', '#FFC0CB'],
};

export const getThemeColors = (theme) => {
    return chartThemes[theme] || chartThemes.default;
};