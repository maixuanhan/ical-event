import { Event } from "../src/types/icalendar-event";
import { expect } from "chai";
import "mocha";
import { EEventType, EFreq, EWeekday } from "../src/types/icalendar.types";

describe("rrule YEARLY freq", () => {
    // Every day in January, for 3 years:

    // DTSTART;TZID=America/New_York:19980101T090000

    // RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;
    //  BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA
    // or
    // RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1

    // ==> (1998 9:00 AM EST)January 1-31
    //     (1999 9:00 AM EST)January 1-31
    //     (2000 9:00 AM EST)January 1-31

    it("RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA", () => {
        const event = new Event({
            uid: "yearly1",
            dtstart: new Date(2000, 0, 31, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.YEARLY,
                UNTIL: new Date(2000, 0, 31, 22, 0, 0).getTime(),
                BYMONTH: [1],
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.SUNDAY },
                    { ordwk: 0, weekday: EWeekday.MONDAY },
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.WEDNESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                    { ordwk: 0, weekday: EWeekday.FRIDAY },
                    { ordwk: 0, weekday: EWeekday.SATURDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            {
                start: new Date(1998, 0, 1, 9, 0, 0),
                end: new Date(1998, 0, 31, 9, 0, 0),
            },
            {
                start: new Date(1999, 0, 1, 9, 0, 0),
                end: new Date(1999, 0, 31, 9, 0, 0),
            },
            {
                start: new Date(2000, 0, 1, 9, 0, 0),
                end: new Date(2000, 0, 31, 9, 0, 0),
            },
        ];
        expect(result, "Number of occurrences").length((31 - 1 + 1) * 3);
        expect(result.every(r => resList.some(s => s.start.getTime() <= r.startTime && r.startTime <= s.end.getTime())),
            "Instance values").be.true;
    });

    // Yearly in June and July for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970610T090000
    // RRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7

    // ==> (1997 9:00 AM EDT) June 10;July 10
    //     (1998 9:00 AM EDT) June 10;July 10
    //     (1999 9:00 AM EDT) June 10;July 10
    //     (2000 9:00 AM EDT) June 10;July 10
    //     (2001 9:00 AM EDT) June 10;July 10

    //   Note: Since none of the BYDAY, BYMONTHDAY, or BYYEARDAY
    //   components are specified, the day is gotten from "DTSTART".
    it("RRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7", () => {
        const event = new Event({
            uid: "yearly2",
            dtstart: new Date(1997, 5, 10, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.YEARLY,
                COUNT: 10,
                BYMONTH: [6, 7],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 5, 10, 9, 0, 0),
            new Date(1997, 6, 10, 9, 0, 0),
            new Date(1998, 5, 10, 9, 0, 0),
            new Date(1998, 6, 10, 9, 0, 0),
            new Date(1999, 5, 10, 9, 0, 0),
            new Date(1999, 6, 10, 9, 0, 0),
            new Date(2000, 5, 10, 9, 0, 0),
            new Date(2000, 6, 10, 9, 0, 0),
            new Date(2001, 5, 10, 9, 0, 0),
            new Date(2001, 6, 10, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every other year on January, February, and March for 10
    // occurrences:

    //  DTSTART;TZID=America/New_York:19970310T090000
    //  RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3

    //  ==> (1997 9:00 AM EST) March 10
    //      (1999 9:00 AM EST) January 10;February 10;March 10
    //      (2001 9:00 AM EST) January 10;February 10;March 10
    //      (2003 9:00 AM EST) January 10;February 10;March 10
    it("RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3", () => {
        const event = new Event({
            uid: "yearly2",
            dtstart: new Date(1997, 5, 10, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.YEARLY,
                INTERVAL: 2,
                COUNT: 10,
                BYMONTH: [1, 2, 3],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 2, 10, 9, 0, 0),
            new Date(1999, 0, 10, 9, 0, 0),
            new Date(1999, 1, 10, 9, 0, 0),
            new Date(1999, 2, 10, 9, 0, 0),
            new Date(2001, 0, 10, 9, 0, 0),
            new Date(2001, 1, 10, 9, 0, 0),
            new Date(2001, 2, 10, 9, 0, 0),
            new Date(2003, 0, 10, 9, 0, 0),
            new Date(2003, 1, 10, 9, 0, 0),
            new Date(2003, 2, 10, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });
});
