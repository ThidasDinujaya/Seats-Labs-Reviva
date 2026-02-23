export const formatTime = (timeString) => {
    if (!timeString) return '';

    let hours, minutes;

    if (String(timeString).includes('T') || String(timeString).includes('-')) {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return String(timeString);
        hours = date.getHours();
        minutes = date.getMinutes();
    } else {
        const parts = String(timeString).split(':');
        if (parts.length < 2) return String(timeString);
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
};
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
