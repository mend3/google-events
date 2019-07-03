import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import * as moment from 'moment';
import { CalendarEvent, CalendarEventRequest, CalendarEvents } from './types';
import { authenticate } from './utils';

export class EventsService {
  private syncToken: string = null;
  private calendar = google.calendar('v3');
  public static getInstance(
    tokenFile: string,
    calendarId = 'primary'
  ): EventsService {
    return new EventsService(tokenFile, calendarId);
  }

  private auth: () => Promise<OAuth2Client> = () =>
    authenticate(this.tokenFile)

  private constructor(
    private tokenFile: string,
    private calendarId = 'primary'
  ) {
    if (!tokenFile) throw new Error('Token file not provided');
  }

  /**
   * Lists all today events on the user's primary calendar.
   * @throws Error throws error if oAuth is not set.
   */
  public async list(min?: Date, max?: Date): Promise<CalendarEvents> {
    const timeMin = moment(min || new Date())
      .format('YYYY-MM-DD')
      .concat('T00:00:00.000Z');
    const timeMax = moment(max || new Date())
      .format('YYYY-MM-DD')
      .concat('T23:59:59.999Z');
    return this.auth().then(async auth => {
      const { calendarId, syncToken } = { ...this };
      let params: CalendarEventRequest = {
        timeMin,
        timeMax,
        calendarId,
        singleEvents: true
      };
      if (!!syncToken) {
        params = { ...params, syncToken };
      }
      return this.calendar.events.list({ ...params, auth }).then(({ data }) => {
        const { nextSyncToken } = data;
        if (!!nextSyncToken) {
          this.syncToken = nextSyncToken;
        }
        return data;
      });
    });
  }

  async get(eventId: string): Promise<CalendarEvent> {
    const { calendarId } = { ...this };
    return this.auth().then(auth =>
      this.calendar.events
        .get({ auth, calendarId, eventId })
        .then(({ data }) => data)
    );
  }

  async delete(
    eventId: string
  ): Promise<{
    status: number;
  }> {
    return this.auth().then(async auth =>
      this.calendar.events
        .delete({
          auth,
          eventId,
          calendarId: this.calendarId
        })
        .then(({ status, data }) => ({ status, data }))
    );
  }

  async create(requestBody: CalendarEvent): Promise<CalendarEvent> {
    return this.auth().then(async auth =>
      this.calendar.events
        .insert({
          auth,
          requestBody,
          calendarId: this.calendarId
        })
        .then(({ data }) => data)
    );
  }

  async update(
    eventId: string,
    payload: CalendarEvent
  ): Promise<CalendarEvent> {
    const event = await this.get(eventId);
    return this.auth().then(async auth => {
      const { calendarId } = { ...this };
      return this.calendar.events
        .update({
          auth,
          calendarId,
          eventId,
          // requestBody /** parse (or not) before send */,
          requestBody: {
            ...event,
            ...payload
          },
          sendUpdates: 'all'
        })
        .then(({ data }) => ({ ...data }));
    });
  }
}

(async () => {
  try {
    // const eventId =
    //   '6srm4p9j68p3ibb26di3ab9kcorj6bb2c5j36bb5cgo3cdhpchh3idj5cc';
    const gapi = EventsService.getInstance('token.json');
    // const data = await gapi.list();
    // const data = await gapi.getById(eventId);
    const requestBody: CalendarEvent = {
      description: 'Nova descrição da api',
      location: 'Intellibrand',
      summary: 'Título from teste 👍',
      visibility: 'public',
      start: {
        dateTime: moment()
          .endOf('day')
          .subtract(8, 'hours')
          .format()
      },
      end: {
        dateTime: moment()
          .endOf('day')
          .subtract(4, 'hours')
          .format()
      }
    };
    // const data = await gapi.update(eventId, requestBody);
    const data = await gapi.create(requestBody);
    // const data = await gapi.delete(eventId);
    console.log(JSON.stringify(data));
  } catch (error) {
    console.error(error.message);
  }
})();
