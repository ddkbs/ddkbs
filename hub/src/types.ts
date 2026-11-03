export type Lang = { name: string; color: string | null };

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  isPrivate: boolean;
  isFork: boolean;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string;
  primaryLanguage: Lang | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  languages: { edges: { size: number; node: Lang }[] };
};

export type PullRequest = {
  state: "MERGED" | "OPEN" | "CLOSED";
  repository: {
    name: string;
    nameWithOwner: string;
    url: string;
    stargazerCount: number;
    isPrivate: boolean;
    owner: { login: string };
    primaryLanguage: Lang | null;
  };
};

export type Day = { date: string; contributionCount: number; color: string };

export type Profile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  websiteUrl: string | null;
  location: string | null;
  createdAt: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { totalCount: number; nodes: Repo[] };
  pullRequests: { nodes: PullRequest[] };
  contributionsCollection: {
    totalCommitContributions: number;
    restrictedContributionsCount: number;
    contributionCalendar: { totalContributions: number; weeks: { contributionDays: Day[] }[] };
  };
};
