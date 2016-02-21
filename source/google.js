"use strict";

import q from "q";
import {RRule} from "rrule";
import moment from "abl-constants/build/moment";
import {decorate, override} from "core-decorators";
import googleapis from "googleapis";
import {promise, callback} from "./utils/decorators";
import Debuggable from "./utils/debuggable";


// https://developers.google.com/google-apps/calendar/v3/reference/

export default new class GoogleAPI extends Debuggable {

	static key = "GOOGLE_API";

	constructor() {
		super(...arguments);
		this._calendar = googleapis.calendar("v3");
	}

	@override
	getClient() {
		return new googleapis.auth.JWT(
			this.config.service.email,
			this.config.service.keyFile,
			null,
			this.config.service.permissions
		);
	}

	authorize() {
		return q.denodeify(::this.client.authorize)()
			.thenResolve(this.client);
	}

	calendar(objName, action, data) {
		return this.authorize()
			.then(auth => {
				Object.assign(data, {auth});
				return q.denodeify(::this._calendar[objName][action])(data);
			});
	}

	@decorate(callback)
	insertCalendar(done, operator) {
		if (operator.isNew) {
			this.calendar("calendars", "insert", {
					resource: {
						summary: operator.companyName + " Availability"
					}
				})
				.then(result => {
					operator.set("calendarId", result[0].id);
					return this.calendar("acl", "insert", {
						calendarId: operator.calendarId,
						resource: {
							role: "reader",
							scope: {
								type: "default"
							}
						}
					});
				})
				.then(() => {
					done();
				})
				.catch(done)
				.done();
		} else {
			done();
		}
	}

	@decorate(callback)
	deleteCalendar(done, operator) {
		this.calendar("calendars", "delete", {
				calendarId: operator.calendarId
			})
			.then(() => {
				done();
			})
			.catch(done)
			.done();
	}

	@decorate(callback)
	insertTimeSlot(done, timeslot) {
		if (timeslot.single) {
			timeslot.set("untilTime", timeslot.startTime);
		}

		this.fixDate(timeslot);

		return this.calendar("events", timeslot.isNew ? "insert" : "update", {
				calendarId: timeslot.calendarId,
				eventId: timeslot.eventId,
				// sendNotifications: true,
				resource: {
					start: {
						dateTime: timeslot.startTime.toISOString(),
						timeZone: timeslot.timeZone
					},
					end: {
						dateTime: timeslot.endTime.toISOString(),
						timeZone: timeslot.timeZone
					},
					// status: "cancelled",
					recurrence: [
						"RRULE:" + new RRule({
							freq: RRule.WEEKLY,
							byweekday: timeslot.daysRunning,
							until: timeslot.untilTime
						}).toString()
					],
					colorId: "11",
					summary: timeslot.title,
					description: `0/${timeslot.maxOcc} Guests (${timeslot.minOcc} min)`,
					extendedProperties: {
						private: {
							minOcc: timeslot.minOcc,
							maxOcc: timeslot.maxOcc,
							count: "0"
						}
					}
				}
			})
			.then(result => {
				timeslot.set("eventId", result[0].id);
				done();
			})
			.catch(done)
			.done();
	}

	updateTimeSlot(done, timeslot) {
		return this.insertTimeSlot(done, timeslot);
	}

	@decorate(callback)
	deleteTimeSlot(done, timeslot) {
		return this.calendar("events", "delete", {
				calendarId: timeslot.calendarId,
				eventId: timeslot.eventId,
				sendNotifications: true
			})
			.then(() => {
				done();
			})
			.catch(e => {
				// in case time slot was inactivated
				if (e.code === 410) {
					done();
				} else {
					done(e);
				}
			})
			.done();
	}

	@decorate(callback)
	updateEvent(done, event) {
		return this._updateEvent(event)
			.then(() => {
				done();
			})
			.catch(done)
			.done();
	}

	@decorate(promise)
	_updateEvent(event) {
		return this.calendar("events", "update", {
			calendarId: event.calendarId,
			eventId: event.eventInstanceId,
			resource: {
				start: {
					dateTime: event.startTime.toISOString(),
					timeZone: event.timeZone
				},
				end: {
					dateTime: event.endTime.toISOString(),
					timeZone: event.timeZone
				},
				colorId: "11",
				summary: event.title,
				// TODO use statuses from EventController
				// don't require EventController in hook (mongoose best practice)
				// don't import EventController (circular dependency)
				description: event.status === "inactive" ? "Cancelled" : `${event.attendees}/${event.maxOcc} Guests (${event.minOcc} min)`,
				extendedProperties: {
					private: {
						minOcc: event.minOcc,
						maxOcc: event.maxOcc,
						count: event.status === "inactive" ? 0 : event.attendees
					}
				}
			}
		});
	}

	@decorate(callback)
	deleteEvent(done, event) {
		return this._deleteEvent(event)
			.then(() => {
				done();
			})
			.catch(done)
			.done();
	}

	@decorate(promise)
	_deleteEvent(event) {
		return this.calendar("events", "delete", {
				calendarId: event.calendarId,
				eventId: event.eventInstanceId,
				sendNotifications: true
			})
			.catch(e => {
				// in case event was inactivated before google gives 410
				if (e.code !== 410) {
					throw e;
				}
			});
	}

	@decorate(promise)
	getEvent(event) {
		return this.calendar("events", "get", event);
	}

	@decorate(promise)
	getInstances(event) {
		return this.calendar("events", "instances", event);
	}

	fixDate(timeslot) {
		let date = null;

		moment.range(timeslot.startTime, timeslot.untilTime).by("days", day => {
			if (!date && timeslot.daysRunning.indexOf(day.isoWeekday() - 1) !== -1) {
				date = day.toDate();
			}
		});

		if (!date) {
			timeslot.invalidate("startTime", "Date is out of range", timeslot.startTime);
		} else {
			// doesn't call setter
			timeslot.endTime.setMilliseconds(date - timeslot.startTime);
			timeslot.startTime.setMilliseconds(date - timeslot.startTime);
		}
	}
};
