const JST_TIME_ZONE = "Asia/Tokyo";

function getJstYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  if (!year || !month) {
    throw new Error("Failed to resolve JST year/month");
  }

  return { year, month };
}

export function getInvalidRequestDeadline(applicationCreatedAt: Date) {
  const { year, month } = getJstYearMonth(applicationCreatedAt);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;

  let businessDayCount = 0;

  for (let day = 1; day <= 31; day += 1) {
    const candidate = new Date(Date.UTC(nextMonthYear, nextMonth - 1, day));

    if (candidate.getUTCMonth() !== nextMonth - 1) {
      break;
    }

    const dayOfWeek = candidate.getUTCDay();
    const isBusinessDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    if (!isBusinessDay) continue;

    businessDayCount += 1;
    if (businessDayCount === 2) {
      return new Date(Date.UTC(nextMonthYear, nextMonth - 1, day, 14, 59, 59, 999));
    }
  }

  throw new Error("Failed to calculate invalid request deadline");
}

export function canSubmitInvalidRequest(applicationCreatedAt: Date, now = new Date()) {
  return now.getTime() <= getInvalidRequestDeadline(applicationCreatedAt).getTime();
}
