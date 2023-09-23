import { DateTime } from 'luxon';

import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

export function createDate(date : string) : DateTime {
    return DateTime.fromFormat(date, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone });
}

export function createDateTime(date : string, timeOfDay : string) : DateTime {
    return DateTime.fromFormat(date + ' ' + timeOfDay, 'yyyy-MM-dd HH:mm', { setZone: serverRuntimeConfig.timezone });
}

export function compareDateTime(a : DateTime, b : DateTime) : number {
    return b.diff(a).toMillis();
}
