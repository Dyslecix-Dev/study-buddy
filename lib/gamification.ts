/**
 * Gamification System
 * Handles XP, levels, achievements, and rewards
 */

// XP values for different actions
export const XP_VALUES = {
  // Notes
  CREATE_NOTE: 5,
  UPDATE_NOTE: 2,
  DELETE_NOTE: 0,

  // Tasks
  CREATE_TASK: 3,
  COMPLETE_TASK: 10,
  DELETE_TASK: 0,

  // Flashcards
  CREATE_FLASHCARD: 2,
  REVIEW_FLASHCARD: 2,
  REVIEW_FLASHCARD_CORRECT: 3,
  CREATE_DECK: 5,

  // Study Sessions
  STUDY_SESSION_15MIN: 10,
  STUDY_SESSION_25MIN: 15,
  STUDY_SESSION_45MIN: 25,
  STUDY_SESSION_60MIN: 35,

  // Exams
  CREATE_EXAM: 8,
  COMPLETE_EXAM: 20,
  PERFECT_EXAM: 50, // 100% score

  // Streaks
  DAILY_LOGIN: 5,
  WEEK_STREAK: 50,
  MONTH_STREAK: 200,

  // Social
  CREATE_FOLDER: 3,
  TAG_ITEM: 1,
} as const;

// Achievement tiers
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement category
export type AchievementCategory = 'notes' | 'tasks' | 'flashcards' | 'study' | 'streak' | 'exams' | 'mastery' | 'profile' | 'social' | 'special';

// Achievement definition
export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: AchievementCategory;
  requirement?: number;
  tier: AchievementTier;
}

// Predefined achievements
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Notes Achievements
  {
    key: 'first-note',
    name: 'First Steps',
    description: 'Create your first note',
    icon: '📝',
    xpReward: 10,
    category: 'notes',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'notes-10',
    name: 'Note Taker',
    description: 'Create 10 notes',
    icon: '📚',
    xpReward: 25,
    category: 'notes',
    requirement: 10,
    tier: 'bronze',
  },
  {
    key: 'notes-50',
    name: 'Prolific Writer',
    description: 'Create 50 notes',
    icon: '✍️',
    xpReward: 100,
    category: 'notes',
    requirement: 50,
    tier: 'silver',
  },
  {
    key: 'notes-100',
    name: 'Knowledge Builder',
    description: 'Create 100 notes',
    icon: '📖',
    xpReward: 250,
    category: 'notes',
    requirement: 100,
    tier: 'gold',
  },
  {
    key: 'notes-500',
    name: 'Master Scribe',
    description: 'Create 500 notes',
    icon: '🏆',
    xpReward: 1000,
    category: 'notes',
    requirement: 500,
    tier: 'platinum',
  },

  // Task Achievements
  {
    key: 'first-task',
    name: 'Getting Organized',
    description: 'Create your first task',
    icon: '✅',
    xpReward: 10,
    category: 'tasks',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'tasks-completed-10',
    name: 'Go-Getter',
    description: 'Complete 10 tasks',
    icon: '🎯',
    xpReward: 50,
    category: 'tasks',
    requirement: 10,
    tier: 'bronze',
  },
  {
    key: 'tasks-completed-50',
    name: 'Productivity Pro',
    description: 'Complete 50 tasks',
    icon: '⚡',
    xpReward: 150,
    category: 'tasks',
    requirement: 50,
    tier: 'silver',
  },
  {
    key: 'tasks-completed-100',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '🌟',
    xpReward: 300,
    category: 'tasks',
    requirement: 100,
    tier: 'gold',
  },
  {
    key: 'tasks-completed-500',
    name: 'Efficiency Expert',
    description: 'Complete 500 tasks',
    icon: '👑',
    xpReward: 1500,
    category: 'tasks',
    requirement: 500,
    tier: 'platinum',
  },

  // Flashcard Achievements
  {
    key: 'first-deck',
    name: 'Deck Builder',
    description: 'Create your first flashcard deck',
    icon: '🃏',
    xpReward: 10,
    category: 'flashcards',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'cards-reviewed-100',
    name: 'Memory Apprentice',
    description: 'Review 100 flashcards',
    icon: '🧠',
    xpReward: 50,
    category: 'flashcards',
    requirement: 100,
    tier: 'bronze',
  },
  {
    key: 'cards-reviewed-500',
    name: 'Memory Champion',
    description: 'Review 500 flashcards',
    icon: '💡',
    xpReward: 200,
    category: 'flashcards',
    requirement: 500,
    tier: 'silver',
  },
  {
    key: 'cards-reviewed-1000',
    name: 'Recall Master',
    description: 'Review 1000 flashcards',
    icon: '🎓',
    xpReward: 500,
    category: 'flashcards',
    requirement: 1000,
    tier: 'gold',
  },
  {
    key: 'cards-reviewed-5000',
    name: 'Memory Palace',
    description: 'Review 5000 flashcards',
    icon: '🏛️',
    xpReward: 2000,
    category: 'flashcards',
    requirement: 5000,
    tier: 'platinum',
  },

  // Study Session Achievements
  {
    key: 'first-study-session',
    name: 'Focus Beginner',
    description: 'Complete your first study session',
    icon: '⏱️',
    xpReward: 15,
    category: 'study',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'study-hours-10',
    name: 'Dedicated Student',
    description: 'Study for 10 hours total',
    icon: '📚',
    xpReward: 100,
    category: 'study',
    requirement: 600, // minutes
    tier: 'bronze',
  },
  {
    key: 'study-hours-50',
    name: 'Study Warrior',
    description: 'Study for 50 hours total',
    icon: '⚔️',
    xpReward: 400,
    category: 'study',
    requirement: 3000,
    tier: 'silver',
  },
  {
    key: 'study-hours-100',
    name: 'Scholar',
    description: 'Study for 100 hours total',
    icon: '🎯',
    xpReward: 800,
    category: 'study',
    requirement: 6000,
    tier: 'gold',
  },
  {
    key: 'study-hours-500',
    name: 'Academic Legend',
    description: 'Study for 500 hours total',
    icon: '🌠',
    xpReward: 5000,
    category: 'study',
    requirement: 30000,
    tier: 'platinum',
  },

  // Streak Achievements
  {
    key: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    xpReward: 30,
    category: 'streak',
    requirement: 3,
    tier: 'bronze',
  },
  {
    key: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🌟',
    xpReward: 100,
    category: 'streak',
    requirement: 7,
    tier: 'bronze',
  },
  {
    key: 'streak-30',
    name: 'Month Master',
    description: 'Maintain a 30-day study streak',
    icon: '📅',
    xpReward: 500,
    category: 'streak',
    requirement: 30,
    tier: 'silver',
  },
  {
    key: 'streak-100',
    name: 'Century Club',
    description: 'Maintain a 100-day study streak',
    icon: '💯',
    xpReward: 2000,
    category: 'streak',
    requirement: 100,
    tier: 'gold',
  },
  {
    key: 'streak-200',
    name: 'Consistency Champion',
    description: 'Maintain a 200-day study streak',
    icon: '🏆',
    xpReward: 5000,
    category: 'streak',
    requirement: 200,
    tier: 'gold',
  },
  {
    key: 'streak-365',
    name: 'Year of Excellence',
    description: 'Maintain a 365-day study streak',
    icon: '👑',
    xpReward: 10000,
    category: 'streak',
    requirement: 365,
    tier: 'platinum',
  },

  // Exam Achievements
  {
    key: 'first-exam',
    name: 'Test Taker',
    description: 'Complete your first exam',
    icon: '📋',
    xpReward: 20,
    category: 'exams',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'perfect-exam',
    name: 'Perfect Score',
    description: 'Get 100% on an exam',
    icon: '💯',
    xpReward: 100,
    category: 'exams',
    tier: 'silver',
  },
  {
    key: 'exams-completed-10',
    name: 'Test Veteran',
    description: 'Complete 10 exams',
    icon: '📝',
    xpReward: 150,
    category: 'exams',
    requirement: 10,
    tier: 'silver',
  },
  {
    key: 'exams-completed-50',
    name: 'Exam Expert',
    description: 'Complete 50 exams',
    icon: '🎓',
    xpReward: 500,
    category: 'exams',
    requirement: 50,
    tier: 'gold',
  },

  // Mastery Achievements
  {
    key: 'level-10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    xpReward: 100,
    category: 'mastery',
    requirement: 10,
    tier: 'bronze',
  },
  {
    key: 'level-25',
    name: 'Expert Learner',
    description: 'Reach level 25',
    icon: '🌟',
    xpReward: 250,
    category: 'mastery',
    requirement: 25,
    tier: 'silver',
  },
  {
    key: 'level-50',
    name: 'Master Student',
    description: 'Reach level 50',
    icon: '💫',
    xpReward: 500,
    category: 'mastery',
    requirement: 50,
    tier: 'gold',
  },
  {
    key: 'level-100',
    name: 'Legendary Scholar',
    description: 'Reach level 100',
    icon: '🏆',
    xpReward: 1000,
    category: 'mastery',
    requirement: 100,
    tier: 'platinum',
  },

  // Profile Achievements
  {
    key: 'welcome',
    name: 'Welcome Aboard',
    description: 'Create your account',
    icon: '👋',
    xpReward: 10,
    category: 'profile',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'avatar-upload',
    name: 'Face of Knowledge',
    description: 'Upload a custom avatar',
    icon: '🖼️',
    xpReward: 20,
    category: 'profile',
    tier: 'bronze',
  },
  {
    key: 'complete-profile',
    name: 'Identity Complete',
    description: 'Complete your profile with name and avatar',
    icon: '✨',
    xpReward: 30,
    category: 'profile',
    tier: 'bronze',
  },

  // Note Linking & Organization
  {
    key: 'first-link',
    name: 'Link Creator',
    description: 'Create your first note link',
    icon: '🔗',
    xpReward: 15,
    category: 'notes',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'knowledge-connector',
    name: 'Knowledge Connector',
    description: 'Create a note with 5+ links',
    icon: '🕸️',
    xpReward: 100,
    category: 'notes',
    requirement: 5,
    tier: 'silver',
  },
  {
    key: 'first-folder',
    name: 'Organizer',
    description: 'Create your first folder',
    icon: '📁',
    xpReward: 10,
    category: 'notes',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'folder-master',
    name: 'Folder Master',
    description: 'Create 10 folders',
    icon: '🗂️',
    xpReward: 75,
    category: 'notes',
    requirement: 10,
    tier: 'silver',
  },

  // Tag Achievements
  {
    key: 'first-tag',
    name: 'Tag Beginner',
    description: 'Create and use your first tag (works on notes, tasks, flashcards)',
    icon: '🏷️',
    xpReward: 5,
    category: 'notes',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'tag-master',
    name: 'Tag Master',
    description: 'Use tags on 50 items (notes, tasks, flashcards)',
    icon: '🎯',
    xpReward: 100,
    category: 'notes',
    requirement: 50,
    tier: 'silver',
  },

  // Task Special Achievements
  {
    key: 'early-bird',
    name: 'Early Bird',
    description: 'Complete 10 tasks before their due date',
    icon: '🐦',
    xpReward: 75,
    category: 'tasks',
    requirement: 10,
    tier: 'silver',
  },
  {
    key: 'priority-master',
    name: 'Priority Master',
    description: 'Complete tasks of all priority levels',
    icon: '🎚️',
    xpReward: 50,
    category: 'tasks',
    tier: 'bronze',
  },

  // Exam Special Achievements
  {
    key: 'exam-creator',
    name: 'Exam Creator',
    description: 'Create your first exam',
    icon: '📝',
    xpReward: 15,
    category: 'exams',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'question-master',
    name: 'Question Master',
    description: 'Create 50 questions across exams',
    icon: '❓',
    xpReward: 150,
    category: 'exams',
    requirement: 50,
    tier: 'silver',
  },
  {
    key: 'variety-expert',
    name: 'Variety Expert',
    description: 'Use all question types in one exam',
    icon: '🎭',
    xpReward: 75,
    category: 'exams',
    tier: 'silver',
  },

  // Flashcard Special
  {
    key: 'deck-collector',
    name: 'Deck Collector',
    description: 'Create 10 flashcard decks',
    icon: '🎴',
    xpReward: 100,
    category: 'flashcards',
    requirement: 10,
    tier: 'silver',
  },
  {
    key: 'perfect-recall',
    name: 'Perfect Recall',
    description: 'Get 20 consecutive correct reviews',
    icon: '💫',
    xpReward: 200,
    category: 'flashcards',
    requirement: 20,
    tier: 'gold',
  },

  // Social & Feedback
  {
    key: 'bug-reporter',
    name: 'Bug Hunter',
    description: 'Report your first bug',
    icon: '🐛',
    xpReward: 50,
    category: 'social',
    requirement: 1,
    tier: 'bronze',
  },
  {
    key: 'quality-contributor',
    name: 'Quality Contributor',
    description: 'Report 5 bugs',
    icon: '🔍',
    xpReward: 200,
    category: 'social',
    requirement: 5,
    tier: 'silver',
  },

  // Special Achievements
  {
    key: 'first-day',
    name: 'Fast Starter',
    description: 'Complete 5 actions on your first day',
    icon: '⚡',
    xpReward: 100,
    category: 'special',
    requirement: 5,
    tier: 'silver',
  },
  {
    key: 'well-rounded',
    name: 'Well-Rounded Learner',
    description: 'Use all 5 main features',
    icon: '🌐',
    xpReward: 150,
    category: 'special',
    tier: 'silver',
  },
  {
    key: 'power-user',
    name: 'Power User',
    description: 'Reach level 20 with 100+ completed tasks',
    icon: '💪',
    xpReward: 500,
    category: 'special',
    tier: 'gold',
  },
  {
    key: 'productivity-sprint',
    name: 'Productivity Sprint',
    description: 'Complete 10 tasks in one day',
    icon: '🏃',
    xpReward: 100,
    category: 'special',
    tier: 'silver',
  },
  {
    key: 'speed-learner',
    name: 'Speed Learner',
    description: 'Review 50 flashcards in one day',
    icon: '⚡',
    xpReward: 100,
    category: 'special',
    tier: 'silver',
  },
  {
    key: 'exam-daily-challenge',
    name: 'Test Marathon',
    description: 'Answer 20 exam questions in one day',
    icon: '📝',
    xpReward: 100,
    category: 'special',
    tier: 'silver',
  },
  {
    key: 'night-owl',
    name: 'Night Owl',
    description: 'Study between 11 PM - 11:59 PM',
    icon: '🦉',
    xpReward: 25,
    category: 'special',
    tier: 'bronze',
  },
  {
    key: 'early-riser',
    name: 'Early Riser',
    description: 'Study between 12 AM - 5:59 AM',
    icon: '🌅',
    xpReward: 25,
    category: 'special',
    tier: 'bronze',
  },
];

/**
 * Calculate level from total XP
 * Uses a square root formula: level = floor(sqrt(totalXP / 100)) + 1
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Calculate XP required for next level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) ** 2 * 100;
}

/**
 * Calculate XP required to reach next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1);
}

/**
 * Calculate XP progress towards next level
 */
export function getXPProgress(totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progressXP = totalXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.floor((progressXP / requiredXP) * 100);

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressXP,
    progressPercentage,
  };
}

/**
 * Get XP reward based on study session duration
 */
export function getStudySessionXP(durationMinutes: number): number {
  if (durationMinutes >= 60) return XP_VALUES.STUDY_SESSION_60MIN;
  if (durationMinutes >= 45) return XP_VALUES.STUDY_SESSION_45MIN;
  if (durationMinutes >= 25) return XP_VALUES.STUDY_SESSION_25MIN;
  if (durationMinutes >= 15) return XP_VALUES.STUDY_SESSION_15MIN;
  return Math.floor(durationMinutes / 3); // 1 XP per 3 minutes for shorter sessions
}

/**
 * Get achievement tier color
 */
export function getAchievementTierColor(tier: AchievementTier): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  };
  return colors[tier];
}

/**
 * Get achievement tier badge style classes
 */
export function getAchievementTierClass(tier: AchievementTier): string {
  const classes = {
    bronze: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
    silver: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700',
    platinum: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700',
  };
  return classes[tier];
}

/**
 * Sort achievements by tier and XP reward
 */
export function sortAchievements(achievements: AchievementDefinition[]): AchievementDefinition[] {
  const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
  return [...achievements].sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.xpReward - b.xpReward;
  });
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
}
