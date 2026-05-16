export interface Speaker {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string;
  profileUrl: string;
  talkIds: string[];
}

export interface TalkSpeakerRef {
  id: string;
  name: string;
}

export interface Talk {
  id: string;
  kind: 'talk' | 'tutorial';
  title: string;
  abstract: string;
  speakers: TalkSpeakerRef[];
  day: string | null;
  dateText: string | null;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  level: string | null;
  url: string;
}

export interface ScrapedData {
  talks: Talk[];
  speakers: Speaker[];
  generatedAt: string;
}
