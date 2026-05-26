import { supabase } from "../lib/api";

export type BrainTag = "task" | "anxiety" | "idea" | "reminder";

export type BrainNote = {
  text: string;
  time: string;
  date: string;
  createdAt: string;
  tag: BrainTag;
};

export type MoodCheckIn = {
  mood: number;
  energy: number;
  emotion?: string;
  emoji?: string;
  date: string;
  createdAt: string;
};

export type DailyStats = {
  thoughtsToday: number;
  focusSessionsToday: number;
  resetsToday: number;
  streakDays: number;
};

export type OnboardingNeed = "focus" | "anxiety" | "brain-dump" | "rsd" | "burnout" | "motivation";

export type OnboardingPreference = {
  primaryNeed: OnboardingNeed;
  completedAt: string;
};

export type DailyMission = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward: string;
  actionLabel: string;
  complete: boolean;
};

export type BrainBadge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "Start" | "Focus" | "Reset" | "Journal" | "Streak" | "Mastery";
  progress: number;
  target: number;
  unlocked: boolean;
  earnedLabel: string;
};

export const BRAIN_DUMP_KEY = "brain_dump_notes";
export const FOCUS_SESSIONS_KEY = "focus_sessions_log";
export const LEGACY_FOCUS_SESSIONS_KEY = "focus_sessions";
export const RESET_LOG_KEY = "reset_log";
export const MOOD_CHECKINS_KEY = "mood_energy_checkins";
export const ONBOARDING_KEY = "dopamine_onboarding_preference";

export function getTodayKey(date = new Date()) {
  return date.toDateString();
}

export function detectBrainTag(text: string): BrainTag {
  const value = text.toLowerCase();

  if (/\b(anxious|anxiety|panic|stress|stressed|overwhelm|overwhelmed|worried|spiral|fear|scared)\b/.test(value)) {
    return "anxiety";
  }

  if (/\b(todo|task|finish|send|email|call|buy|clean|make|write|fix|submit|pay|book|schedule|deadline)\b/.test(value)) {
    return "task";
  }

  if (/\b(remember|remind|appointment|meeting|due|later|tomorrow|tonight|next week|don't forget|dont forget)\b/.test(value)) {
    return "reminder";
  }

  return "idea";
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("brain-os-storage"));
}

async function getAuthedUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

function quietly(task: Promise<unknown>) {
  task.catch(() => {
    // Cloud sync is a progressive enhancement. LocalStorage remains the fallback.
  });
}

export function normalizeNote(note: Partial<BrainNote> & { tag?: string }, index: number): BrainNote {
  const createdAt = note.createdAt || new Date().toISOString();
  const text = note.text || "";
  const rawTag = (note.tag || "").toLowerCase();
  const tag = ["task", "anxiety", "idea", "reminder"].find((item) => rawTag.includes(item)) as BrainTag | undefined;

  return {
    text,
    time: note.time || new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    date: note.date || getTodayKey(new Date(createdAt)),
    createdAt,
    tag: tag || detectBrainTag(text || `thought ${index}`),
  };
}

export function getBrainNotes() {
  return readJson<BrainNote[]>(BRAIN_DUMP_KEY, []).map(normalizeNote).filter((note) => note.text.trim());
}

export function saveBrainNotes(notes: BrainNote[]) {
  writeJson(BRAIN_DUMP_KEY, notes);
  if (notes.length === 0) quietly(clearCloudBrainNotes());
}

export function addBrainNote(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const createdAt = new Date().toISOString();
  const note: BrainNote = {
    text: trimmed,
    time: new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    date: getTodayKey(new Date(createdAt)),
    createdAt,
    tag: detectBrainTag(trimmed),
  };

  saveBrainNotes([note, ...getBrainNotes()]);
  quietly(saveCloudBrainNote(note));
  return note;
}

export function recordFocusSession() {
  const sessions = readJson<string[]>(FOCUS_SESSIONS_KEY, []);
  const createdAt = new Date().toISOString();
  writeJson(FOCUS_SESSIONS_KEY, [createdAt, ...sessions]);
  quietly(saveCloudEvent("focus_sessions", createdAt));
}

export function recordReset() {
  const resets = readJson<string[]>(RESET_LOG_KEY, []);
  const createdAt = new Date().toISOString();
  writeJson(RESET_LOG_KEY, [createdAt, ...resets]);
  quietly(saveCloudEvent("reset_logs", createdAt));
}

export function saveMoodCheckIn(mood: number, energy: number, emotion?: string, emoji?: string) {
  const checkins = readJson<MoodCheckIn[]>(MOOD_CHECKINS_KEY, []);
  const checkin = {
    mood,
    energy,
    emotion,
    emoji,
    date: getTodayKey(),
    createdAt: new Date().toISOString(),
  };
  writeJson(MOOD_CHECKINS_KEY, [
    checkin,
    ...checkins,
  ]);
  quietly(saveCloudMoodCheckIn(checkin));
}

export function getMoodCheckIns() {
  return readJson<MoodCheckIn[]>(MOOD_CHECKINS_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getOnboardingPreference() {
  return readJson<OnboardingPreference | null>(ONBOARDING_KEY, null);
}

export function saveOnboardingPreference(primaryNeed: OnboardingNeed) {
  const preference: OnboardingPreference = {
    primaryNeed,
    completedAt: new Date().toISOString(),
  };

  writeJson(ONBOARDING_KEY, preference);
  quietly(saveCloudOnboardingPreference(preference));
  return preference;
}

export async function syncCloudProgress() {
  if (!supabase) return { ok: false, reason: "Supabase is not configured" };
  const userId = await getAuthedUserId();
  if (!userId) return { ok: false, reason: "Login required" };

  await Promise.allSettled([
    syncBrainNotes(userId),
    syncMoodCheckIns(userId),
    syncEventLog(userId, "focus_sessions", FOCUS_SESSIONS_KEY),
    syncEventLog(userId, "reset_logs", RESET_LOG_KEY),
    syncOnboardingPreference(userId),
  ]);

  window.dispatchEvent(new Event("brain-os-storage"));
  return { ok: true };
}

async function saveCloudBrainNote(note: BrainNote) {
  if (!supabase) return;
  const userId = await getAuthedUserId();
  if (!userId) return;
  await supabase.from("brain_notes").upsert({
    user_id: userId,
    text: note.text,
    tag: note.tag,
    local_date: note.date,
    local_time: note.time,
    local_created_at: note.createdAt,
  }, { onConflict: "user_id,local_created_at" });
}

async function clearCloudBrainNotes() {
  if (!supabase) return;
  const userId = await getAuthedUserId();
  if (!userId) return;
  await supabase.from("brain_notes").delete().eq("user_id", userId);
}

async function saveCloudMoodCheckIn(checkin: MoodCheckIn) {
  if (!supabase) return;
  const userId = await getAuthedUserId();
  if (!userId) return;
  await supabase.from("mood_checkins").upsert({
    user_id: userId,
    mood: checkin.mood,
    energy: checkin.energy,
    emotion: checkin.emotion || null,
    emoji: checkin.emoji || null,
    local_date: checkin.date,
    local_created_at: checkin.createdAt,
  }, { onConflict: "user_id,local_created_at" });
}

async function saveCloudEvent(table: "focus_sessions" | "reset_logs", createdAt: string) {
  if (!supabase) return;
  const userId = await getAuthedUserId();
  if (!userId) return;
  await supabase.from(table).upsert({
    user_id: userId,
    occurred_at: createdAt,
  }, { onConflict: "user_id,occurred_at" });
}

async function saveCloudOnboardingPreference(preference: OnboardingPreference) {
  if (!supabase) return;
  const userId = await getAuthedUserId();
  if (!userId) return;
  await supabase.from("onboarding_preferences").upsert({
    user_id: userId,
    primary_need: preference.primaryNeed,
    completed_at: preference.completedAt,
  }, { onConflict: "user_id" });
}

async function syncBrainNotes(userId: string) {
  if (!supabase) return;
  const localNotes = getBrainNotes();
  const { data, error } = await supabase
    .from("brain_notes")
    .select("text, tag, local_date, local_time, local_created_at")
    .eq("user_id", userId)
    .order("local_created_at", { ascending: false });
  if (error) throw error;

  const cloudNotes = (data || []).map((row) => normalizeNote({
    text: row.text,
    tag: row.tag,
    date: row.local_date,
    time: row.local_time,
    createdAt: row.local_created_at,
  }, 0));
  const merged = mergeByCreatedAt(localNotes, cloudNotes);
  writeJson(BRAIN_DUMP_KEY, merged);

  if (merged.length) {
    await supabase.from("brain_notes").upsert(merged.map((note) => ({
      user_id: userId,
      text: note.text,
      tag: note.tag,
      local_date: note.date,
      local_time: note.time,
      local_created_at: note.createdAt,
    })), { onConflict: "user_id,local_created_at" });
  }
}

async function syncMoodCheckIns(userId: string) {
  if (!supabase) return;
  const localCheckIns = getMoodCheckIns();
  const { data, error } = await supabase
    .from("mood_checkins")
    .select("mood, energy, emotion, emoji, local_date, local_created_at")
    .eq("user_id", userId)
    .order("local_created_at", { ascending: false });
  if (error) throw error;

  const cloudCheckIns = (data || []).map((row) => ({
    mood: Number(row.mood),
    energy: Number(row.energy),
    emotion: row.emotion || undefined,
    emoji: row.emoji || undefined,
    date: row.local_date,
    createdAt: row.local_created_at,
  }));
  const merged = mergeByCreatedAt(localCheckIns, cloudCheckIns);
  writeJson(MOOD_CHECKINS_KEY, merged);

  if (merged.length) {
    await supabase.from("mood_checkins").upsert(merged.map((checkin) => ({
      user_id: userId,
      mood: checkin.mood,
      energy: checkin.energy,
      emotion: checkin.emotion || null,
      emoji: checkin.emoji || null,
      local_date: checkin.date,
      local_created_at: checkin.createdAt,
    })), { onConflict: "user_id,local_created_at" });
  }
}

async function syncEventLog(userId: string, table: "focus_sessions" | "reset_logs", key: string) {
  if (!supabase) return;
  const localEvents = readJson<string[]>(key, []);
  const { data, error } = await supabase
    .from(table)
    .select("occurred_at")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;

  const cloudEvents = (data || []).map((row) => row.occurred_at);
  const merged = [...new Set([...localEvents, ...cloudEvents])].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  writeJson(key, merged);

  if (merged.length) {
    await supabase.from(table).upsert(merged.map((occurredAt) => ({
      user_id: userId,
      occurred_at: occurredAt,
    })), { onConflict: "user_id,occurred_at" });
  }
}

async function syncOnboardingPreference(userId: string) {
  if (!supabase) return;
  const localPreference = getOnboardingPreference();
  const { data, error } = await supabase
    .from("onboarding_preferences")
    .select("primary_need, completed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  const cloudPreference = data ? {
    primaryNeed: data.primary_need as OnboardingNeed,
    completedAt: data.completed_at,
  } : null;
  const preference = latestPreference(localPreference, cloudPreference);
  if (!preference) return;

  writeJson(ONBOARDING_KEY, preference);
  await saveCloudOnboardingPreference(preference);
}

function mergeByCreatedAt<T extends { createdAt: string }>(localItems: T[], cloudItems: T[]) {
  const map = new Map<string, T>();
  [...cloudItems, ...localItems].forEach((item) => map.set(item.createdAt, item));
  return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function latestPreference(localPreference: OnboardingPreference | null, cloudPreference: OnboardingPreference | null) {
  if (!localPreference) return cloudPreference;
  if (!cloudPreference) return localPreference;
  return new Date(localPreference.completedAt).getTime() >= new Date(cloudPreference.completedAt).getTime()
    ? localPreference
    : cloudPreference;
}

export function getLatestCheckInToday() {
  return getMoodCheckIns().find((checkin) => checkin.date === getTodayKey());
}

function datesFromIsoLog(key: string) {
  return readJson<string[]>(key, []).map((value) => getTodayKey(new Date(value)));
}

export function getDailyStats(): DailyStats {
  const today = getTodayKey();
  const notes = getBrainNotes();
  const focusDates = datesFromIsoLog(FOCUS_SESSIONS_KEY);
  const legacyFocusCount = Number(localStorage.getItem(LEGACY_FOCUS_SESSIONS_KEY) || 0);
  const resetDates = datesFromIsoLog(RESET_LOG_KEY);
  const checkinDates = readJson<MoodCheckIn[]>(MOOD_CHECKINS_KEY, []).map((checkin) => checkin.date);
  const activeDates = new Set([
    ...notes.map((note) => note.date),
    ...focusDates,
    ...resetDates,
    ...checkinDates,
  ]);

  return {
    thoughtsToday: notes.filter((note) => note.date === today).length,
    focusSessionsToday: focusDates.filter((date) => date === today).length + legacyFocusCount,
    resetsToday: resetDates.filter((date) => date === today).length,
    streakDays: getStreakDays(activeDates),
  };
}

export function getDailyMissions(stats = getDailyStats()): DailyMission[] {
  const hasCheckIn = Boolean(getLatestCheckInToday());

  return [
    {
      id: "brain-sweep",
      title: "Brain sweep",
      description: "Capture 3 thoughts so your head has fewer open tabs.",
      current: Math.min(stats.thoughtsToday, 3),
      target: 3,
      reward: "Thought sorter glow",
      actionLabel: "Add thoughts",
      complete: stats.thoughtsToday >= 3,
    },
    {
      id: "focus-spark",
      title: "Focus spark",
      description: "Complete 1 focus session, even if it is a tiny one.",
      current: Math.min(stats.focusSessionsToday, 1),
      target: 1,
      reward: "Focus streak fuel",
      actionLabel: "Start focus",
      complete: stats.focusSessionsToday >= 1,
    },
    {
      id: "energy-scan",
      title: "Energy scan",
      description: "Log mood and energy so the system knows where you are starting.",
      current: hasCheckIn ? 1 : 0,
      target: 1,
      reward: "Self-awareness badge",
      actionLabel: "Check in",
      complete: hasCheckIn,
    },
  ];
}

export function getMissionSummary(missions = getDailyMissions()) {
  const completeCount = missions.filter((mission) => mission.complete).length;

  return {
    completeCount,
    total: missions.length,
    percent: Math.round((completeCount / missions.length) * 100),
    allComplete: completeCount === missions.length,
  };
}

function clampProgress(value: number, target: number) {
  return Math.min(value, target);
}

function totalFocusSessions() {
  return readJson<string[]>(FOCUS_SESSIONS_KEY, []).length + Number(localStorage.getItem(LEGACY_FOCUS_SESSIONS_KEY) || 0);
}

export function getBrainBadges(): BrainBadge[] {
  const notes = getBrainNotes();
  const focusTotal = totalFocusSessions();
  const resets = readJson<string[]>(RESET_LOG_KEY, []);
  const checkins = readJson<MoodCheckIn[]>(MOOD_CHECKINS_KEY, []);
  const stats = getDailyStats();
  const missions = getDailyMissions(stats);
  const uniqueTags = new Set(notes.map((note) => note.tag));
  const dailyComplete = getMissionSummary(missions).allComplete ? 1 : 0;

  const badges: Omit<BrainBadge, "unlocked">[] = [
    {
      id: "self-awareness",
      title: "Self-awareness",
      description: "Log your first mood and energy check-in.",
      icon: "scan",
      category: "Start",
      progress: clampProgress(checkins.length, 1),
      target: 1,
      earnedLabel: "Energy scan badge",
    },
    {
      id: "thought-sorter",
      title: "Thought sorter",
      description: "Capture 3 brain dump notes.",
      icon: "notes",
      category: "Journal",
      progress: clampProgress(notes.length, 3),
      target: 3,
      earnedLabel: "Brain sweep badge",
    },
    {
      id: "focus-spark",
      title: "Focus spark",
      description: "Complete your first focus session.",
      icon: "timer",
      category: "Focus",
      progress: clampProgress(focusTotal, 1),
      target: 1,
      earnedLabel: "Focus starter badge",
    },
    {
      id: "soft-reset",
      title: "Soft reset",
      description: "Use your first reset.",
      icon: "reset",
      category: "Reset",
      progress: clampProgress(resets.length, 1),
      target: 1,
      earnedLabel: "Reset ritual badge",
    },
    {
      id: "daily-trio",
      title: "Daily trio",
      description: "Complete all daily missions in one day.",
      icon: "spark",
      category: "Mastery",
      progress: dailyComplete,
      target: 1,
      earnedLabel: "Quest complete badge",
    },
    {
      id: "tag-tamer",
      title: "Tag tamer",
      description: "Collect all brain dump tags: task, anxiety, idea, and reminder.",
      icon: "tags",
      category: "Journal",
      progress: clampProgress(uniqueTags.size, 4),
      target: 4,
      earnedLabel: "Brain organizer badge",
    },
    {
      id: "focus-builder",
      title: "Focus builder",
      description: "Complete 5 focus sessions.",
      icon: "bolt",
      category: "Focus",
      progress: clampProgress(focusTotal, 5),
      target: 5,
      earnedLabel: "Focus fuel badge",
    },
    {
      id: "reset-pro",
      title: "Reset pro",
      description: "Use 5 resets when your brain needs a restart.",
      icon: "heart",
      category: "Reset",
      progress: clampProgress(resets.length, 5),
      target: 5,
      earnedLabel: "Nervous system support badge",
    },
    {
      id: "streak-starter",
      title: "Streak starter",
      description: "Use the system for 3 active days in a row.",
      icon: "flame",
      category: "Streak",
      progress: clampProgress(stats.streakDays, 3),
      target: 3,
      earnedLabel: "3 day streak badge",
    },
    {
      id: "dopamine-devotee",
      title: "Dopamine devotee",
      description: "Use the system for 7 active days in a row.",
      icon: "crown",
      category: "Streak",
      progress: clampProgress(stats.streakDays, 7),
      target: 7,
      earnedLabel: "7 day streak badge",
    },
  ];

  return badges.map((badge) => ({
    ...badge,
    unlocked: badge.progress >= badge.target,
  }));
}

export function getStreakDays(activeDates: Set<string>) {
  let streak = 0;
  const cursor = new Date();

  while (activeDates.has(getTodayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
