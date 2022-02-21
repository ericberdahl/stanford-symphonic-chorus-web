import { DateTime } from 'luxon';

function getDateTime(dateTime, iso) {
    if (dateTime) return dateTime;
    
    return DateTime.fromISO(iso);
}

export function compareISODate(a, b) {
    a = DateTime.fromISO(a);
    b = DateTime.fromISO(b);

    return -b.diff(a).toMillis();
}

export function yearFromISODate(isoDate) {
    return DateTime.fromISO(isoDate).year;
}

export function DayOfMonth({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toFormat('d')
    );
}

export function DayAndDate({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toLocaleString(DateTime.DATE_HUGE)
    );
}

export function FullDate({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toLocaleString(DateTime.DATE_FULL)
    );
}

export function Month({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toFormat('MMM')
    );
}

export function MonthAndYear({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toLocaleString({ month: "long", year: "numeric" })
    );
}

export function TimeOfDay({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toLocaleString(DateTime.TIME_SIMPLE)
    );
}

export function Weekday({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toLocaleString({ weekday: "long" })
    );
}

export function Year({ dateTime, iso }) {
    return (
        getDateTime(dateTime, iso).toFormat('yyyy')
    );
}
