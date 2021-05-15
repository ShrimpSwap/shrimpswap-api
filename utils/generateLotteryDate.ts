import moment from "moment";

/**
 * 9am UTC
 * 10am CET
 * 11am Finland
 * 8pm Sydney
 */

export const generateLotteryDate = (issueIndex: number): Date => {
  if (issueIndex === 0) {
    return moment.utc("14/03/2021T09:00", "DD/MM/YYYYTHH:mm").toDate();
  }

  return moment
    .utc("15/03/2021T09:00", "DD/MM/YYYYTHH:mm")
    .add(issueIndex * 2, "days")
    .toDate();
};
