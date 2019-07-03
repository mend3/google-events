import * as fs from 'fs';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as moment from 'moment';
import { CalendarEvent, LocalClient } from './types';

export const readFile = <T>(path: string, opts = 'utf8'): Promise<T> =>
  new Promise<T>((res, rej) =>
    fs.readFile(path, opts, (err, data) =>
      !!err ? rej(err) : res(JSON.parse(data))
    )
  );

export const authenticate = async (tokenFile: string): Promise<OAuth2Client> =>
  Promise.all<LocalClient, Credentials>([
    readFile<LocalClient>('credentials.json'),
    readFile<Credentials>(tokenFile)
  ]).then(([client, token]) => {
    const { client_secret, client_id, redirect_uris } = client.installed;
    const oAuth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
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
  if (!event || !('end' in event)) return false;
  if (!timeMin || !timeMax) throw new Error('timeMin and timeMax are needed');
  const { end } = event;
  const { dateTime, date } = end;

  const eventDay = moment(dateTime || date);
  const isBetween = eventDay.isBetween(timeMin, timeMax, 'day', '[]');
  const { getDate, getMonth } = new Date();
  const isTodayOcurrence =
    eventDay.date() === getDate() && eventDay.month() === getMonth();

  return isBetween || isTodayOcurrence;
};
