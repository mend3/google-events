import * as fs from 'fs';
import { google } from 'googleapis';
import { utc as moment } from 'moment';
import { CalendarEvent, Credentials, LocalClient } from './types';

export const readFile = <T>(path: string, opts = 'utf8'): Promise<T> =>
  new Promise<T>((res, rej) =>
    fs.readFile(path, opts, (err, data) => {
      if (err) {
        console.error(err);
        return rej(err);
      }
      return res(JSON.parse(data));
    }),
  );

export const authenticate = (tokenFile: string) =>
  Promise.all([
    readFile<LocalClient>('credentials.json'),
    readFile<Credentials>(tokenFile),
  ]).then(([client, token]) => {
    const { client_secret, client_id, redirect_uris } = client.installed;
    const oAuth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
    );
    oAuth.setCredentials(token);
    return oAuth;
  });

export const dateRangeFilter: (
  event: CalendarEvent,
  index: number,
  timeMin: string,
  timeMax: string
) => boolean = (event, _, timeMin, timeMax) => {
  try {
    if (!event || !('end' in event)) return false;
    if (!timeMin || !timeMax) throw new Error('timeMin and timeMax are needed');
    const { end } = event;
    if (!end) throw new Error('Event has no end');
    const { dateTime, date } = end;

    const eventDay = moment(dateTime || date);
    const isBetween = eventDay.isBetween(timeMin, timeMax, 'day', '[]');
    const { getDate, getMonth } = new Date();
    const isTodayOcurrence =
      eventDay.date() === getDate() && eventDay.month() === getMonth();

    return isBetween || isTodayOcurrence;
  } catch (error) {
    console.error(error);
    return false;
  }
};
