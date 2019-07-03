import { calendar_v3 } from 'googleapis';
import { Credentials } from 'google-auth-library';

//#region Google calendar types
export type CalendarEventRequest = calendar_v3.Params$Resource$Events$List;
export type CalendarEvent = calendar_v3.Schema$Event;
export type CalendarEvents = calendar_v3.Schema$Events;
export type LocalClient = {
  installed: { client_secret: string; client_id: string; redirect_uris: string[] };
};
export type LocalCredential = { client: LocalClient; token: Credentials };
//#endregion
