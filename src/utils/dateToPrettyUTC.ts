export default function dateToPrettyUTC(date: Date): string {
  const utc = date.toUTCString();

  const hours = utc.split(" ")[4].split(":")[0];
  const minutes = utc.split(" ")[4].split(":")[1];

  const day = utc.split(" ")[1];
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;

  return `${day}.${month} ${hours}:${minutes} GMT`;
}