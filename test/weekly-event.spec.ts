import { Event } from "../src/ical-helper";
import { expect, should } from "chai";
import "mocha";
import { EEventType, EFreq, EWeekday } from "../src/types/icalendar.types";

describe("rrule WEEKLY freq", () => {
    // Weekly for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=WEEKLY;COUNT=10

    // ==> (1997 9:00 AM EDT) September 2,9,16,23,30;October 7,14,21
    //     (1997 9:00 AM EST) October 28;November 4
    it("RRULE:FREQ=WEEKLY;COUNT=10", () => {
        const event = new Event({
            uid: "weekly1",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                COUNT: 10,
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 23, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 7, 9, 0, 0),
            new Date(1997, 9, 14, 9, 0, 0),
            new Date(1997, 9, 21, 9, 0, 0),
            new Date(1997, 9, 28, 9, 0, 0),
            new Date(1997, 10, 4, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Weekly until December 24, 1997:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z

    // ==> (1997 9:00 AM EDT) September 2,9,16,23,30;
    //                        October 7,14,21
    //     (1997 9:00 AM EST) October 28;
    //                        November 4,11,18,25;
    //                        December 2,9,16,23
    it("RRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z", () => {
        const event = new Event({
            uid: "weekly2",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                UNTIL: new Date(1997, 11, 24, 8, 0, 0).getTime(),
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 23, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 7, 9, 0, 0),
            new Date(1997, 9, 14, 9, 0, 0),
            new Date(1997, 9, 21, 9, 0, 0),
            new Date(1997, 9, 28, 9, 0, 0),
            new Date(1997, 10, 4, 9, 0, 0),
            new Date(1997, 10, 11, 9, 0, 0),
            new Date(1997, 10, 18, 9, 0, 0),
            new Date(1997, 10, 25, 9, 0, 0),
            new Date(1997, 11, 2, 9, 0, 0),
            new Date(1997, 11, 9, 9, 0, 0),
            new Date(1997, 11, 16, 9, 0, 0),
            new Date(1997, 11, 23, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every other week - forever:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU

    // ==> (1997 9:00 AM EDT) September 2,16,30;
    //                        October 14
    //     (1997 9:00 AM EST) October 28;
    //                        November 11,25;
    //                        December 9,23
    //     (1998 9:00 AM EST) January 6,20;
    //                        February 3, 17
    //     ...
    it("RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU", () => {
        const event = new Event({
            uid: "weekly3",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                INTERVAL: 2,
                WKST: EWeekday.SUNDAY,
            },
        });
        const result = event.expandTimelines();
        expect(result.length > 13, "Number of occurrences").be.true;
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 14, 9, 0, 0),
            new Date(1997, 9, 28, 9, 0, 0),
            new Date(1997, 10, 11, 9, 0, 0),
            new Date(1997, 10, 25, 9, 0, 0),
            new Date(1997, 11, 9, 9, 0, 0),
            new Date(1997, 11, 23, 9, 0, 0),
            new Date(1998, 0, 6, 9, 0, 0),
            new Date(1998, 0, 20, 9, 0, 0),
            new Date(1998, 1, 3, 9, 0, 0),
            new Date(1998, 1, 17, 9, 0, 0),
        ];
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Weekly on Tuesday and Thursday for five weeks:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=WEEKLY;UNTIL=19971007T000000Z;WKST=SU;BYDAY=TU,TH

    // or

    // RRULE:FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH

    // ==> (1997 9:00 AM EDT) September 2,4,9,11,16,18,23,25,30;
    //                        October 2
    it("RRULE:FREQ=WEEKLY;UNTIL=19971007T000000Z;WKST=SU;BYDAY=TU,TH", () => {
        const event = new Event({
            uid: "weekly4",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                UNTIL: new Date(1997, 9, 7, 8, 0, 0).getTime(),
                WKST: EWeekday.SUNDAY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 4, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 11, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 18, 9, 0, 0),
            new Date(1997, 8, 23, 9, 0, 0),
            new Date(1997, 8, 25, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 2, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });
    it("RRULE:FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH", () => {
        const event = new Event({
            uid: "weekly5",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                COUNT: 10,
                WKST: EWeekday.SUNDAY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 4, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 11, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 18, 9, 0, 0),
            new Date(1997, 8, 23, 9, 0, 0),
            new Date(1997, 8, 25, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 2, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every other week on Monday, Wednesday, and Friday until December
    // 24, 1997, starting on Monday, September 1, 1997:

    //  DTSTART;TZID=America/New_York:19970901T090000
    //  RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;
    //   BYDAY=MO,WE,FR

    //  ==> (1997 9:00 AM EDT) September 1,3,5,15,17,19,29;
    //                         October 1,3,13,15,17
    //      (1997 9:00 AM EST) October 27,29,31;
    //                         November 10,12,14,24,26,28;
    //                         December 8,10,12,22
    it("RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR", () => {
        const event = new Event({
            uid: "weekly6",
            dtstart: new Date(1997, 8, 1, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                INTERVAL: 2,
                UNTIL: new Date(1997, 11, 24, 8, 0, 0).getTime(),
                WKST: EWeekday.SUNDAY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.MONDAY },
                    { ordwk: 0, weekday: EWeekday.WEDNESDAY },
                    { ordwk: 0, weekday: EWeekday.FRIDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 1, 9, 0, 0),
            new Date(1997, 8, 3, 9, 0, 0),
            new Date(1997, 8, 5, 9, 0, 0),
            new Date(1997, 8, 15, 9, 0, 0),
            new Date(1997, 8, 17, 9, 0, 0),
            new Date(1997, 8, 19, 9, 0, 0),
            new Date(1997, 8, 29, 9, 0, 0),
            new Date(1997, 9, 1, 9, 0, 0),
            new Date(1997, 9, 3, 9, 0, 0),
            new Date(1997, 9, 13, 9, 0, 0),
            new Date(1997, 9, 15, 9, 0, 0),
            new Date(1997, 9, 17, 9, 0, 0),
            new Date(1997, 9, 27, 9, 0, 0),
            new Date(1997, 9, 29, 9, 0, 0),
            new Date(1997, 9, 31, 9, 0, 0),
            new Date(1997, 10, 10, 9, 0, 0),
            new Date(1997, 10, 12, 9, 0, 0),
            new Date(1997, 10, 14, 9, 0, 0),
            new Date(1997, 10, 24, 9, 0, 0),
            new Date(1997, 10, 26, 9, 0, 0),
            new Date(1997, 10, 28, 9, 0, 0),
            new Date(1997, 11, 8, 9, 0, 0),
            new Date(1997, 11, 10, 9, 0, 0),
            new Date(1997, 11, 12, 9, 0, 0),
            new Date(1997, 11, 22, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every other week on Tuesday and Thursday, for 8 occurrences:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH

    // ==> (1997 9:00 AM EDT) September 2,4,16,18,30;
    //                        October 2,14,16
    it("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH", () => {
        const event = new Event({
            uid: "weekly7",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                INTERVAL: 2,
                COUNT: 8,
                WKST: EWeekday.SUNDAY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 4, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 18, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 2, 9, 0, 0),
            new Date(1997, 9, 14, 9, 0, 0),
            new Date(1997, 9, 16, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // An example where the days generated makes a difference because of
    // WKST:

    //  DTSTART;TZID=America/New_York:19970805T090000
    //  RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO

    //  ==> (1997 EDT) August 5,10,19,24
    it("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO", () => {
        const event = new Event({
            uid: "weekly8",
            dtstart: new Date(1997, 7, 5, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                INTERVAL: 2,
                COUNT: 4,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.SUNDAY },
                ],
                WKST: EWeekday.MONDAY,
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 7, 5, 9, 0, 0),
            new Date(1997, 7, 10, 9, 0, 0),
            new Date(1997, 7, 19, 9, 0, 0),
            new Date(1997, 7, 24, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // changing only WKST from MO to SU, yields different results...

    // DTSTART;TZID=America/New_York:19970805T090000
    // RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU

    // ==> (1997 EDT) August 5,17,19,31
    it("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU", () => {
        const event = new Event({
            uid: "weekly8",
            dtstart: new Date(1997, 7, 5, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.WEEKLY,
                INTERVAL: 2,
                COUNT: 4,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.SUNDAY },
                ],
                WKST: EWeekday.SUNDAY,
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 7, 5, 9, 0, 0),
            new Date(1997, 7, 17, 9, 0, 0),
            new Date(1997, 7, 19, 9, 0, 0),
            new Date(1997, 7, 31, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });
});
