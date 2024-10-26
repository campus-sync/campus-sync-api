import express from 'express';
import { addClassHandler } from '../handlers/class/add-class-handler';
import { deleteClassHandler } from '../handlers/class/delete-class-handler';
import { updateClassHandler } from '../handlers/class/update-class-handler';
import { listClassesHandler } from '../handlers/class/list-classes-handler';
import { listCalendarsHandler } from '../handlers/class/list-calendars-handler';

const ClassRouter = express.Router();

// Route to add a new class
ClassRouter.post('/add', addClassHandler);

// Route to delete a class
ClassRouter.delete('/delete', deleteClassHandler);

// Route to update a class
ClassRouter.patch('/update', updateClassHandler);

// Route to list all classes
ClassRouter.get('/list', listClassesHandler);

ClassRouter.get('/calendar/list', listCalendarsHandler);

export default ClassRouter;
