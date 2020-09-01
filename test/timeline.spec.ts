import { TimelineHelper } from "../src/timeline-helper";
import { expect } from "chai";
import "mocha";
import { ITimelineEntry } from "../src/types/icalendar.types";

describe("Timeline tests", () => {
    it("TimelineHelper.getLength()", () => {
        const h1 = new TimelineHelper([]);
        const h2 = new TimelineHelper([
            {
                startTime: Date.UTC(2020, 0, 1, 9),
                endTime: Date.UTC(2020, 0, 1, 11),
                event: null,
            },
        ]);
        const h3 = new TimelineHelper([
            {
                startTime: Date.UTC(2020, 0, 1, 9),
                endTime: Date.UTC(2020, 0, 1, 11),
                event: null,
            },
            {
                startTime: Date.UTC(2120, 0, 1, 9),
                endTime: Date.UTC(2120, 0, 1, 11),
                event: null,
            },
            {
                startTime: Date.UTC(2021, 0, 1, 9),
                endTime: Date.UTC(2021, 0, 1, 11),
                event: null,
            },
        ]);
        expect(h1.getLength()).to.equal(0, "Empty timeline");
        expect(h2.getLength()).to.equal(7200000, "1 timeline");
        expect(h3.getLength()).to.equal(Date.UTC(2120, 0, 1, 11) - Date.UTC(2020, 0, 1, 9), "Multiple timelines");
    });

    it("TimelineHelper get time used 1", () => {
        const list: ITimelineEntry[] = [
            {
                startTime: new Date(2020, 7, 31, 9).getTime(),
                endTime: new Date(2020, 7, 31, 11).getTime(),
                event: null,
            },
            {
                startTime: new Date(2020, 7, 27, 9).getTime(),
                endTime: new Date(2020, 7, 27, 11).getTime(),
                event: null,
            },
            {
                startTime: new Date(2020, 7, 31, 10).getTime(),
                endTime: new Date(2020, 7, 31, 12).getTime(),
                event: null,
            },
        ];

        const h = new TimelineHelper(list);
        const dailyUsed = h.getDailyUsed();
        const weeklyUsed = h.getWeeklyUsed();
        const monthlyUsed = h.getMonthlyUsed();

        expect(dailyUsed).length(2, "Daily entries count");
        expect(weeklyUsed).length(2, "Weekly entries count");
        expect(monthlyUsed).length(1, "Monthly entries count");

        expect(dailyUsed[0].startTime).to.equal(new Date(2020, 7, 27).getTime(), "Daily startTime 0");
        expect(dailyUsed[1].startTime).to.equal(new Date(2020, 7, 31).getTime(), "Daily startTime 1");
        expect(dailyUsed[0].duration).to.equal(2 * 60 * 60 * 1000, "Daily duration 0");
        expect(dailyUsed[1].duration).to.equal(4 * 60 * 60 * 1000, "Daily duration 1");

        expect(weeklyUsed[0].startTime).to.equal(new Date(2020, 7, 24).getTime(), "Weekly startTime 0");
        expect(weeklyUsed[1].startTime).to.equal(new Date(2020, 7, 31).getTime(), "Weekly startTime 1");
        expect(weeklyUsed[0].duration).to.equal(2 * 60 * 60 * 1000, "Weekly duration 0");
        expect(weeklyUsed[1].duration).to.equal(4 * 60 * 60 * 1000, "Weekly duration 1");

        expect(monthlyUsed[0].startTime).to.equal(new Date(2020, 7, 1).getTime(), "Monthly startTime");
        expect(monthlyUsed[0].duration).to.equal(6 * 60 * 60 * 1000, "Monthly duration");
    });

    it("TimelineHelper get time used 2", () => {
        const list: ITimelineEntry[] = [];

        const h = new TimelineHelper(list);
        const dailyUsed = h.getDailyUsed();
        const weeklyUsed = h.getWeeklyUsed();
        const monthlyUsed = h.getMonthlyUsed();

        expect(dailyUsed).length(0, "Daily entries count");
        expect(weeklyUsed).length(0, "Weekly entries count");
        expect(monthlyUsed).length(0, "Monthly entries count");
    });

    it("TimelineHelper get time used 3 (crossover days meeting)", () => {
        const list: ITimelineEntry[] = [
            {
                startTime: new Date(2020, 7, 31, 9).getTime(),
                endTime: new Date(2020, 7, 31, 11).getTime(),
                event: null,
            },
            {
                startTime: new Date(2020, 7, 27, 9).getTime(),
                endTime: new Date(2020, 7, 27, 11).getTime(),
                event: null,
            },
            {
                startTime: new Date(2020, 7, 31, 23).getTime(),
                endTime: new Date(2020, 8, 1, 1).getTime(),
                event: null,
            },
        ];

        const h = new TimelineHelper(list);
        const dailyUsed = h.getDailyUsed();
        const weeklyUsed = h.getWeeklyUsed();
        const monthlyUsed = h.getMonthlyUsed();

        expect(dailyUsed).length(3, "Daily entries count");
        expect(weeklyUsed).length(2, "Weekly entries count");
        expect(monthlyUsed).length(2, "Monthly entries count");

        expect(dailyUsed[1].startTime).to.equal(new Date(2020, 7, 31).getTime(), "Daily startTime 1");
        expect(dailyUsed[2].startTime).to.equal(new Date(2020, 8, 1).getTime(), "Daily startTime 2");
        expect(dailyUsed[1].duration).to.equal(3 * 60 * 60 * 1000, "Daily duration 1");
        expect(dailyUsed[2].duration).to.equal(1 * 60 * 60 * 1000, "Daily duration 2");

        expect(weeklyUsed[1].startTime).to.equal(new Date(2020, 7, 31).getTime(), "Weekly startTime 1");
        expect(weeklyUsed[1].duration).to.equal(4 * 60 * 60 * 1000, "Weekly duration 1");

        expect(monthlyUsed[0].startTime).to.equal(new Date(2020, 7, 1).getTime(), "Monthly startTime 0");
        expect(monthlyUsed[0].duration).to.equal(5 * 60 * 60 * 1000, "Monthly duration 0");
        expect(monthlyUsed[1].startTime).to.equal(new Date(2020, 8, 1).getTime(), "Monthly startTime 1");
        expect(monthlyUsed[1].duration).to.equal(1 * 60 * 60 * 1000, "Monthly duration 1");
    });
});
