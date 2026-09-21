import { formatCount } from "../format";
import { Button } from "./Button";
import { Field, Input } from "./Form";

/**
 * Months of a long list as columns, each one a link to the page on which the
 * month begins (0194).
 *
 * The owner's question was „how do I get to March without paging there?" —
 * and the catch, that March can be on another page. The counts per month
 * answer that without a second query: sorted by date, everything before
 * March is the rows of the months after it. `periodPage` does that sum.
 *
 * A special view, not part of any list: the caller places it above the list
 * where it is wanted, and leaves it out where the list is sorted by anything
 * other than the date.
 */

/** One month of the list, counted by the caller under the list's own filter. */
export interface PeriodCount {
  /** The month — `YYYY-MM` or any day in it, `YYYY-MM-DD`. */
  date: string;
  count: number;
}

const LONG = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
const SHORT = new Intl.DateTimeFormat("de-DE", { month: "short", timeZone: "UTC" });

const monthOf = (date: string) => date.slice(0, 7);
const asDate = (month: string) => new Date(`${month}-01T00:00:00Z`);

/**
 * Every month from the first to the last, with 0 where the caller has none:
 * a `GROUP BY` leaves empty months out, and a time axis must not swallow them.
 */
function fill(periods: readonly PeriodCount[]): { month: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of periods) counts.set(monthOf(p.date), (counts.get(monthOf(p.date)) ?? 0) + p.count);
  const keys = [...counts.keys()].sort();
  const out: { month: string; count: number }[] = [];
  if (keys.length === 0) return out;
  const at = asDate(keys[0]!);
  const last = keys.at(-1)!;
  for (let m = monthOf(at.toISOString()); m <= last; m = monthOf(at.toISOString())) {
    out.push({ month: m, count: counts.get(m) ?? 0 });
    at.setUTCMonth(at.getUTCMonth() + 1);
  }
  return out;
}

/**
 * The page on which the first row of `date`'s month stands.
 *
 * Holds only when the list is sorted by date and `periods` is counted under
 * the list's filter and covers every row that comes before the month — for
 * `desc` the newer months, for `asc` the older ones.
 *
 * @when    Building the `href` of a `PeriodJump` column.
 * @instead The page of a single row by id → ask the server.
 */
export function periodPage(
  periods: readonly PeriodCount[],
  date: string,
  { pageSize, dir }: { pageSize: number; dir: "asc" | "desc" },
): number {
  const month = monthOf(date);
  const before = periods
    .filter((p) => (dir === "desc" ? monthOf(p.date) > month : monthOf(p.date) < month))
    .reduce((sum, p) => sum + p.count, 0);
  return Math.floor(before / pageSize) + 1;
}

/**
 * @when    A long, date-sorted, paged list — a statement over a year — where
 *          the reader looks for a month: one column per month, the height is
 *          the number of rows, a click opens the page where it begins.
 * @instead Paging one page on → Pagination. Amounts over time, nothing to
 *          click → BarChart. Which periods are covered → PeriodGrid.
 */
export function PeriodJump({
  periods,
  href,
  current,
  unit = ["Eintrag", "Einträge"],
  dateForm,
  ariaLabel = "Zu einem Monat springen",
}: {
  /** Counted by the caller, one entry per month; missing months count 0. */
  periods: readonly PeriodCount[];
  /** Where a month leads — `month` is `YYYY-MM`; usually via `periodPage`. */
  href: (month: string) => string;
  /** First and last date of the rows on this page; their months are marked. */
  current?: { from: string; to: string };
  /** The word of the rows — singular, plural. */
  unit?: readonly [one: string, other: string];
  /**
   * „Springe zu" as a plain GET form. Which page a day is on the app works
   * out from `name`; `hidden` carries filter and sort along.
   */
  dateForm?: { action: string; name: string; hidden?: Record<string, string>; defaultValue?: string };
  ariaLabel?: string;
}) {
  const months = fill(periods);
  if (months.length === 0) return null;
  const top = Math.max(1, ...months.map((m) => m.count));
  const [lo, hi] = current ? [monthOf(current.from), monthOf(current.to)].sort() : ["", ""];
  const first = months[0]!.month;
  const last = months.at(-1)!.month;
  const lastDay = new Date(asDate(last).setUTCMonth(asDate(last).getUTCMonth() + 1) - 86_400_000);

  return (
    <nav className="v3jump" aria-label={ariaLabel}>
      <ol className="v3jump__cols">
        {months.map(({ month, count }, i) => {
          const d = asDate(month);
          const name = `${LONG.format(d)}: ${formatCount(count)} ${count === 1 ? unit[0] : unit[1]}`;
          const now = current !== undefined && month >= lo! && month <= hi!;
          const withYear = i === 0 || month.endsWith("-01");
          const body = (
            <>
              <span className="v2vh">{name}</span>
              <span className="v3jump__track" aria-hidden="true">
                {count > 0 ? (
                  <span className="v3jump__bar" style={{ height: `${(count / top) * 100}%` }} />
                ) : null}
              </span>
              <span className="v3jump__tick" aria-hidden="true">
                {/* Every second word from a dozen months on, as in BarChart —
                    a January keeps its word, it carries the year. */}
                {months.length > 12 && i % 2 === 1 && !withYear ? "\u00a0" : SHORT.format(d).replace(".", "")}
                {withYear ? <span className="v3jump__year">{d.getUTCFullYear()}</span> : null}
              </span>
            </>
          );
          return (
            <li key={month} className={`v3jump__col${now ? " is-now" : ""}`}>
              {/* A month without rows has nothing to find — it stands on the
                  axis, but it is no link. */}
              {count > 0 ? (
                <a className="v3jump__hit" href={href(month)} title={name} aria-current={now || undefined}>
                  {body}
                </a>
              ) : (
                <span className="v3jump__hit" title={name}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {dateForm ? (
        <form className="v3jump__form" method="get" action={dateForm.action}>
          {Object.entries(dateForm.hidden ?? {}).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <Field label="Springe zu" htmlFor={`${dateForm.name}-jump`}>
            <Input
              id={`${dateForm.name}-jump`}
              type="date"
              name={dateForm.name}
              min={`${first}-01`}
              max={lastDay.toISOString().slice(0, 10)}
              required
              {...(dateForm.defaultValue ? { defaultValue: dateForm.defaultValue } : {})}
            />
          </Field>
          <Button type="submit">Springen</Button>
        </form>
      ) : null}
    </nav>
  );
}
