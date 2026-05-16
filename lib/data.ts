import talksJson from '@/data/talks.json';
import speakersJson from '@/data/speakers.json';
import type { Speaker, Talk } from './types';

const allTalks = talksJson as Talk[];
// Filter the synthetic "Hosted by ..." record that appears on host-credit entries.
const allSpeakers = (speakersJson as Speaker[]).filter((s) => !/^hosted by/i.test(s.name));

export function getAllTalks(): Talk[] {
  return allTalks;
}

export function getAllSpeakers(): Speaker[] {
  return allSpeakers;
}

export function getSpeaker(id: string): Speaker | undefined {
  return allSpeakers.find((s) => s.id === id);
}

export function getTalk(id: string): Talk | undefined {
  return allTalks.find((t) => t.id === id);
}

export function getTalksBySpeakerId(id: string): Talk[] {
  return allTalks.filter((t) => t.speakers.some((s) => s.id === id));
}

const DAY_ORDER = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function compareTalksBySchedule(a: Talk, b: Talk): number {
  const dayDiff =
    DAY_ORDER.indexOf(a.day ?? '') - DAY_ORDER.indexOf(b.day ?? '');
  if (dayDiff !== 0) return dayDiff;
  return (a.startTime ?? '').localeCompare(b.startTime ?? '');
}

export function searchLinkedIn(name: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`;
}

export function searchGitHub(name: string): string {
  return `https://github.com/search?q=${encodeURIComponent(name)}&type=users`;
}
