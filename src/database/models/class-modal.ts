import { ObjectId } from 'mongodb';
import { mongoClient } from '../connection';
import User from './user-modal';

export interface ClassDepartment {
  name: string;
  students: Student[];
}

export interface Student {
  user: User;
  classesAttended: number;
}

export interface CalendarData {
  dayOfWeek: string;
  start: Date;
  end: Date;
  title: string;
  color: string;
}

export interface Subject {
  name: string;
  teacher: User;
  calendar: CalendarData[];
  totalClassesTaken: number;
}

export default class ClassModal {
  private _id?: ObjectId;

  classCode: string;
  classDescription: string;
  department: ClassDepartment;
  subjects: Subject[];

  constructor(
    classCode: string,
    classDescription: string,
    department: ClassDepartment,
    subjects: Subject[],
    id?: ObjectId
  ) {
    this.classCode = classCode;
    this.classDescription = classDescription;
    this.department = department;
    this.subjects = subjects;

    if (id) this._id = id;
  }

  get id() {
    return this._id;
  }

  async save(): Promise<void> {
    const result = await mongoClient.db().collection('classes').insertOne({
      classCode: this.classCode,
      classDescription: this.classDescription,
      department: this.department,
      subjects: this.subjects,
    });
    this._id = result.insertedId;
  }

  async update(): Promise<boolean> {
    const result = await mongoClient.db().collection('classes').updateOne({ _id: this.id }, { $set: this });
    return result.modifiedCount > 0;
  }

  async delete(): Promise<boolean> {
    const result = await mongoClient.db().collection('classes').deleteOne({ _id: this.id });
    return result.deletedCount > 0;
  }

  static async getById(id: string): Promise<ClassModal | null> {
    const data = await mongoClient
      .db()
      .collection('classes')
      .findOne({ _id: new ObjectId(id) });
    if (!data) return null;
    return new ClassModal(data.classCode, data.classDescription, data.department, data.subjects, data._id);
  }

  static async getAll(): Promise<ClassModal[]> {
    const data = await mongoClient.db().collection('classes').find().toArray();
    return data.map(
      (item) => new ClassModal(item.classCode, item.classDescription, item.department, item.subjects, item._id)
    );
  }

  // Update the class department
  updateDepartment(newDepartment: ClassDepartment): void {
    this.department = newDepartment;
  }

  // Add a new student to the class department
  addStudent(newStudent: Student): void {
    this.department.students.push(newStudent);
  }

  // Remove a student from the class department
  removeStudent(studentId: string): void {
    this.department.students = this.department.students.filter((student) => student.user.id !== studentId);
  }

  // Update a specific subject's details
  updateSubject(subjectName: string, updatedSubject: Partial<Subject>): void {
    const subjectIndex = this.subjects.findIndex((sub) => sub.name === subjectName);
    if (subjectIndex !== -1) {
      this.subjects[subjectIndex] = { ...this.subjects[subjectIndex], ...updatedSubject };
    }
  }

  // Update the calendar data for a specific subject
  updateCalendarData(subjectName: string, newCalendarData: CalendarData[]): void {
    const subject = this.subjects.find((sub) => sub.name === subjectName);
    if (subject) {
      subject.calendar = newCalendarData;
    }
  }

  async getCalendarEvents(): Promise<{ start: string; end: string; title: string; color: string; id: string }[]> {
    const events: { start: string; end: string; title: string; color: string; id: string }[] = [];

    if (this.subjects && Array.isArray(this.subjects)) {
      for (const subject of this.subjects) {
        if (subject.calendar && Array.isArray(subject.calendar)) {
          for (const calendarEvent of subject.calendar) {
            if (calendarEvent && calendarEvent.start && calendarEvent.end) {
              events.push({
                start: new Date(calendarEvent.start).toISOString(),
                end: new Date(calendarEvent.end).toISOString(),
                title: calendarEvent.title || '',
                color: calendarEvent.color || '',
                id: `${(subject.name || '').toLowerCase().replace(/\s+/g, '_')}_${this.classCode || ''}`,
              });
            }
          }
        }
      }
    }

    return events;
  }
}
