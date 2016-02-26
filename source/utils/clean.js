"use strict";

import q from "q";
import asyncq from "async-q";
import GAPI from "../google";


export default function clean(operators) {
	GAPI.getCalandars()
		.then(res =>
			res[0].items.filter(calendar => !operators.find(operator => operator.calendarId === calendar.id))
		)
		.then(res =>
			asyncq.mapLimit(res, 5, calendar =>
				q.delay(5000)
					.then(() => {
						const deferred = q.defer();
						GAPI.deleteCalendar(deferred.makeNodeResolver(), {calendarId: calendar.id});
						return deferred.promise;
					})
			)
		);
}
