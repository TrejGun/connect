"use strict";

import Q from "q";
import debug from "debug";
import moment from "moment";
import assert from "power-assert";
import GAPI from "../../source/google";
import {timeZone, date, ISO_8601, googleFormat} from "abl-constants/build/date";

const log = debug("test:googleapi");

describe("Google API", () => {
	if (process.env.GOOGLE_API !== "true") {
		log("Google API was not tested");
		return;
	}

	describe("Common API", () => {
		it("should authorize", () =>
			GAPI.authorize()
				.then(result => {
					log(result[0]);
					assert.ok(result);
				})
		);
	});

	describe("Calendar", () => {
		let calendarId;

		it("should create calendar", () =>
			GAPI.calendar("calendars", "insert", {
					resource: {
						summary: "Title"
					}
				})
				.then(gCalendar => {
					log(gCalendar[0]);
					assert.ok(gCalendar);
					calendarId = gCalendar[0].id;
				})
		);

		it("should list events", () =>
			GAPI.calendar("events", "list", {
					calendarId
				})
				.then(result => {
					log(result[0]);
					assert.ok(result);
				})
		);

		it("should delete calendar", () =>
			GAPI.calendar("calendars", "delete", {
					calendarId
				})
				.then(result => {
					log(result[0]);
					assert.ok(result);
				})
		);
	});

	describe("User", () => {
		const user = "mabp.kiev.ua@gmail.com";
		let calendarId;
		let ruleId;

		before(() =>
			GAPI.calendar("calendars", "insert", {
					resource: {
						summary: "Calendar title"
					}
				})
				.then(gCalendar => {
					calendarId = gCalendar[0].id;
				})
		);

		it("should create user", () =>
			GAPI.calendar("acl", "insert", {
					calendarId,
					resource: {
						role: "reader",
						scope: {
							type: "user",
							value: user
						}
					}
				})
				.then(result => {
					log(result[0]);
					assert.ok(result);
					ruleId = result[0].id;
				})
		);

		it("should delete user", () =>
			GAPI.calendar("acl", "delete", {
					calendarId,
					ruleId
				})
				.then(result => {
					log(result[0]);
					assert.ok(result);
				})
		);

		after(() =>
			GAPI.calendar("calendars", "delete", {
				calendarId
			})
		);
	});

	describe("Event", () => {
		let calendarId;

		before(() =>
			GAPI.calendar("calendars", "insert", {
					resource: {
						summary: "Calendar title"
					}
				})
				.then(gCalendar => {
					calendarId = gCalendar[0].id;
				})
		);

		describe("Recurrent", () => {
			let eventId;
			let eventInstanceId;

			const oldDescription = "event description";
			const newDescription = "event instance description";

			it("should insert event", () => {
				const startDateTime = moment(date).add(-14, "d").add(0, "h").format(ISO_8601);
				const endDateTime = moment(date).add(-14, "d").add(2, "h").format(ISO_8601);
				const recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(14, "d").add(2, "h").format(googleFormat)};BYDAY=MO`;

				return GAPI.calendar("events", "insert", {
						calendarId,
						sendNotifications: true,
						resource: {
							start: {
								dateTime: startDateTime,
								timeZone
							},
							end: {
								dateTime: endDateTime,
								timeZone
							},
							summary: "Appointment",
							location: "Somewhere",
							description: oldDescription,
							recurrence: [recurrence]
						}
					})
					.then(gRecurrentEvent => {
						log("gRecurrentEvent", gRecurrentEvent[0]);
						assert.equal(gRecurrentEvent[0].start.dateTime, startDateTime);
						assert.equal(gRecurrentEvent[0].end.dateTime, endDateTime);
						assert.equal(gRecurrentEvent[0].recurrence[0], recurrence);

						eventId = gRecurrentEvent[0].id;
					});
			});

			it("should list event instances", () =>
				GAPI.calendar("events", "instances", {
						calendarId,
						eventId
					})
					.then(gEventInstances => {
						log("gEventInstances", gEventInstances[0].items);
						assert.ok(gEventInstances[0].items.length >= 5 && gEventInstances[0].items.length <= 7); // 4 ?
						eventInstanceId = gEventInstances[0].items[0].id;
					})
			);

			it("should update event instance", () => {
				const startDateTime = moment(date).add(-14, "d").add(1, "h").format(ISO_8601);
				const endDateTime = moment(date).add(-14, "d").add(3, "h").format(ISO_8601);

				return GAPI.calendar("events", "update", {
						calendarId,
						eventId: eventInstanceId,
						resource: {
							start: {
								dateTime: startDateTime,
								timeZone
							},
							end: {
								dateTime: endDateTime,
								timeZone
							},
							description: newDescription
						}
					})
					.then(gEventInstance => {
						log(gEventInstance[0]);
						assert.equal(gEventInstance[0].id, eventInstanceId);
						assert.equal(gEventInstance[0].start.dateTime, startDateTime);
						assert.equal(gEventInstance[0].end.dateTime, endDateTime);
					});
			});

			it("should get event instance", () => {
				const startDateTime = moment(date).add(-14, "d").add(1, "h").format(ISO_8601);
				const endDateTime = moment(date).add(-14, "d").add(3, "h").format(ISO_8601);

				return GAPI.calendar("events", "get", {
						calendarId,
						eventId: eventInstanceId
					})
					.then(gEventInstance => {
						log(gEventInstance[0]);
						assert.equal(gEventInstance[0].description, newDescription);
						assert.equal(gEventInstance[0].start.dateTime, startDateTime);
						assert.equal(gEventInstance[0].end.dateTime, endDateTime);
					});
			});

			it("should update event", () => {
				const startDateTime = moment(date).add(-14, "d").add(1, "h").format(ISO_8601);
				const endDateTime = moment(date).add(14, "d").add(3, "h").format(ISO_8601);
				const recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(0, "d").add(0, "h").format(googleFormat)};BYDAY=TU`;

				return GAPI.calendar("events", "update", {
						calendarId,
						eventId,
						resource: {
							start: {
								dateTime: startDateTime,
								timeZone
							},
							end: {
								dateTime: endDateTime,
								timeZone
							},
							description: oldDescription,
							recurrence: [recurrence]
						}
					})
					.then(gRecurrentEvent => {
						log("gRecurrentEvent", gRecurrentEvent[0]);
						assert.equal(gRecurrentEvent[0].start.dateTime, startDateTime);
						assert.equal(gRecurrentEvent[0].end.dateTime, endDateTime);
						assert.equal(gRecurrentEvent[0].recurrence[0], recurrence);

						return GAPI.calendar("events", "instances", {
								calendarId,
								eventId
							})
							.then(instances => {
								log(instances[0].items);
								assert.equal(instances[0].items.length, 3);
							});
					});
			});

			it("should get event instance 2", () => {
				const startDateTime = moment(date).add(-14, "d").add(1, "h").format(ISO_8601);
				const endDateTime = moment(date).add(-14, "d").add(3, "h").format(ISO_8601);

				return GAPI.calendar("events", "get", {
						calendarId,
						eventId: eventInstanceId
					})
					.then(gEventInstance => {
						log(gEventInstance[0]);
						assert.equal(gEventInstance[0].description, newDescription);
						assert.equal(gEventInstance[0].start.dateTime, startDateTime);
						assert.equal(gEventInstance[0].end.dateTime, endDateTime);
					});
			});

			after(() =>
				GAPI.calendar("events", "delete", {
					calendarId,
					eventId
				})
			);
		});

		describe("Single", () => {
			let eventId;

			const startDateTime = moment(date).add(1, "d").add(0, "h").format(ISO_8601);
			const endDateTime = moment(date).add(1, "d").add(2, "h").format(ISO_8601);
			const newStartDateTime = moment(date).add(2, "d").add(0, "h").format(ISO_8601);
			const newEndDateTime = moment(date).add(2, "d").add(2, "h").format(ISO_8601);
			const recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(1, "d").add(0, "h").format(googleFormat)};`;
			const newRecurrence = `RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(2, "d").add(0, "h").format(googleFormat)};`;

			it("should insert event", () =>
				GAPI.calendar("events", "insert", {
						calendarId,
						sendNotifications: true,
						resource: {
							start: {
								dateTime: startDateTime,
								timeZone
							},
							end: {
								dateTime: endDateTime,
								timeZone
							},
							summary: "Appointment",
							location: "Somewhere",
							description: "description",
							recurrence: [recurrence]
						}
					})
					.then(gRecurrentEvent => {
						log("gRecurrentEvent", gRecurrentEvent[0]);
						assert.equal(gRecurrentEvent[0].start.dateTime, startDateTime);
						assert.equal(gRecurrentEvent[0].end.dateTime, endDateTime);

						eventId = gRecurrentEvent[0].id;
					})
			);

			it.skip("should get event", () =>
				GAPI.calendar("events", "get", {
						calendarId,
						eventId
					})
					.then(gEventInstance => {
						log(gEventInstance[0]);
						assert.equal(gEventInstance[0].start.dateTime, startDateTime);
						assert.equal(gEventInstance[0].end.dateTime, endDateTime);
					})
			);

			it.skip("should patch event", () =>
				GAPI.calendar("events", "patch", {
						calendarId,
						eventId,
						sendNotifications: false
					})
					.then(gEventInstance => {
						log(gEventInstance[0]);
						assert.ok(gEventInstance);
					})
			);

			it("should update event and timeslot", () =>
				GAPI.calendar("events", "instances", {
						calendarId,
						eventId
					})
					.then(gEventInstances => {
						log("gEventInstances", gEventInstances[0]);
						const eventInstanceId = gEventInstances[0].items[0].id;
						return Q.all([
							GAPI.calendar("events", "update", {
								calendarId,
								eventId,
								resource: {
									start: {
										dateTime: newStartDateTime,
										timeZone
									},
									end: {
										dateTime: newEndDateTime,
										timeZone
									},
									recurrence: [newRecurrence]
								}
							}),
							GAPI.calendar("events", "update", {
								calendarId,
								eventId: eventInstanceId,
								resource: {
									start: {
										dateTime: newStartDateTime,
										timeZone
									},
									end: {
										dateTime: newEndDateTime,
										timeZone
									}
								}
							})
						]).spread(() =>
							Q.all([
								GAPI.calendar("events", "get", {
									calendarId,
									eventId
								}),
								GAPI.calendar("events", "instances", {
									calendarId,
									eventId
								})
							]).spread((gRecurrentEvent, eventInstances) => {
								log("gRecurrentEvent", gRecurrentEvent[0]);
								log("gEventInstances", eventInstances[0]);

								assert.equal(gRecurrentEvent[0].start.dateTime, newStartDateTime);
								assert.equal(gRecurrentEvent[0].end.dateTime, newEndDateTime);
								assert.equal(eventInstances[0].items[0].start.dateTime, newStartDateTime);
								assert.equal(eventInstances[0].items[0].end.dateTime, newEndDateTime);
								assert.equal(eventInstances[0].items.length, 1);
							})
						);
					})
			);

			after(() =>
				GAPI.calendar("events", "delete", {
					calendarId,
					eventId
				})
			);
		});

		after(() =>
			GAPI.calendar("calendars", "delete", {
				calendarId
			})
		);
	});

	describe("Utils", () => {
		describe("fixDate", () => {
			it("should be in range (<=>)", () => {
				const startTime = moment("2015-10-19T00:00:00Z", ISO_8601).toDate();
				const endTime = moment("2015-10-23T01:00:00Z", ISO_8601).toDate();
				const untilTime = moment("2015-10-30T01:00:00Z", ISO_8601).toDate();
				const daysRunning = [0, 1, 2, 3, 4];

				const event = {
					startTime,
					endTime,
					untilTime,
					daysRunning
				};

				GAPI.fixDate(event);

				assert.equal(moment(event.startTime).format(ISO_8601), "2015-10-19T00:00:00Z");
				assert.equal(moment(event.endTime).format(ISO_8601), "2015-10-23T01:00:00Z");
			});

			it("should move forward (>)", () => {
				const startTime = moment("2015-10-19T00:00:00Z", ISO_8601).toDate();
				const endTime = moment("2015-10-19T01:00:00Z", ISO_8601).toDate();
				const untilTime = moment("2015-10-30T01:00:00Z", ISO_8601).toDate();
				const daysRunning = [4];

				const event = {
					startTime,
					endTime,
					untilTime,
					daysRunning
				};

				GAPI.fixDate(event);

				assert.equal(moment(event.startTime).format(ISO_8601), "2015-10-23T00:00:00Z");
				assert.equal(moment(event.endTime).format(ISO_8601), "2015-10-23T01:00:00Z");
			});

			it("should move forward (<>) ", () => {
				const startTime = moment("2015-10-21T00:00:00Z", ISO_8601).toDate();
				const endTime = moment("2015-10-21T01:00:00Z", ISO_8601).toDate();
				const untilTime = moment("2015-10-30T01:00:00Z", ISO_8601).toDate();
				const daysRunning = [0, 4];

				const event = {
					startTime,
					endTime,
					untilTime,
					daysRunning
				};

				GAPI.fixDate(event);

				assert.equal(moment(event.startTime).format(ISO_8601), "2015-10-23T00:00:00Z");
				assert.equal(moment(event.endTime).format(ISO_8601), "2015-10-23T01:00:00Z");
			});

			it("should move forward (<) ", () => {
				const startTime = moment("2015-10-21T00:00:00Z", ISO_8601).toDate();
				const endTime = moment("2015-10-21T01:00:00Z", ISO_8601).toDate();
				const untilTime = moment("2015-10-30T01:00:00Z", ISO_8601).toDate();
				const daysRunning = [0];

				const event = {
					startTime,
					endTime,
					untilTime,
					daysRunning
				};

				GAPI.fixDate(event);

				assert.equal(moment(event.startTime).format(ISO_8601), "2015-10-26T00:00:00Z");
				assert.equal(moment(event.endTime).format(ISO_8601), "2015-10-26T01:00:00Z");
			});

			it("should throw an error", () => {
				const startDate = moment("2015-10-21T00:00:00Z", ISO_8601).toDate();
				const endDate = moment("2015-10-21T01:00:00Z", ISO_8601).toDate();
				const untilTime = moment("2015-10-23T01:00:00Z", ISO_8601).toDate();
				const daysRunning = [0];

				const event = {
					startTime: startDate,
					endTime: endDate,
					untilTime,
					daysRunning
				};

				try {
					GAPI.fixDate(event);
					assert.ifError(event);
				} catch (e) {
					assert.ok(e);
				}
			});
		});
	});

	describe("Move", () => {
		describe("Recurrent", () => {
			let calendarId;
			const eventIds = [];
			const eventInstanceIds = [];

			before(() =>
				GAPI.calendar("calendars", "insert", {
						resource: {
							summary: "Calendar title"
						}
					})
					.then(gCalendar => {
						calendarId = gCalendar[0].id;
					})
			);

			[
				{
					h: 0,
					m: 5
				},
				{
					h: 24,
					m: 0
				},
				{
					h: 24,
					m: 5
				},
				{
					h: 25,
					m: 5
				},
				{
					h: 100,
					m: 0
				}
			].forEach((time, i) => {
				it(`should move event ${JSON.stringify(time)}`, () => {
					const startTime = moment(date).add(0, "h").format(ISO_8601);
					const endTime = moment(date).add(1, "h").format(ISO_8601);

					return GAPI.calendar("events", "insert", {
							calendarId,
							sendNotifications: true,
							resource: {
								start: {
									dateTime: startTime,
									timeZone
								},
								end: {
									dateTime: endTime,
									timeZone
								},
								summary: `Appointment ${i}`,
								location: "Somewhere",
								description: "some descrition",
								recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(48, "h").format(googleFormat)};BYDAY=MO,TU,WE,TH,FR,SA,SU;`]
							}
						})
						.then(gRecurrentEvent => {
							log(gRecurrentEvent[0]);

							eventIds[i] = gRecurrentEvent[0].id;

							return GAPI.calendar("events", "instances", {
									calendarId,
									eventId: eventIds[i]
								})
								.then(gEventInstances => {
									log(gEventInstances[0].items);

									assert.equal(gEventInstances[0].items.length, 3);

									eventInstanceIds[i] = gEventInstances[0].items[0].id;

									const newStartTime = moment(date).add(time.h, "h").add(time.m, "m").format(ISO_8601);
									const newEndTime = moment(date).add(1 + time.h, "h").add(time.m, "m").format(ISO_8601);

									return GAPI.calendar("events", "update", {
											calendarId,
											eventId: eventInstanceIds[i],
											resource: {
												start: {
													dateTime: newStartTime,
													timeZone
												},
												end: {
													dateTime: newEndTime,
													timeZone
												},
												description: "new description"
											}
										})
										.then(gEventInstance => {
											log(gEventInstance[0]);
											assert.equal(gEventInstance[0].id, eventInstanceIds[i]);
											assert.equal(gEventInstance[0].start.dateTime, newStartTime);
											assert.equal(gEventInstance[0].end.dateTime, newEndTime);
										});
								});
						});
				});
			});

			after(() =>
				GAPI.calendar("calendars", "delete", {
					calendarId
				})
			);
		});

		describe("Single", () => {
			let calendarId;
			const eventIds = [];
			const eventInstanceIds = [];

			before(() =>
				GAPI.calendar("calendars", "insert", {
						resource: {
							summary: "Calendar title"
						}
					})
					.then(gCalendar => {
						calendarId = gCalendar[0].id;
					})
			);

			[
				{
					h: 0,
					m: 5
				},
				{
					h: 24,
					m: 0
				},
				{
					h: 24,
					m: 5
				},
				{
					h: 25,
					m: 5
				},
				{
					h: 100,
					m: 0
				}
			].forEach((time, i) => {
				it(`should move event ${JSON.stringify(time)}`, () => {
					const startTime = moment(date).add(0, "h").format(ISO_8601);
					const endTime = moment(date).add(1, "h").format(ISO_8601);

					return GAPI.calendar("events", "insert", {
							calendarId,
							sendNotifications: true,
							resource: {
								start: {
									dateTime: startTime,
									timeZone
								},
								end: {
									dateTime: endTime,
									timeZone
								},
								summary: `Appointment ${i}`,
								location: "Somewhere",
								description: "some descrition",
								recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${moment(date).add(0, "h").format(googleFormat)};`]
							}
						})
						.then(gRecurrentEvent => {
							log("gRecurrentEvent", gRecurrentEvent[0]);

							eventIds[i] = gRecurrentEvent[0].id;

							return GAPI.calendar("events", "instances", {
									calendarId,
									eventId: eventIds[i]
								})
								.then(gEventInstances => {
									log("gEventInstances", gEventInstances[0].items);

									assert.equal(gEventInstances[0].items.length, 1);

									eventInstanceIds[i] = gEventInstances[0].items[0].id;

									const newStartTime = moment(date).add(time.h, "h").add(time.m, "m").format(ISO_8601);
									const newEndTime = moment(date).add(1 + time.h, "h").add(time.m, "m").format(ISO_8601);

									return GAPI.calendar("events", "update", {
											calendarId,
											eventId: eventInstanceIds[i],
											resource: {
												start: {
													dateTime: newStartTime,
													timeZone
												},
												end: {
													dateTime: newEndTime,
													timeZone
												},
												description: "new description"
											}
										})
										.then(gEventInstance => {
											log("UPDATE", gEventInstance[0]);
											assert.equal(gEventInstance[0].id, eventInstanceIds[i]);
											assert.equal(gEventInstance[0].start.dateTime, newStartTime);
											assert.equal(gEventInstance[0].end.dateTime, newEndTime);
										});
								});
						});
				});
			});

			after(() =>
				GAPI.calendar("calendars", "delete", {
					calendarId
				})
			);
		});
	});
});
