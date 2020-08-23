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

    // Monthly on the third-to-the-last day of the month, forever:

    // DTSTART;TZID=America/New_York:19970928T090000
    // RRULE:FREQ=MONTHLY;BYMONTHDAY=-3

    // ==> (1997 9:00 AM EDT) September 28
    //     (1997 9:00 AM EST) October 29;November 28;December 29
    //     (1998 9:00 AM EST) January 29;February 26
    //     ...
    it("RRULE:FREQ=MONTHLY;BYMONTHDAY=-3", () => {
        const event = new Event({
            uid: "monthly5",
            dtstart: new Date(1997, 8, 28, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                BYMONTHDAY: [-3],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 28, 9, 0, 0),
            new Date(1997, 9, 29, 9, 0, 0),
            new Date(1997, 10, 28, 9, 0, 0),
            new Date(1997, 11, 29, 9, 0, 0),
            new Date(1998, 0, 29, 9, 0, 0),
            new Date(1998, 1, 26, 9, 0, 0),
        ];
        expect(result.length > resList.length, "Number of occurrences").is.true;
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Monthly on the 2nd and 15th of the month for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15

    // ==> (1997 9:00 AM EDT) September 2,15;October 2,15
    //     (1997 9:00 AM EST) November 2,15;December 2,15
    //     (1998 9:00 AM EST) January 2,15
    it("RRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15", () => {
        const event = new Event({
            uid: "monthly6",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                COUNT: 10,
                BYMONTHDAY: [2, 15],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 15, 9, 0, 0),
            new Date(1997, 9, 2, 9, 0, 0),
            new Date(1997, 9, 15, 9, 0, 0),
            new Date(1997, 10, 2, 9, 0, 0),
            new Date(1997, 10, 15, 9, 0, 0),
            new Date(1997, 11, 2, 9, 0, 0),
            new Date(1997, 11, 15, 9, 0, 0),
            new Date(1998, 0, 2, 9, 0, 0),
            new Date(1998, 0, 15, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Monthly on the first and last day of the month for 10 occurrences:

    // DTSTART;TZID=America/New_York:19970930T090000
    // RRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1,-1

    // ==> (1997 9:00 AM EDT) September 30;October 1
    //     (1997 9:00 AM EST) October 31;November 1,30;December 1,31
    //     (1998 9:00 AM EST) January 1,31;February 1
    it("RRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1,-1", () => {
        const event = new Event({
            uid: "monthly7",
            dtstart: new Date(1997, 8, 30, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                COUNT: 10,
                BYMONTHDAY: [1, -1],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 9, 1, 9, 0, 0),
            new Date(1997, 9, 31, 9, 0, 0),
            new Date(1997, 10, 1, 9, 0, 0),
            new Date(1997, 10, 30, 9, 0, 0),
            new Date(1997, 11, 1, 9, 0, 0),
            new Date(1997, 11, 31, 9, 0, 0),
            new Date(1998, 0, 1, 9, 0, 0),
            new Date(1998, 0, 31, 9, 0, 0),
            new Date(1998, 1, 1, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every 18 months on the 10th thru 15th of the month for 10
    // occurrences:

    //  DTSTART;TZID=America/New_York:19970910T090000
    //  RRULE:FREQ=MONTHLY;INTERVAL=18;COUNT=10;BYMONTHDAY=10,11,12,
    //   13,14,15

    //  ==> (1997 9:00 AM EDT) September 10,11,12,13,14,15
    //      (1999 9:00 AM EST) March 10,11,12,13
    it("RRULE:FREQ=MONTHLY;INTERVAL=18;COUNT=10;BYMONTHDAY=10,11,12,13,14,15", () => {
        const event = new Event({
            uid: "monthly8",
            dtstart: new Date(1997, 8, 10, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                INTERVAL: 18,
                COUNT: 10,
                BYMONTHDAY: [10, 11, 12, 13, 14, 15],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 10, 9, 0, 0),
            new Date(1997, 8, 11, 9, 0, 0),
            new Date(1997, 8, 12, 9, 0, 0),
            new Date(1997, 8, 13, 9, 0, 0),
            new Date(1997, 8, 14, 9, 0, 0),
            new Date(1997, 8, 15, 9, 0, 0),
            new Date(1999, 2, 10, 9, 0, 0),
            new Date(1999, 2, 11, 9, 0, 0),
            new Date(1999, 2, 12, 9, 0, 0),
            new Date(1999, 2, 13, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every Tuesday, every other month:

    // DTSTART;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=TU

    // ==> (1997 9:00 AM EDT) September 2,9,16,23,30
    //     (1997 9:00 AM EST) November 4,11,18,25
    //     (1998 9:00 AM EST) January 6,13,20,27;March 3,10,17,24,31
    //     ...
    it("RRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=TU", () => {
        const event = new Event({
            uid: "monthly9",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                INTERVAL: 2,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                ],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 2, 9, 0, 0),
            new Date(1997, 8, 9, 9, 0, 0),
            new Date(1997, 8, 16, 9, 0, 0),
            new Date(1997, 8, 23, 9, 0, 0),
            new Date(1997, 8, 30, 9, 0, 0),
            new Date(1997, 10, 4, 9, 0, 0),
            new Date(1997, 10, 11, 9, 0, 0),
            new Date(1997, 10, 18, 9, 0, 0),
            new Date(1997, 10, 25, 9, 0, 0),
            new Date(1998, 0, 6, 9, 0, 0),
            new Date(1998, 0, 13, 9, 0, 0),
            new Date(1998, 0, 20, 9, 0, 0),
            new Date(1998, 0, 27, 9, 0, 0),
            new Date(1998, 2, 3, 9, 0, 0),
            new Date(1998, 2, 10, 9, 0, 0),
            new Date(1998, 2, 17, 9, 0, 0),
            new Date(1998, 2, 24, 9, 0, 0),
            new Date(1998, 2, 31, 9, 0, 0),
        ];
        expect(result.length > resList.length, "Number of occurrences").is.true;
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // Every Friday the 13th, forever:

    // DTSTART;TZID=America/New_York:19970902T090000
    // EXDATE;TZID=America/New_York:19970902T090000
    // RRULE:FREQ=MONTHLY;BYDAY=FR;BYMONTHDAY=13

    // ==> (1998 9:00 AM EST) February 13;March 13;November 13
    //     (1999 9:00 AM EDT) August 13
    //     (2000 9:00 AM EDT) October 13
    //     ...
    it("RRULE:FREQ=MONTHLY;BYDAY=FR;BYMONTHDAY=13", () => {
        const event = new Event({
            uid: "monthly10",
            dtstart: new Date(1997, 8, 2, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.FRIDAY },
                ],
                BYMONTHDAY: [13],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1998, 1, 13, 9, 0, 0),
            new Date(1998, 2, 13, 9, 0, 0),
            new Date(1998, 10, 13, 9, 0, 0),
            new Date(1999, 7, 13, 9, 0, 0),
            new Date(2000, 9, 13, 9, 0, 0),
        ];
        expect(result.length > resList.length, "Number of occurrences").is.true;
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // The first Saturday that follows the first Sunday of the month,
    // forever:

    //  DTSTART;TZID=America/New_York:19970913T090000
    //  RRULE:FREQ=MONTHLY;BYDAY=SA;BYMONTHDAY=7,8,9,10,11,12,13

    //  ==> (1997 9:00 AM EDT) September 13;October 11
    //      (1997 9:00 AM EST) November 8;December 13
    //      (1998 9:00 AM EST) January 10;February 7;March 7
    //      (1998 9:00 AM EDT) April 11;May 9;June 13...
    //      ...
    it("RRULE:FREQ=MONTHLY;BYDAY=SA;BYMONTHDAY=7,8,9,10,11,12,13", () => {
        const event = new Event({
            uid: "monthly11",
            dtstart: new Date(1997, 8, 13, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.SATURDAY },
                ],
                BYMONTHDAY: [7, 8, 9, 10, 11, 12, 13],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 13, 9, 0, 0),
            new Date(1997, 9, 11, 9, 0, 0),
            new Date(1997, 10, 8, 9, 0, 0),
            new Date(1997, 11, 13, 9, 0, 0),
            new Date(1998, 0, 10, 9, 0, 0),
            new Date(1998, 1, 7, 9, 0, 0),
            new Date(1998, 2, 7, 9, 0, 0),
            new Date(1998, 3, 11, 9, 0, 0),
            new Date(1998, 4, 9, 9, 0, 0),
            new Date(1998, 5, 13, 9, 0, 0),
        ];
        expect(result.length > resList.length, "Number of occurrences").is.true;
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // The third instance into the month of one of Tuesday, Wednesday, or
    // Thursday, for the next 3 months:

    //  DTSTART;TZID=America/New_York:19970904T090000
    //  RRULE:FREQ=MONTHLY;COUNT=3;BYDAY=TU,WE,TH;BYSETPOS=3

    //  ==> (1997 9:00 AM EDT) September 4;October 7
    //      (1997 9:00 AM EST) November 6
    it("RRULE:FREQ=MONTHLY;COUNT=3;BYDAY=TU,WE,TH;BYSETPOS=3", () => {
        const event = new Event({
            uid: "monthly12",
            dtstart: new Date(1997, 8, 4, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                COUNT: 3,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.WEDNESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                ],
                BYSETPOS: [3],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 4, 9, 0, 0),
            new Date(1997, 9, 7, 9, 0, 0),
            new Date(1997, 10, 6, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // The second-to-last weekday of the month:

    // DTSTART;TZID=America/New_York:19970929T090000
    // RRULE:FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-2

    // ==> (1997 9:00 AM EDT) September 29
    //     (1997 9:00 AM EST) October 30;November 27;December 30
    //     (1998 9:00 AM EST) January 29;February 26;March 30
    //     ...
    it("RRULE:FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-2", () => {
        const event = new Event({
            uid: "monthly13",
            dtstart: new Date(1997, 8, 29, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                BYDAY: [
                    { ordwk: 0, weekday: EWeekday.MONDAY },
                    { ordwk: 0, weekday: EWeekday.TUESDAY },
                    { ordwk: 0, weekday: EWeekday.WEDNESDAY },
                    { ordwk: 0, weekday: EWeekday.THURSDAY },
                    { ordwk: 0, weekday: EWeekday.FRIDAY },
                ],
                BYSETPOS: [-2],
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(1997, 8, 29, 9, 0, 0),
            new Date(1997, 9, 30, 9, 0, 0),
            new Date(1997, 10, 27, 9, 0, 0),
            new Date(1997, 11, 30, 9, 0, 0),
            new Date(1998, 0, 29, 9, 0, 0),
            new Date(1998, 1, 26, 9, 0, 0),
            new Date(1998, 2, 30, 9, 0, 0),
        ];
        expect(result.length > resList.length, "Number of occurrences").is.true;
        result.slice(0, resList.length).forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });

    // An example where an invalid date (i.e., February 30) is ignored.

    // DTSTART;TZID=America/New_York:20070115T090000
    // RRULE:FREQ=MONTHLY;BYMONTHDAY=15,30;COUNT=5

    // ==> (2007 EST) January 15,30
    //     (2007 EST) February 15
    //     (2007 EDT) March 15,30
    it("RRULE:FREQ=MONTHLY;BYMONTHDAY=15,30;COUNT=5", () => {
        const event = new Event({
            uid: "monthly14",
            dtstart: new Date(2007, 0, 15, 9, 0, 0).getTime(),
            duration: 30 * 60 * 1000,
            type: EEventType.RECURRINGMASTER,
            rrule: {
                FREQ: EFreq.MONTHLY,
                BYMONTHDAY: [15, 30],
                COUNT: 5,
            },
        });
        const result = event.expandTimelines();
        const resList = [
            new Date(2007, 0, 15, 9, 0, 0),
            new Date(2007, 0, 30, 9, 0, 0),
            new Date(2007, 1, 15, 9, 0, 0),
            new Date(2007, 2, 15, 9, 0, 0),
            new Date(2007, 2, 30, 9, 0, 0),
        ];
        expect(result, "Number of occurrences").length(resList.length);
        result.forEach(r => {
            expect(resList.some(s => s.getTime() === r.startTime), `Instance values: ${new Date(r.startTime)}`).be.true;
        });
    });
});
