"use strict";

import q from "q";
import asyncq from "async-q";
import GAPI from "../google";

// {calendarId: "4qijgthmeohd0ie4t9abh2k42o@group.calendar.google.com"}
const operators = [];

GAPI.getCalandars()
    .then(res => {
        return res[0].items.filter(calendar => !operators.find(operator => operator.calendarId === calendar.id));
    })
    .then(res => {
        return asyncq.mapLimit(res, 5, calendar => {
            return q.delay(5000)
                .then(() => {
                    const deferred = q.defer();
                    GAPI.deleteCalendar(deferred.makeNodeResolver(), {calendarId: calendar.id});
                    return deferred.promise
                        .catch(e => {
                            console.log("Error!!!", e);
                        });
                });
        });
    })
    .finally(() => {process.exit(0);});
