import { Event } from "../src/types/icalendar-event";
import { Helper } from "../src/icalendar-helper";
import { expect } from "chai";
import "mocha";
import { EEventType } from "../src/types/icalendar.types";

const helper = new Helper();

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
            dtstart: helper.parseDateOrDateTime("19980101T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA"),
        });
        const result = event.expandRrule();
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
            dtstart: helper.parseDateOrDateTime("19970610T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7"),
        });
        const result = event.expandRrule();
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
            uid: "yearly3",
            dtstart: helper.parseDateOrDateTime("19970310T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3"),
        });
        const result = event.expandRrule();
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

    // Every third year on the 1st, 100th, and 200th day for 10
    // occurrences:

    //  DTSTART;TZID=America/New_York:19970101T090000
    //  RRULE:FREQ=YEARLY;INTERVAL=3;COUNT=10;BYYEARDAY=1,100,200

    //  ==> (1997 9:00 AM EST) January 1
    //      (1997 9:00 AM EDT) April 10;July 19
    //      (2000 9:00 AM EST) January 1
    //      (2000 9:00 AM EDT) April 9;July 18
    //      (2003 9:00 AM EST) January 1
    //      (2003 9:00 AM EDT) April 10;July 19
    //      (2006 9:00 AM EST) January 1
    it("RRULE:FREQ=YEARLY;INTERVAL=3;COUNT=10;BYYEARDAY=1,100,200", () => {
        const event = new Event({
            uid: "yearly4",
            dtstart: helper.parseDateOrDateTime("19970101T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;INTERVAL=3;COUNT=10;BYYEARDAY=1,100,200"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 0, 1, 9, 0, 0),
            new Date(1997, 3, 10, 9, 0, 0),
            new Date(1997, 6, 19, 9, 0, 0),
            new Date(2000, 0, 1, 9, 0, 0),
            new Date(2000, 3, 9, 9, 0, 0),
            new Date(2000, 6, 18, 9, 0, 0),
            new Date(2003, 0, 1, 9, 0, 0),
            new Date(2003, 3, 10, 9, 0, 0),
            new Date(2003, 6, 19, 9, 0, 0),
            new Date(2006, 0, 1, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every 20th Monday of the year, forever:

    // DTSTART;TZID=America/New_York:19970519T090000
    // RRULE:FREQ=YEARLY;BYDAY=20MO

    // ==> (1997 9:00 AM EDT) May 19
    //     (1998 9:00 AM EDT) May 18
    //     (1999 9:00 AM EDT) May 17
    //     ...
    it("RRULE:FREQ=YEARLY;BYDAY=20MO", () => {
        const event = new Event({
            uid: "yearly5",
            dtstart: helper.parseDateOrDateTime("19970519T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;BYDAY=20MO"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 4, 19, 9, 0, 0),
            new Date(1998, 4, 18, 9, 0, 0),
            new Date(1999, 4, 17, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length.is.greaterThan(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Monday of week number 20 (where the default start of the week is
    //     Monday), forever:

    //      DTSTART;TZID=America/New_York:19970512T090000
    //      RRULE:FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO

    //      ==> (1997 9:00 AM EDT) May 12
    //          (1998 9:00 AM EDT) May 11
    //          (1999 9:00 AM EDT) May 17
    //          ...
    it("RRULE:FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO", () => {
        const event = new Event({
            uid: "yearly6",
            dtstart: helper.parseDateOrDateTime("19970512T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 4, 12, 9, 0, 0),
            new Date(1998, 4, 11, 9, 0, 0),
            new Date(1999, 4, 17, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length.is.greaterThan(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every Thursday in March, forever:

    // DTSTART;TZID=America/New_York:19970313T090000
    // RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=TH

    // ==> (1997 9:00 AM EST) March 13,20,27
    //     (1998 9:00 AM EST) March 5,12,19,26
    //     (1999 9:00 AM EST) March 4,11,18,25
    //     ...
    it("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=TH", () => {
        const event = new Event({
            uid: "yearly7",
            dtstart: helper.parseDateOrDateTime("19970313T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=TH"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 2, 13, 9, 0, 0),
            new Date(1997, 2, 20, 9, 0, 0),
            new Date(1997, 2, 27, 9, 0, 0),
            new Date(1998, 2, 5, 9, 0, 0),
            new Date(1998, 2, 12, 9, 0, 0),
            new Date(1998, 2, 19, 9, 0, 0),
            new Date(1998, 2, 26, 9, 0, 0),
            new Date(1999, 2, 4, 9, 0, 0),
            new Date(1999, 2, 11, 9, 0, 0),
            new Date(1999, 2, 18, 9, 0, 0),
            new Date(1999, 2, 25, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length.is.greaterThan(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every Thursday, but only during June, July, and August, forever:

    // DTSTART;TZID=America/New_York:19970605T090000
    // RRULE:FREQ=YEARLY;BYDAY=TH;BYMONTH=6,7,8

    // ==> (1997 9:00 AM EDT) June 5,12,19,26;July 3,10,17,24,31;
    //                        August 7,14,21,28
    //     (1998 9:00 AM EDT) June 4,11,18,25;July 2,9,16,23,30;
    //                        August 6,13,20,27
    //     (1999 9:00 AM EDT) June 3,10,17,24;July 1,8,15,22,29;
    //                        August 5,12,19,26
    //     ...
    it("RRULE:FREQ=YEARLY;BYDAY=TH;BYMONTH=6,7,8", () => {
        const event = new Event({
            uid: "yearly8",
            dtstart: helper.parseDateOrDateTime("19970605T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;BYDAY=TH;BYMONTH=6,7,8"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 5, 5, 9, 0, 0),
            new Date(1997, 5, 12, 9, 0, 0),
            new Date(1997, 5, 19, 9, 0, 0),
            new Date(1997, 5, 26, 9, 0, 0),
            new Date(1997, 6, 3, 9, 0, 0),
            new Date(1997, 6, 10, 9, 0, 0),
            new Date(1997, 6, 17, 9, 0, 0),
            new Date(1997, 6, 24, 9, 0, 0),
            new Date(1997, 6, 31, 9, 0, 0),
            new Date(1997, 7, 7, 9, 0, 0),
            new Date(1997, 7, 14, 9, 0, 0),
            new Date(1997, 7, 21, 9, 0, 0),
            new Date(1997, 7, 28, 9, 0, 0),
            new Date(1998, 5, 4, 9, 0, 0),
            new Date(1998, 5, 11, 9, 0, 0),
            new Date(1998, 5, 18, 9, 0, 0),
            new Date(1998, 5, 25, 9, 0, 0),
            new Date(1998, 6, 2, 9, 0, 0),
            new Date(1998, 6, 9, 9, 0, 0),
            new Date(1998, 6, 16, 9, 0, 0),
            new Date(1998, 6, 23, 9, 0, 0),
            new Date(1998, 6, 30, 9, 0, 0),
            new Date(1998, 7, 6, 9, 0, 0),
            new Date(1998, 7, 13, 9, 0, 0),
            new Date(1998, 7, 20, 9, 0, 0),
            new Date(1998, 7, 27, 9, 0, 0),
            new Date(1999, 5, 3, 9, 0, 0),
            new Date(1999, 5, 10, 9, 0, 0),
            new Date(1999, 5, 17, 9, 0, 0),
            new Date(1999, 5, 24, 9, 0, 0),
            new Date(1999, 6, 1, 9, 0, 0),
            new Date(1999, 6, 8, 9, 0, 0),
            new Date(1999, 6, 15, 9, 0, 0),
            new Date(1999, 6, 22, 9, 0, 0),
            new Date(1999, 6, 29, 9, 0, 0),
            new Date(1999, 7, 5, 9, 0, 0),
            new Date(1999, 7, 12, 9, 0, 0),
            new Date(1999, 7, 19, 9, 0, 0),
            new Date(1999, 7, 26, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length.is.greaterThan(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every 4 years, the first Tuesday after a Monday in November,
    // forever (U.S. Presidential Election day):

    //  DTSTART;TZID=America/New_York:19961105T090000
    //  RRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;
    //   BYMONTHDAY=2,3,4,5,6,7,8

    //   ==> (1996 9:00 AM EST) November 5
    //       (2000 9:00 AM EST) November 7
    //       (2004 9:00 AM EST) November 2
    //       ...
    it("RRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;BYMONTHDAY=2,3,4,5,6,7,8", () => {
        const event = new Event({
            uid: "yearly9",
            dtstart: helper.parseDateOrDateTime("19961105T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;BYMONTHDAY=2,3,4,5,6,7,8"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1996, 10, 5, 9, 0, 0),
            new Date(2000, 10, 7, 9, 0, 0),
            new Date(2004, 10, 2, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length.is.greaterThan(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });
});
