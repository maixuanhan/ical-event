import { Helper } from "../src/icalendar-helper";
import { expect } from "chai";
import "mocha";
import { EFreq, EWeekday, IRecurrenceRule } from "../src/types/icalendar.types";

const helper = new Helper();

describe("Parser tests", () => {
    it("Helper.parseWeekday()", () => {
        expect(helper.parseWeekday("MO"), "MONDAY").equals(EWeekday.MONDAY);
        expect(helper.parseWeekday("TU"), "TUESDAY").equals(EWeekday.TUESDAY);
        expect(helper.parseWeekday("WE"), "WEDNESDAY").equals(EWeekday.WEDNESDAY);
        expect(helper.parseWeekday("TH"), "THURSDAY").equals(EWeekday.THURSDAY);
        expect(helper.parseWeekday("FR"), "FRIDAY").equals(EWeekday.FRIDAY);
        expect(helper.parseWeekday("SA"), "SATURDAY").equals(EWeekday.SATURDAY);
        expect(helper.parseWeekday("SU"), "SUNDAY").equals(EWeekday.SUNDAY);
    });

    it("Helper.parseDateTime()", () => {
        expect(helper.parseDateTime("19730429T070000Z"), "19730429T070000Z")
            .equals(Date.UTC(1973, 4 - 1, 29, 7, 0, 0));
        expect(helper.parseDateTime("19730429T070000"), "19730429T070000")
            .equals(new Date(1973, 4 - 1, 29, 7, 0, 0).getTime());
    });

    it("Helper.parseDateOrDateTime()", () => {
        expect(helper.parseDateOrDateTime("19730429T070000Z"), "19730429T070000Z")
            .equals(Date.UTC(1973, 4 - 1, 29, 7, 0, 0));
        expect(helper.parseDateOrDateTime("19730429T070000"), "19730429T070000")
            .equals(new Date(1973, 4 - 1, 29, 7, 0, 0).getTime());
        expect(helper.parseDateOrDateTime("19730429"), "19730429")
            .equals(new Date(1973, 4 - 1, 29, 0, 0, 0).getTime());
    });

    it("Helper.parseRrule('RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=-1SU;UNTIL=19730429T070000Z')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=-1SU;UNTIL=19730429T070000Z");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.YEARLY,
            BYMONTH: [4],
            BYDAY: [
                { ordwk: -1, weekday: EWeekday.SUNDAY },
            ],
            UNTIL: Date.UTC(1973, 4 - 1, 29, 7, 0, 0),
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=DAILY;COUNT=10')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=DAILY;COUNT=10");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.DAILY,
            COUNT: 10,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=DAILY;UNTIL=19971224T000000Z')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=DAILY;UNTIL=19971224T000000Z");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.DAILY,
            UNTIL: Date.UTC(1997, 11, 24, 0, 0, 0),
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=DAILY;INTERVAL=2')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=DAILY;INTERVAL=2");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.DAILY,
            INTERVAL: 2,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=DAILY;INTERVAL=10;COUNT=5')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=DAILY;INTERVAL=10;COUNT=5");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.DAILY,
            INTERVAL: 10,
            COUNT: 5,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.DAILY,
            UNTIL: Date.UTC(2000, 1 - 1, 31, 14, 0, 0),
            BYMONTH: [1],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;COUNT=10')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;COUNT=10");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            COUNT: 10,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            UNTIL: helper.parseDateOrDateTime("19971224T000000Z"),
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            INTERVAL: 2,
            WKST: EWeekday.SUNDAY,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;UNTIL=19971007T000000Z;WKST=SU;BYDAY=TU,TH')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;UNTIL=19971007T000000Z;WKST=SU;BYDAY=TU,TH");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            UNTIL: helper.parseDateOrDateTime("19971007T000000Z"),
            WKST: EWeekday.SUNDAY,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
                { ordwk: 0, weekday: EWeekday.THURSDAY },
            ],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;COUNT=10;WKST=SU;BYDAY=TU,TH");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            COUNT: 10,
            WKST: EWeekday.SUNDAY,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
                { ordwk: 0, weekday: EWeekday.THURSDAY },
            ],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            INTERVAL: 2,
            UNTIL: helper.parseDateOrDateTime("19971224T000000Z"),
            WKST: EWeekday.SUNDAY,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.MONDAY },
                { ordwk: 0, weekday: EWeekday.WEDNESDAY },
                { ordwk: 0, weekday: EWeekday.FRIDAY },
            ],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            INTERVAL: 2,
            COUNT: 8,
            WKST: EWeekday.SUNDAY,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
                { ordwk: 0, weekday: EWeekday.THURSDAY },
            ],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            INTERVAL: 2,
            COUNT: 4,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
                { ordwk: 0, weekday: EWeekday.SUNDAY },
            ],
            WKST: EWeekday.MONDAY,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.WEEKLY,
            INTERVAL: 2,
            COUNT: 4,
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
                { ordwk: 0, weekday: EWeekday.SUNDAY },
            ],
            WKST: EWeekday.SUNDAY,
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=YEARLY;UNTIL=20000131T140000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA");
        const expectedRule: IRecurrenceRule = {
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
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.YEARLY,
            COUNT: 10,
            BYMONTH: [6, 7],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.YEARLY,
            INTERVAL: 2,
            COUNT: 10,
            BYMONTH: [1, 2, 3],
        };
        expect(rule).to.deep.equal(expectedRule);
    });

    it("Helper.parseRrule('RRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;BYMONTHDAY=2,3,4,5,6,7,8')", () => {
        const rule = helper.parseRrule("RRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYDAY=TU;BYMONTHDAY=2,3,4,5,6,7,8");
        const expectedRule: IRecurrenceRule = {
            FREQ: EFreq.YEARLY,
            INTERVAL: 4,
            BYMONTH: [11],
            BYDAY: [
                { ordwk: 0, weekday: EWeekday.TUESDAY },
            ],
            BYMONTHDAY: [2, 3, 4, 5, 6, 7, 8],
        };
        expect(rule).to.deep.equal(expectedRule);
    });
});
