import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { ACHIEVEMENTS } from '../lib/gamification';

async function seedAchievements() {
  console.log('🎮 Seeding achievements...');

  let created = 0;
  let updated = 0;

  for (const achievement of ACHIEVEMENTS) {
    const existing = await prisma.achievement.findUnique({
      where: { key: achievement.key },
    });

    if (existing) {
      await prisma.achievement.update({
        where: { key: achievement.key },
        data: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          category: achievement.category,
          requirement: achievement.requirement,
          tier: achievement.tier,
        },
      });
      updated++;
    } else {
      await prisma.achievement.create({
        data: {
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          category: achievement.category,
          requirement: achievement.requirement,
          tier: achievement.tier,
        },
      });
      created++;
    }
  }

  console.log(`✅ Created ${created} achievements`);
  console.log(`🔄 Updated ${updated} achievements`);
  console.log(`📊 Total: ${ACHIEVEMENTS.length} achievements in database`);
}

async function main() {
  try {
    await seedAchievements();
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
