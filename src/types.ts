import { calendar_v3 } from 'googleapis';
import { Credentials } from 'google-auth-library';

//#region Google calendar types
export type EventMetadata = {
  id: string;
  description: string;
  summary: string;
};
export type EventInfo = EventMetadata & {
  responsavel: string;
  tipo: string;
  partes?: string;
  processo?: string;
  vara?: string;
  local?: string;
  status: 'done' | 'ongoing' | 'expired';
  type: 'success' | 'danger' | 'info';
  nextState: 'done' | 'ongoing';
  isDone: boolean;
  isExpired: boolean;
  isAllDay: boolean;
  recurringId: string;
  start: string;
  startTimeZone?: string;
  end: string;
  endTimeZone?: string;
};

export type CalendarEventRequest = calendar_v3.Params$Resource$Events$List;

export type Calendar = calendar_v3.Calendar;

export type CalendarEvent = calendar_v3.Schema$Event;
export type CalendarEvents = calendar_v3.Schema$Events;

export type CallbackParam = calendar_v3.Params$Resource$Events$List;

export type LocalClient = {
  installed: { client_secret: any; client_id: any; redirect_uris: any };
};
export type LocalCredential = { client: LocalClient; token: Credentials };
//#endregion
