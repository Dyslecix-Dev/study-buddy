import { prisma } from "../lib/prisma";

async function checkDailyProgress() {
  try {
    console.log("Checking DailyProgress records...\n");

    const records = await prisma.dailyProgress.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });

    if (records.length === 0) {
      console.log("No DailyProgress records found.");
    } else {
      console.log(`Found ${records.length} records:\n`);
      records.forEach((record) => {
        console.log(`Date: ${record.date.toISOString().split("T")[0]}`);
        console.log(`User ID: ${record.userId}`);
        console.log(`Tasks Completed: ${record.tasksCompleted}`);
        console.log(`Cards Reviewed: ${record.cardsReviewed}`);
        console.log(`Focus Minutes: ${record.focusMinutes}`);
        console.log(`Notes Created: ${record.notesCreated}`);
        console.log(`Notes Updated: ${record.notesUpdated}`);
        console.log("---");
      });
    }

    console.log("\nChecking FocusSession records...\n");

    const sessions = await prisma.focusSession.findMany({
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    if (sessions.length === 0) {
      console.log("No FocusSession records found.");
    } else {
      console.log(`Found ${sessions.length} sessions:\n`);
      sessions.forEach((session) => {
        console.log(`Completed: ${session.completedAt.toISOString()}`);
        console.log(`User ID: ${session.userId}`);
        console.log(`Mode: ${session.mode}`);
        console.log(`Duration: ${session.duration} minutes`);
        console.log("---");
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDailyProgress();

