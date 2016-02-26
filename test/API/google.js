"use strict";

import assert from "power-assert";
import q from "q";
import asyncq from "async-q";
import GAPI from "../../source/google";
import {timeZone, startDate, endDate, untilDate, daysRunning} from "abl-constants/build/date";


describe("#GOOGLE API", () => {
	const operators = [];

	function setOperator(operator) {
		if (operator.calendarId) {
			if (operators.indexOf(operator) === -1) {
				operators.push(operator);
			}
		}
	}

	function getOperator(arg) {
		return Object.assign({
			isNew: true,
			companyName: "SuperCompanyName",
			set(calId, resultId) {
				this[calId] = resultId;
			}
		}, arg);
	}

	function getTimeSlot(arg) {
		return Object.assign({
			timeZone,
			startTime: startDate,
			endTime: endDate,
			untilTime: untilDate,
			daysRunning,
			isNew: true,
			calendarId: operators[0].calendarId,
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
		}, arg);
	}

	function delay(ms) {
		return q.delay(ms);
	}


	describe("#insertCalendar and deleteCalendar", () => {
		it("insertCalendar with new operator", done => {
			const operator = getOperator({});
			const pattern = /\w*(?=@)@?\w*\.\w*\.\w*\.\w*/;
			GAPI.insertCalendar(() => {
				setOperator(operator);
				assert.ok(pattern.test(operator.calendarId));
				done();
			}, operator);
		});

		it("insertCalendar with not new operator", () => {
			const operator = getOperator({
				isNew: false
			});
			const done = () => {
				throw new Error("operator is not new");
			};
			assert.throws(() => {
				GAPI.insertCalendar(done, operator);
			}, e => e.message === "operator is not new");
		});

		it("insertCalendar with invalid calendarId", done => {
			const operator = {
				isNew: true,
				isFirst: true,
				companyName: "SuperCompanyName - 2",
				set(calId, resultId) {
					this[calId] = resultId;
				},
				get calendarId() {
					if (this.isFirst) {
						this.isFirst = false;
						return null;
					} else {
						return this._calendarId;
					}
				},
				set calendarId(calendarId) {
					this._calendarId = calendarId;
				}
			};


			const err = e => {
				setOperator(operator);
				assert.equal(e.message, "Missing required parameters: calendarId");
				done();
			};

			GAPI.insertCalendar(err, operator);
		});
	});

	describe("insertTimeSlot, updateTimeSlot", () => {
		let timeslot;

		beforeEach("...", () => {
			timeslot = getTimeSlot();
		});

		it("insertTimeSlot new timeslot", done => {
			GAPI.insertTimeSlot(() => {
				assert.ok(timeslot.eventId !== null);
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

		before(done => {
			timeslot = getTimeSlot();
			timeslot.title = "deleteTimeSlot TEST";

			GAPI.insertTimeSlot(() => {
				done();
			}, timeslot);
		});

		it("deleteTimeSlot with success status change to cancelled", done => {
			const err = () => {
				GAPI.calendar("events", "get", {
						calendarId: timeslot.calendarId,
						eventId: timeslot.eventId
					})
					.then(res => {
						assert.equal(res[0].status, "cancelled");
					})
					.done(done);
			};
			GAPI.deleteTimeSlot(err, timeslot);
		});

		it("deleteTimeSlot in case time slot was inactivated", done => {
			GAPI.deleteTimeSlot(done, timeslot);
		});

		it("deleteTimeSlot with fake eventId", done => {
			timeslot.eventId = "fakeId";

			const err = e => {
				assert.equal(e.message, "Not Found");
				done();
			};
			GAPI.deleteTimeSlot(err, timeslot);
		});
	});

	describe("updateEvent", () => {
		let event;

		before(done => {
			event = getTimeSlot();
			event.title = "updateEvent TEST";

			GAPI.insertTimeSlot(() => {
				done();
			}, event);
		});

		it("updateEvent should update maxOcc", done => {
			event.maxOcc = "50";
			event.eventInstanceId = event.eventId;
			const err = () => {
				GAPI.getEvent(event)
					.then((res) => {
						assert.equal(res[0].extendedProperties.private.maxOcc, "50");
					})
					.done(done);
			};
			GAPI.updateEvent(err, event);
		});

		it("updateEvent with eventInstanceId = null", done => {
			event.maxOcc = "100";
			event.eventInstanceId = null;
			event.status = "inactive";

			const err = (e) => {
				assert.equal(e.message, "Missing required parameters: eventId");
				done();
			};
			GAPI.updateEvent(err, event);
		});
	});

	describe("deleteEvent", () => {
		let event;

		before(done => {
			event = getTimeSlot();
			event.title = "deleteEvent TEST";
			event.eventInstanceId = null;

			GAPI.insertTimeSlot(() => {
				done();
			}, event);
		});

		it("deleteEvent with valid event", done => {
			const err = () => {
				GAPI.getEvent(event)
					.then((res) => {
						assert.equal(res[0].status, "cancelled");
					})
					.done(done);
			};

			GAPI.getEvent(event)
				.then(res => {
					event.eventInstanceId = res[0].id;
				})
				.then(() =>
					GAPI.deleteEvent(err, event)
				);
		});

		it("deleteEvent in case of a 410 error", done => {
			GAPI.deleteEvent(done, event);
		});

		it("deleteEvent in case of a 404 error", done => {
			event.eventInstanceId = "fakeId0000111";

			const err = e => {
				assert.equal(e.code, "404");
				done();
			};

			GAPI.deleteEvent(err, event);
		});
	});

	describe("getInstances", () => {
		let event;

		before(done => {
			event = getTimeSlot();
			event.title = "getInstances TEST";
			event.eventInstanceId = null;

			GAPI.insertTimeSlot(() => {
				done();
			}, event);
		});

		it("getInstances from timeSlot", done => {
			GAPI.getInstances(event)
				.then(res => {
					assert.ok(res[0].items.length > 14);
				})
				.done(done);
		});
	});

	describe("getCalandars", () => {
		it("getCalandars ALL", done => {
			GAPI.getCalandars()
				.then(res => {
					const cals = res[0].items.concat();
					cals.filter(calendar => operators.find(operator => operator.calendarId === calendar.id || operator._calendarId === calendar.id));
					assert.deepEqual(cals, res[0].items);
				})
				.then(done);
		});

		it("getCalandars with request object", done => {
			GAPI.getCalandars({})
				.then(res => {
					const cals = res[0].items.concat();
					cals.filter(calendar => operators.find(operator => operator.calendarId === calendar.id || operator._calendarId === calendar.id));
					assert.deepEqual(cals, res[0].items);
				})
				.then(done);
		});
	});

	after("Delete all calendars", () =>
		asyncq.mapLimit(operators, 5, oper =>
			delay(5000)
				.then(() => {
					const deferred = q.defer();
					GAPI.deleteCalendar(deferred.makeNodeResolver(), oper);
					return deferred.promise;
				})
		)
	);
});
