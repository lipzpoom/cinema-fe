export interface DateFormatOptions {
  time?: boolean;
  second?: boolean;
}

export class DisplayComponent {
  hideText(text: string, hideLength: number, isPrefix: boolean = true): string {
    return (
      (isPrefix ? "x".repeat(hideLength) : "") +
      text.slice(
        isPrefix ? hideLength : 0,
        isPrefix ? text.length : -hideLength,
      ) +
      (isPrefix ? "" : "x".repeat(hideLength))
    );
  }

  dateFormat(
    date: string | number | Date,
    option: DateFormatOptions = {},
  ): string {
    const parsedDate = Date.parse(date as string);
    if (isNaN(parsedDate)) {
      console.error("Invalid date value:", date);
      return "00-00-0000 00:00";
    }

    let date_setup: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    };

    if (option.time === false) {
      delete date_setup.hour;
      delete date_setup.minute;
      delete date_setup.second;
    }

    if (option.second === false) {
      delete date_setup.second;
    }

    const formattedDate = new Intl.DateTimeFormat("th-TH", date_setup).format(
      new Date(parsedDate),
    );

    return formattedDate;
  }

  standardDatetime(date: string | number | Date): string {
    const parsedDate = Date.parse(date as string);
    if (isNaN(parsedDate)) {
      return "00/00/0000 00:00 AM";
    }

    const d = new Date(parsedDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day}/${month}/${year} ${time}`;
  }
}
