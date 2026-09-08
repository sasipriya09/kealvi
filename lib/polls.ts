export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type LivePoll = {
  id: string;
  question_id: string;
  question_body: string;
  prompt: string;
  options: PollOption[];
  total_votes: number;
  voted_users: string[];
  created_at: string;
  is_active: boolean;
};

let pollsStore: LivePoll[] = [
  {
    id: "poll_seed_1",
    question_id: "q_seed_2",
    question_body: "What is the best pattern to prevent duplicate voting in Supabase without performance bottlenecks?",
    prompt: "Which database technique do you prefer for real-time duplicate voting suppression?",
    options: [
      { id: "opt_1", text: "Postgres RLS with Redis Cache", votes: 14 },
      { id: "opt_2", text: "Client-side Fingerprinting & LocalStorage", votes: 8 },
      { id: "opt_3", text: "Database Triggers & Atomic Counters", votes: 19 },
    ],
    total_votes: 41,
    voted_users: [],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_active: true,
  },
];

export function getActivePolls(): LivePoll[] {
  return pollsStore;
}

export function createPoll(
  questionId: string,
  questionBody: string,
  prompt: string,
  optionsText: string[]
): LivePoll {
  const newPoll: LivePoll = {
    id: "poll_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
    question_id: questionId,
    question_body: questionBody,
    prompt: prompt || questionBody,
    options: optionsText.map((text, idx) => ({
      id: `opt_${Date.now()}_${idx}`,
      text,
      votes: 0,
    })),
    total_votes: 0,
    voted_users: [],
    created_at: new Date().toISOString(),
    is_active: true,
  };

  pollsStore = [newPoll, ...pollsStore];
  return newPoll;
}

export function voteInPoll(pollId: string, optionId: string, voterId: string): LivePoll | null {
  const pollIndex = pollsStore.findIndex((p) => p.id === pollId);
  if (pollIndex === -1) return null;

  const poll = pollsStore[pollIndex];

  if (voterId && poll.voted_users.includes(voterId)) {
    return poll;
  }

  const updatedOptions = poll.options.map((opt) => {
    if (opt.id === optionId) {
      return { ...opt, votes: opt.votes + 1 };
    }
    return opt;
  });

  const updatedPoll: LivePoll = {
    ...poll,
    options: updatedOptions,
    total_votes: poll.total_votes + 1,
    voted_users: voterId ? [...poll.voted_users, voterId] : poll.voted_users,
  };

  pollsStore[pollIndex] = updatedPoll;
  return updatedPoll;
}
