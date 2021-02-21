import { utc as moment } from 'moment';
import { CalendarEvent } from './types';
import { CalendarService } from './CalendarService';

const service = CalendarService.getInstance('token.json');
const requestBody: CalendarEvent = {
  description: 'Event description',
  location: 'Google',
  summary: 'Created by api 👍',
  visibility: 'public',
  start: {
    dateTime: moment().endOf('day').subtract(8, 'hours').format(),
  },
  end: {
    dateTime: moment().endOf('day').subtract(4, 'hours').format(),
  },
};

(async () => {
  try {
    console.log(requestBody);
    await service.list().then(JSON.stringify).then(console.log);
    // const eventById = await service.getById(eventId);
    // const deletedEvent = await service.delete(eventId);
    // const updatedEvent = await service.update(eventId, requestBody);
    // const data = await service.create(requestBody);
  } catch (error) {
    console.error(error.message);
  }
})();
