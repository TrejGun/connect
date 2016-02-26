"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _desc, _value, _class, _class2, _temp;
// import {date} from "abl-constants/build/date";


var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _rrule = require("rrule");

var _moment = require("abl-constants/build/moment");

var _moment2 = _interopRequireDefault(_moment);

var _coreDecorators = require("core-decorators");

var _googleapis = require("googleapis");

var _googleapis2 = _interopRequireDefault(_googleapis);

var _decorators = require("./utils/decorators");

var _debuggable = require("./utils/debuggable");

var _debuggable2 = _interopRequireDefault(_debuggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

// https://developers.google.com/google-apps/calendar/v3/reference/

exports.default = new (_dec = (0, _coreDecorators.decorate)(_decorators.callback), _dec2 = (0, _coreDecorators.decorate)(_decorators.callback), _dec3 = (0, _coreDecorators.decorate)(_decorators.callback), _dec4 = (0, _coreDecorators.decorate)(_decorators.callback), _dec5 = (0, _coreDecorators.decorate)(_decorators.callback), _dec6 = (0, _coreDecorators.decorate)(_decorators.promise), _dec7 = (0, _coreDecorators.decorate)(_decorators.callback), _dec8 = (0, _coreDecorators.decorate)(_decorators.promise), _dec9 = (0, _coreDecorators.decorate)(_decorators.promise), _dec10 = (0, _coreDecorators.decorate)(_decorators.promise), _dec11 = (0, _coreDecorators.decorate)(_decorators.promise), (_class = (_temp = _class2 = function (_Debuggable) {
	_inherits(GoogleAPI, _Debuggable);

	function GoogleAPI() {
		var _Object$getPrototypeO;

		_classCallCheck(this, GoogleAPI);

		for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
			arg[_key] = arguments[_key];
		}

		var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(GoogleAPI)).call.apply(_Object$getPrototypeO, [this].concat(arg)));

		_this._calendar = _googleapis2.default.calendar("v3");
		return _this;
	}

	_createClass(GoogleAPI, [{
		key: "getClient",
		value: function getClient() {
			return new _googleapis2.default.auth.JWT(this.config.service.email, this.config.service.keyFile, null, this.config.service.permissions);
		}
	}, {
		key: "authorize",
		value: function authorize() {
			var _context;

			return _q2.default.denodeify((_context = this.client).authorize.bind(_context))().thenResolve(this.client);
		}
	}, {
		key: "calendar",
		value: function calendar(objName, action, data) {
			var _this2 = this;

			return this.authorize().then(function (auth) {
				var _context2;

				Object.assign(data, { auth: auth });
				return _q2.default.denodeify((_context2 = _this2._calendar[objName])[action].bind(_context2))(data);
			});
		}
	}, {
		key: "insertCalendar",
		value: function insertCalendar(done, operator) {
			var _this3 = this;

			if (operator.isNew) {
				this.calendar("calendars", "insert", {
					resource: {
						summary: operator.companyName + " Availability"
					}
				}).then(function (result) {
					operator.set("calendarId", result[0].id);
					return _this3.calendar("acl", "insert", {
						calendarId: operator.calendarId,
						resource: {
							role: "reader",
							scope: {
								type: "default"
							}
						}
					});
				}).then(function () {
					done();
				}).catch(done).done();
			} else {
				done();
			}
		}
	}, {
		key: "deleteCalendar",
		value: function deleteCalendar(done, operator) {
			this.calendar("calendars", "delete", {
				calendarId: operator.calendarId
			}).then(function () {
				done();
			}).catch(done).done();
		}
	}, {
		key: "insertTimeSlot",
		value: function insertTimeSlot(done, timeslot) {
			/* world is not ready for this
   if (timeslot.isStartTimeChanged || timeslot.isEndTimeChanged) {
   	timeslot.set("untilTime", date);
   }
   */

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
					recurrence: ["RRULE:" + new _rrule.RRule({
						freq: _rrule.RRule.WEEKLY,
						byweekday: timeslot.daysRunning,
						until: timeslot.untilTime
					}).toString()],
					colorId: "11",
					summary: timeslot.title,
					description: "0/" + timeslot.maxOcc + " Guests (" + timeslot.minOcc + " min)",
					extendedProperties: {
						private: {
							minOcc: timeslot.minOcc,
							maxOcc: timeslot.maxOcc,
							count: "0"
						}
					}
				}
			}).then(function (result) {
				timeslot.set("eventId", result[0].id);
				done();
			}).catch(done).done();
		}
	}, {
		key: "updateTimeSlot",
		value: function updateTimeSlot(done, timeslot) {
			return this.insertTimeSlot(done, timeslot);
		}
	}, {
		key: "deleteTimeSlot",
		value: function deleteTimeSlot(done, timeslot) {
			return this.calendar("events", "delete", {
				calendarId: timeslot.calendarId,
				eventId: timeslot.eventId,
				sendNotifications: true
			}).then(function () {
				done();
			}).catch(function (e) {
				// in case time slot was inactivated
				if (e.code === 410) {
					done();
				} else {
					done(e);
				}
			}).done();
		}
	}, {
		key: "updateEvent",
		value: function updateEvent(done, event) {
			return this._updateEvent(event).then(function () {
				done();
			}).catch(done).done();
		}
	}, {
		key: "_updateEvent",
		value: function _updateEvent(event) {
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
					description: event.status === "inactive" ? "Cancelled" : event.attendees + "/" + event.maxOcc + " Guests (" + event.minOcc + " min)",
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
	}, {
		key: "deleteEvent",
		value: function deleteEvent(done, event) {
			return this._deleteEvent(event).then(function () {
				done();
			}).catch(done).done();
		}
	}, {
		key: "_deleteEvent",
		value: function _deleteEvent(event) {
			return this.calendar("events", "delete", {
				calendarId: event.calendarId,
				eventId: event.eventInstanceId,
				sendNotifications: true
			}).catch(function (e) {
				// in case event was inactivated before google gives 410
				if (e.code !== 410) {
					throw e;
				}
			});
		}
	}, {
		key: "getEvent",
		value: function getEvent(event) {
			return this.calendar("events", "get", event);
		}
	}, {
		key: "getInstances",
		value: function getInstances(event) {
			return this.calendar("events", "instances", event);
		}
	}, {
		key: "getCalandars",
		value: function getCalandars() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.calendar("calendarList", "list", data);
		}
	}, {
		key: "fixDate",
		value: function fixDate(timeslot) {
			var dateTime = null;

			_moment2.default.range(timeslot.startTime, timeslot.untilTime).by("days", function (day) {
				if (!dateTime && timeslot.daysRunning.indexOf(day.isoWeekday() - 1) !== -1) {
					dateTime = day.toDate();
				}
			});

			if (!dateTime) {
				timeslot.invalidate("startTime", "Date is out of range", timeslot.startTime);
			} else {
				// doesn't call setter
				timeslot.endTime.setMilliseconds(dateTime - timeslot.startTime);
				timeslot.startTime.setMilliseconds(dateTime - timeslot.startTime);
			}
		}
	}]);

	return GoogleAPI;
}(_debuggable2.default), _class2.key = "GOOGLE_API", _temp), (_applyDecoratedDescriptor(_class.prototype, "getClient", [_coreDecorators.override], Object.getOwnPropertyDescriptor(_class.prototype, "getClient"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "insertCalendar", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "insertCalendar"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "deleteCalendar", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "deleteCalendar"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "insertTimeSlot", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "insertTimeSlot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "deleteTimeSlot", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "deleteTimeSlot"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "updateEvent", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "updateEvent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateEvent", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "_updateEvent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "deleteEvent", [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, "deleteEvent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_deleteEvent", [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, "_deleteEvent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getEvent", [_dec9], Object.getOwnPropertyDescriptor(_class.prototype, "getEvent"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getInstances", [_dec10], Object.getOwnPropertyDescriptor(_class.prototype, "getInstances"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "getCalandars", [_dec11], Object.getOwnPropertyDescriptor(_class.prototype, "getCalandars"), _class.prototype)), _class))();