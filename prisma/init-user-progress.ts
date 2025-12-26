import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function initUserProgress() {
  console.log('👥 Initializing UserProgress for existing users...');

  const users = await prisma.user.findMany({
    include: {
      UserProgress: true,
    },
  });

  console.log(`Found ${users.length} total users`);

  let initialized = 0;
  let skipped = 0;

  for (const user of users) {
    if (user.UserProgress) {
      console.log(`⏭️  Skipping user ${user.email} (already has progress)`);
      skipped++;
      continue;
    }

    await prisma.userProgress.create({
      data: {
        userId: user.id,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
      },
    });
    console.log(`✅ Initialized progress for user: ${user.email}`);
    initialized++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Initialized: ${initialized} users`);
  console.log(`  ⏭️  Skipped: ${skipped} users (already initialized)`);
  console.log(`  📝 Total users: ${users.length}`);
}

async function main() {
  try {
    await initUserProgress();
  } catch (error) {
    console.error('❌ Error initializing user progress:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
