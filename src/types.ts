import type {Credentials, OAuth2Client} from 'google-auth-library';
import type {calendar_v3 as CalendarV3} from 'googleapis';

export {Credentials, OAuth2Client};

// #region Google calendar types
export type CalendarEventRequest = CalendarV3.Params$Resource$Events$List;
export type CalendarEvent = CalendarV3.Schema$Event;
export type CalendarEvents = CalendarV3.Schema$Events;
export type LocalClient = {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
  };
};
export type LocalCredential = { client: LocalClient; token: Credentials };
export type CalendarID = 'primary' | string;
// #endregion
