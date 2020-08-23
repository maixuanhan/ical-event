import { Event } from "../src/ical-helper";
import { expect, should } from "chai";
import "mocha";
import { EEventType, EFreq, EWeekday } from "../src/types/icalendar.types";

describe("rrule MONTHLY freq", () => {
    // Monthly on the first Friday for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970905T090000
    // RRULE:FREQ=MONTHLY;COUNT=10;BYDAY=1FR

    // ==> (1997 9:00 AM EDT) September 5;October 3
    //     (1997 9:00 AM EST) November 7;December 5
    //     (1998 9:00 AM EST) January 2;February 6;March 6;April 3
    //     (1998 9:00 AM EDT) May 1;June 5
    it("RRULE:FREQ=MONTHLY;COUNT=10;BYDAY=1FR", () => {
        const event = new Event({
            uid: "monthly1",
            dtstart: new Date(1997, 8, 5, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                COUNT: 10,
                BYDAY: [
                    { ordwk: 1, weekday: EWeekday.FRIDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 5, 9, 0, 0),
            new Date(1997, 9, 3, 9, 0, 0),
            new Date(1997, 10, 7, 9, 0, 0),
            new Date(1997, 11, 5, 9, 0, 0),
            new Date(1998, 0, 2, 9, 0, 0),
            new Date(1998, 1, 6, 9, 0, 0),
            new Date(1998, 2, 6, 9, 0, 0),
            new Date(1998, 3, 3, 9, 0, 0),
            new Date(1998, 4, 1, 9, 0, 0),
            new Date(1998, 5, 5, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Monthly on the first Friday until December 24, 1997:

    // DTSTART;TZID=America/New_York:19970905T090000
    // RRULE:FREQ=MONTHLY;UNTIL=19971224T000000Z;BYDAY=1FR

    // ==> (1997 9:00 AM EDT) September 5; October 3
    //     (1997 9:00 AM EST) November 7; December 5
    it("RRULE:FREQ=MONTHLY;UNTIL=19971224T000000Z;BYDAY=1FR", () => {
        const event = new Event({
            uid: "monthly2",
            dtstart: new Date(1997, 8, 5, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                UNTIL: new Date(1997, 11, 24, 8, 0, 0).getTime(),
                BYDAY: [
                    { ordwk: 1, weekday: EWeekday.FRIDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 5, 9, 0, 0),
            new Date(1997, 9, 3, 9, 0, 0),
            new Date(1997, 10, 7, 9, 0, 0),
            new Date(1997, 11, 5, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every other month on the first and last Sunday of the month for 10
    // occurrences:

    //  DTSTART;TZID=America/New_York:19970907T090000
    //  RRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU

    //  ==> (1997 9:00 AM EDT) September 7,28
    //      (1997 9:00 AM EST) November 2,30
    //      (1998 9:00 AM EST) January 4,25;March 1,29
    //      (1998 9:00 AM EDT) May 3,31
    it("RRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU", () => {
        const event = new Event({
            uid: "monthly3",
            dtstart: new Date(1997, 8, 7, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                INTERVAL: 2,
                COUNT: 10,
                BYDAY: [
                    { ordwk: 1, weekday: EWeekday.SUNDAY },
                    { ordwk: -1, weekday: EWeekday.SUNDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 7, 9, 0, 0),
            new Date(1997, 8, 28, 9, 0, 0),
            new Date(1997, 10, 2, 9, 0, 0),
            new Date(1997, 10, 30, 9, 0, 0),
            new Date(1998, 0, 4, 9, 0, 0),
            new Date(1998, 0, 25, 9, 0, 0),
            new Date(1998, 2, 1, 9, 0, 0),
            new Date(1998, 2, 29, 9, 0, 0),
            new Date(1998, 4, 3, 9, 0, 0),
            new Date(1998, 4, 31, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Monthly on the second-to-last Monday of the month for 6 months:

    // DTSTART;TZID=America/New_York:19970922T090000
    // RRULE:FREQ=MONTHLY;COUNT=6;BYDAY=-2MO

    // ==> (1997 9:00 AM EDT) September 22;October 20
    //     (1997 9:00 AM EST) November 17;December 22
    //     (1998 9:00 AM EST) January 19;February 16
    it("RRULE:FREQ=MONTHLY;COUNT=6;BYDAY=-2MO", () => {
        const event = new Event({
            uid: "monthly4",
            dtstart: new Date(1997, 8, 22, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                COUNT: 6,
                BYDAY: [
                    { ordwk: -2, weekday: EWeekday.MONDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 22, 9, 0, 0),
            new Date(1997, 9, 20, 9, 0, 0),
            new Date(1997, 10, 17, 9, 0, 0),
            new Date(1997, 11, 22, 9, 0, 0),
            new Date(1998, 0, 19, 9, 0, 0),
            new Date(1998, 1, 16, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });


});
