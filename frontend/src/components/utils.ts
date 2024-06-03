export function displayTimeString(time: number): string {
    const { date, nsRem } = {
        date: new Date(time),
        nsRem: time % 1000,
    };
    return (
        date.getUTCHours().toString().padStart(2, '0') +
        ':' +
        date.getUTCMinutes().toString().padStart(2, '0') +
        ':' +
        date.getUTCSeconds().toString().padStart(2, '0') +
        '.' +
        nsRem.toString().padStart(3, '0')
    );
}

export function displayDateString(time: number): string {
    const date = { date: new Date(time), nsRem: time % 1000 };
    return (
        date.date.getUTCDate().toString().padStart(2, '0') +
        '.' +
        (date.date.getUTCMonth() + 1).toString().padStart(2, '0') +
        '.' +
        date.date.getFullYear()
    );
}

export function displayDateTimeString(time: number): string {
    const { date, nsRem } = {
        date: new Date(time),
        nsRem: time % 1000,
    };
    return (
        date.getUTCDate().toString().padStart(2, '0') +
        '.' +
        (date.getUTCMonth() + 1).toString().padStart(2, '0') +
        '.' +
        date.getFullYear() +
        'T' +
        date.getUTCHours().toString().padStart(2, '0') +
        ':' +
        date.getUTCMinutes().toString().padStart(2, '0') +
        ':' +
        date.getUTCSeconds().toString().padStart(2, '0') +
        '.' +
        nsRem.toString().padStart(3, '0')
    );
}

export function formattedDateAndTime(
    timestamp: number | undefined
): [string, string] {
    if (!timestamp) return ['', ''];
    const dateObj = new Date(timestamp);

    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const date = dateObj.getDate().toString().padStart(2, '0');
    const formattedDate = `${date} ${month} ${year}`;

    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return [formattedDate, formattedTime];
}

export function parseDateTimeValue(dateTimeString: String, formatter: String) {
    let dateObject;

    if (formatter === 'datetime') {
        const [datePart, timePart] = dateTimeString.split('T');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        dateObject = new Date(year, month - 1, day, hours, minutes);
    } else if (formatter === 'date') {
        const [day, month, year] = dateTimeString.split('.').map(Number);
        dateObject = new Date(year, month - 1, day);
    } else if (formatter === 'time') {
        const [hours, minutes, seconds] = dateTimeString.split(':');
        const [sec, ms] = seconds.split('.').map(Number);
        dateObject = new Date(
            Date.UTC(1970, 0, 1, Number(hours), Number(minutes), sec, ms)
        );
    } else {
        return null;
    }

    if (formatter == 'time') return extractTimeInMilliseconds(dateObject);
    return dateObject.getTime();
}

export function extractTimeInMilliseconds(timestamp: number) {
    const date = new Date(timestamp);

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const milliseconds = date.getUTCMilliseconds();

    const timeInMilliseconds =
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000 +
        milliseconds;

    return timeInMilliseconds;
}
