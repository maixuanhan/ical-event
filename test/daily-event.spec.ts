import { Event } from "../src/types/icalendar-event";
import { Helper } from "../src/icalendar-helper";
import { expect } from "chai";
import "mocha";
import { EEventType } from "../src/types/icalendar.types";

const helper = new Helper();

describe("rrule DAILY freq", () => {
    // Daily for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=DAILY;COUNT=10

    // ==> (1997 9:00 AM EDT) September 2-11
    it("RRULE:FREQ=DAILY;COUNT=10", () => {
        const event = new Event({
            uid: "daily1",
            dtstart: helper.parseDateOrDateTime("19970902T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=DAILY;COUNT=10"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 3, 9, 0, 0),
            new Date(1997, 8, 4, 9, 0, 0),
            new Date(1997, 8, 5, 9, 0, 0),
            new Date(1997, 8, 6, 9, 0, 0),
            new Date(1997, 8, 7, 9, 0, 0),
            new Date(1997, 8, 8, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 10, 9, 0, 0),
            new Date(1997, 8, 11, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Daily until December 24, 1997:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=DAILY;UNTIL=19971224T000000Z

    // ==> (1997 9:00 AM EDT) September 2-30;October 1-25
    //     (1997 9:00 AM EST) October 26-31;November 1-30;December 1-23
    it("RRULE:FREQ=DAILY;UNTIL=19971224T000000Z", () => {
        const event = new Event({
            uid: "daily2",
            dtstart: helper.parseDateOrDateTime("19970902T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=DAILY;UNTIL=19971224T000000Z"),
        });
        const result = event.expandRrule();
        const resList = [
            {
                start: new Date(1997, 8, 2, 9, 0, 0),
                end: new Date(1997, 8, 30, 9, 0, 0),
            },
            {
                start: new Date(1997, 9, 1, 9, 0, 0),
                end: new Date(1997, 9, 25, 9, 0, 0),
            },
            {
                start: new Date(1997, 9, 26, 9, 0, 0),
                end: new Date(1997, 9, 31, 9, 0, 0),
            },
            {
                start: new Date(1997, 10, 1, 9, 0, 0),
                end: new Date(1997, 10, 30, 9, 0, 0),
            },
            {
                start: new Date(1997, 11, 1, 9, 0, 0),
                end: new Date(1997, 11, 23, 9, 0, 0),
            },
        ];
        expect(result, "Number of occurrences").length(30 - 2 + 1 + 25 - 1 + 1 + 31 - 26 + 1 + 30 - 1 + 1 + 23 - 1 + 1);
        expect(result.every(r => resList.some(s => s.start.getTime() <= r.startTime && r.startTime <= s.end.getTime())),
            "Instance values").be.true;
    });

    // Every other day - forever:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=DAILY;INTERVAL=2

    // ==> (1997 9:00 AM EDT) September 2,4,6,8...24,26,28,30;
    //                        October 2,4,6...20,22,24
    //     (1997 9:00 AM EST) October 26,28,30;
    //                        November 1,3,5,7...25,27,29;
    //                        December 1,3,...
    it("RRULE:FREQ=DAILY;INTERVAL=2", () => {
        const event = new Event({
            uid: "daily3",
            dtstart: helper.parseDateOrDateTime("19970902T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=DAILY;INTERVAL=2"),
        });
        const result = event.expandRrule();
        expect(result.length > 60, "Number of occurrences").be.true;
        const data1997 = result.filter(r => new Date(r.startTime).getFullYear() === 1997);
        expect(data1997.filter(r => new Date(r.startTime).getMonth() === 8),
            "Instance count for Sep 1997").length(15);
        expect(data1997.filter(r => new Date(r.startTime).getMonth() === 9),
            "Instance count for Oct 1997").length(15);
        expect(data1997.filter(r => new Date(r.startTime).getMonth() === 10),
            "Instance count for Nov 1997").length(15);
        expect(data1997[0].startTime,
            "First instance").equals(new Date(1997, 8, 2, 9, 0, 0).getTime());
        expect(data1997[1].startTime,
            "Second instance").equals(new Date(1997, 8, 4, 9, 0, 0).getTime());
    });

    // Every 10 days, 5 occurrences:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=DAILY;INTERVAL=10;COUNT=5

    // ==> (1997 9:00 AM EDT) September 2,12,22;
    //                        October 2,12
    it("RRULE:FREQ=DAILY;INTERVAL=10;COUNT=5", () => {
        const event = new Event({
            uid: "daily4",
            dtstart: helper.parseDateOrDateTime("19970902T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=DAILY;INTERVAL=10;COUNT=5"),
        });
        const result = event.expandRrule();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 12, 9, 0, 0),
            new Date(1997, 8, 22, 9, 0, 0),
            new Date(1997, 9, 2, 9, 0, 0),
            new Date(1997, 9, 12, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every day in January, for 3 years:

    // DTSTART;TZID=America/New_York:19980101T090000

    // RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;
    //  BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA
    // or
    // RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1

    // ==> (1998 9:00 AM EST)January 1-31
    //     (1999 9:00 AM EST)January 1-31
    //     (2000 9:00 AM EST)January 1-31
    it("RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1", () => {
        const event = new Event({
            uid: "daily5",
            dtstart: helper.parseDateOrDateTime("19980101T090000"),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: helper.parseRrule("RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1"),
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
});
