export const useTime = () => {
    const relativeTime = (timestamp) => {
        if (timestamp !== undefined) {
            const now = Date.now();
            const difference = now - new Date(timestamp).getTime();

            // Calculate time units
            const seconds = Math.floor(Math.abs(difference) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const weeks = Math.floor(days / 7)
            const months = Math.floor(weeks / 4);
            const years = Math.floor(months / 12);

            // Define thresholds and formatting
            let unit;
            if (seconds < 60) {
                unit = `${seconds}s`;
                return `${unit}`;
            } else if (minutes < 60) {
                unit = `${minutes}m`;
                return `${unit}`;
            } else if (hours < 24) {
                unit = `${hours}h`;
                return `${unit}`;
            } else if (days < 7) {
                unit = `${days}d`;
                return `${unit}`;
            } else if (weeks < 4) {
                unit = `${weeks}wk`;
                return `${unit}`
            } else if (months < 12) {
                unit = `${months}mo`;
                return unit
            } else {
                unit = `${years}y`;
                return unit;
            }
        }

    }

    return { relativeTime }
}