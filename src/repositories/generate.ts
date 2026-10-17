import moment from "moment";

export function generateNumber(length: number) {
    let result = '';
    const characters = '1234567890';
    const charactersLength = characters.length;
    for (let index = 0; index < length; index++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export function formatDurationSmart(duration: moment.Duration): string {
  const days = duration.asDays();
  const hours = duration.asHours();
  const minutes = duration.asMinutes();
  const seconds = duration.asSeconds();

  if (days >= 1) {
    return `${Math.floor(days)} Hari`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} Jam`;
  } else if (minutes >= 1) {
    return `${Math.floor(minutes)} Menit`;
  } else {
    return `${Math.floor(seconds)} Detik`;
  }
}

export function strWords(text: string, words = 100, end = '...') {
  if (!text) return '';

  const splitText = text.trim().split(/\s+/);
  if (splitText.length <= words) {
    return text;
  }

  return splitText.slice(0, words).join(' ') + end;
}
