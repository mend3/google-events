import { google } from 'googleapis';
import { utc as moment } from 'moment';
import {
  CalendarEvent,
  CalendarEventRequest,
  CalendarEvents,
  CalendarID,
} from './types';
import { authenticate } from './utils';

interface CalendarState {
  syncToken?: string;
  calendarId: CalendarID;
}

/**
 *
 */
export class CalendarService {
  private calendar = google.calendar('v3');
  private state: CalendarState = {
    calendarId: 'primary',
  };

  /**
   *
   * @param tokenFile
   * @param calendarId
   * @return EventsService instance of this class
   */
  public static getInstance(
      tokenFile: string,
      calendarId: CalendarID = 'primary',
  ) {
    return new CalendarService(tokenFile, calendarId);
  }

  /**
   *  authenticates using a token file
   */
  private auth() {
    return authenticate(this.tokenFile);
  }

  /**
   *
   * @param tokenFile
   * @param calendarId
   * @return void
   */
  private constructor(private tokenFile: string, calendarId = 'primary') {
    if (!tokenFile) throw new Error('Token file not provided');
    this.auth = this.auth.bind(this);
    this.state.calendarId = calendarId;
  }

  /**
   * Lists all today events on the user's primary calendar.
   * @throws Error throws error if oAuth is not set.
   * @param min optional minimum date. if max is provided, min must be as well
   * @param max optional maximum date. if min is provided, max must be as well
   */
  public list(min?: Date, max?: Date): Promise<CalendarEvents> {
    const timeMin = moment(min || new Date())
        .format('YYYY-MM-DD')
        .concat('T00:00:00.000Z');
    const timeMax = moment(max || new Date())
        .format('YYYY-MM-DD')
        .concat('T23:59:59.999Z');
    return this.auth().then(async auth => {
      const { calendarId, syncToken } = { ...this.state };
      let params: CalendarEventRequest = {
        timeMin,
        timeMax,
        calendarId,
        singleEvents: true,
      };
      if (syncToken) params = { ...params, syncToken };

      const { data } = await this.calendar.events.list({ ...params, auth });
      const { nextSyncToken } = data;
      if (nextSyncToken) this.state.syncToken = nextSyncToken;

      return data;
    });
  }

  /**
   * get event details
   * @param eventId the event id
   */
  get(eventId: string): Promise<CalendarEvent> {
    return this.auth().then(auth =>
      this.calendar.events
          .get({ auth, calendarId: this.state.calendarId, eventId })
          .then(({ data }) => data),
    );
  }

  /**
   * delete an event
   * @param eventId the event id
   */
  delete(eventId: string): Promise<{ status: number }> {
    return this.auth().then(auth =>
      this.calendar.events
          .delete({
            auth,
            eventId,
            calendarId: this.state.calendarId,
          })
          .then(({ status, data }) => ({ status, data })),
    );
  }

  /**
   * create an event
   * @param eventId the event id
   */
  create(requestBody: CalendarEvent): Promise<CalendarEvent> {
    return this.auth().then(auth =>
      this.calendar.events
          .insert({
            auth,
            requestBody,
            calendarId: this.state.calendarId,
          })
          .then(({ data }) => data),
    );
  }

  /**
   * update an event
   * @param eventId the event id
   * @param payload the new data of the event
   */
  async update(eventId: string, payload: CalendarEvent) {
    const event = await this.get(eventId);
    return this.auth().then(auth =>
      this.calendar.events
          .update({
            auth,
            calendarId: this.state.calendarId,
            eventId,
            requestBody: {
              ...event,
              ...payload,
            },
            sendUpdates: 'all',
          })
          .then(({ data }) => ({ ...data })),
    );
  }
}
