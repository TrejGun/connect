"use strict";

import assert from "power-assert";
import async from "async";
import GAPI from "../../source/google";
import moment from "moment-config-trejgun";
import {timeZone, startTime, endTime, untilTime, daysRunning, ISO_8601} from "abl-constants/build/date";
import {getEventInstanceId} from "abl-utils/build/event";

describe("#GOOGLE API", () => {
	function getOperator(operator) {
		return Object.assign({
			companyName: "SuperCompanyName",
			set(calId, resultId) {
				this[calId] = resultId;
			}
		}, operator);
	}

	function getTimeSlot(timeslot) {
		return Object.assign({
			timeZone,
			startTime,
			endTime,
			untilTime,
			daysRunning,
			eventId: null,
			title: "insertTimeSlot TEST",
			minOcc: "2",
			maxOcc: "5",
			set(eventId, resultId) {
				this[eventId] = resultId;
			},
			invalidate(item, message) {
				this.title = message;
			}
		}, timeslot);
	}

	describe("#insertCalendar and deleteCalendar", () => {
		let operator;

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("insertCalendar with new operator", done => {
			operator = getOperator();
			GAPI.insertCalendar(() => {
				assert.ok(/\w*(?=@)@?\w*\.\w*\.\w*\.\w*/.test(operator.calendarId));
				done();
			}, operator);
		});
	});

	describe("insertTimeSlot, updateTimeSlot", () => {
		let timeslot;
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		beforeEach(() => {
			timeslot = getTimeSlot(operator);
		});

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("insertTimeSlot new timeslot", done => {
			GAPI.insertTimeSlot(() => {
				assert.ok(timeslot.eventId);
				done();
			}, timeslot);
		});

		it("insertTimeSlot fixDate if !date", done => {
			timeslot.daysRunning = [];
			GAPI.insertTimeSlot(() => {
				assert.equal(timeslot.title, "Date is out of range");
				done();
			}, timeslot);
		});

		it("insertTimeSlot not new timeslot (update)", done => {
			timeslot.isNew = false;
			timeslot.maxOcc = "10";
			GAPI.insertTimeSlot(() => {
				assert.ok(timeslot.maxOcc !== "5");
				done();
			}, timeslot);
		});

		it("insertTimeSlot with single timeslot", done => {
			timeslot.isNew = true;
			timeslot.untilTime = null;
			timeslot.single = true;
			GAPI.insertTimeSlot(() => {
				assert.ok(timeslot.untilTime === timeslot.startTime);
				done();
			}, timeslot);
		});

		it("updateTimeSlot", done => {
			timeslot.isNew = false;
			timeslot.maxOcc = "20";
			GAPI.updateTimeSlot(() => {
				assert.ok(timeslot.maxOcc === "20");
				done();
			}, timeslot);
		});
	});

	describe("deleteTimeSlot", () => {
		let timeslot;
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		beforeEach(done => {
			timeslot = getTimeSlot(operator);
			GAPI.insertTimeSlot(done, timeslot);
		});

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("deleteTimeSlot with success status change to cancelled", done => {
			GAPI.deleteTimeSlot(() => {
				GAPI.calendar("events", "get", {
						calendarId: timeslot.calendarId,
						eventId: timeslot.eventId
					})
					.then(res => {
						assert.equal(res[0].status, "cancelled");
					})
					.done(done);
			}, timeslot);
		});

		it("deleteTimeSlot in case time slot was inactivated", done => {
			GAPI.deleteTimeSlot(done, timeslot);
		});

		it("deleteTimeSlot with fake eventId", done => {
			timeslot.eventId = "fakeId";
			GAPI.deleteTimeSlot(e => {
				assert.equal(e.message, "Not Found");
				done();
			}, timeslot);
		});
	});

	describe("updateEvent", () => {
		let timeslot;
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		beforeEach(done => {
			timeslot = getTimeSlot(operator);
			GAPI.insertTimeSlot(done, timeslot);
		});

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("updateEvent should update maxOcc", done => {
			const newMaxOcc = 50;
			const newTitle = "qwerty";
			GAPI.updateEvent(() => {
				GAPI.getInstances(timeslot)
					.then(gEventInstances => {
						const gEventInstance = gEventInstances[0].items.sort((a, b) => new Date(a.originalStartTime.dateTime) - new Date(b.originalStartTime.dateTime))[0];
						assert.equal(gEventInstance.summary, newTitle);
						assert.equal(gEventInstance.extendedProperties.private.maxOcc, newMaxOcc);
					})
					.done(done);
			}, Object.assign({}, timeslot, {
				title: newTitle,
				maxOcc: newMaxOcc,
				eventInstanceId: getEventInstanceId(timeslot.eventId, startTime),
				eventId: null
			}));
		});

		it("updateEvent with eventInstanceId = null", done => {
			GAPI.updateEvent(e => {
				assert.equal(e.message, "Missing required parameters: eventId");
				done();
			}, timeslot);
		});
	});

	describe("deleteEvent", () => {
		let timeslot;
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		beforeEach(done => {
			timeslot = getTimeSlot(operator);
			GAPI.insertTimeSlot(done, timeslot);
		});

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("deleteEvent with valid event", done => {
			GAPI.deleteEvent(() => {
				GAPI.getInstances(timeslot)
					.then(gEventInstances => {
						gEventInstances[0].items.sort((a, b) => new Date(a.originalStartTime.dateTime) - new Date(b.originalStartTime.dateTime))
							.forEach((instance, i) => {
								assert.equal(moment.tz(instance.start.dateTime, instance.start.timeZone).tz("UTC").format(ISO_8601), moment(startTime).tz("UTC").add(i + 1, "d").format(ISO_8601));
							});
					})
					.done(done);
			}, Object.assign({}, timeslot, {
				eventInstanceId: getEventInstanceId(timeslot.eventId, startTime),
				eventId: null
			}));
		});

		it("deleteEvent in case of a 410 error", done => {
			GAPI.deleteEvent(() => {
				GAPI.deleteEvent(assert.ifError, Object.assign({}, timeslot, {
						eventInstanceId: getEventInstanceId(timeslot.eventId, startTime),
						eventId: null
					}))
					.done(done);
			}, Object.assign({}, timeslot, {
				eventInstanceId: getEventInstanceId(timeslot.eventId, startTime),
				eventId: null
			}));
		});

		it("deleteEvent in case of a 404 error", done => {
			GAPI.deleteEvent(e => {
				assert.equal(e.code, "404");
				done();
			}, Object.assign({}, timeslot, {
				eventInstanceId: "qwerty",
				eventId: null
			}));
		});
	});

	describe("getInstances", () => {
		let timeslot;
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		beforeEach(done => {
			timeslot = getTimeSlot(operator);
			GAPI.insertTimeSlot(done, timeslot);
		});

		after(done => {
			GAPI.deleteCalendar(done, operator);
		});

		it("getInstances from timeSlot", done => {
			GAPI.getInstances(timeslot)
				.then(res => {
					assert.ok(res[0].items.length > 14);
				})
				.done(done);
		});
	});

	describe("getCalandars", () => {
		let operator;

		before(done => {
			operator = getOperator();
			GAPI.insertCalendar(done, operator);
		});

		it.only("getCalandars ALL", done => {
			GAPI.getCalandars()
				.then(res => {
					assert.ok(res[0].items.find(calendar => calendar.id === operator.calendarId));
				})
				.done(done);
		});
	});

	after("Delete all calendars", function (done) {
		GAPI.getCalandars()
			.then(res => {
				this.timeout(res[0].items * 2 * 1000);
				async.eachLimit(res[0].items, 1, (calendar, callback) => GAPI.deleteCalendar(callback, {calendarId: calendar.id}), done);
			});
	});
});
