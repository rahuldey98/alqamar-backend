import {prisma} from "../src/db/prisma";
import {normalizePhone} from "../src/utils/phone";

async function main() {
    console.log("Retrieving users from database...");
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
        }
    });

    console.log(`Found ${users.length} users. Analyzing phone numbers...`);

    let updatedCount = 0;
    let conflictCount = 0;

    for (const user of users) {
        const normalized = normalizePhone(user.phone);
        if (normalized === user.phone) {
            continue;
        }

        console.log(`User ID ${user.id} (${user.name}, ${user.role}): "${user.phone}" -> "${normalized}"`);

        // Check if another user already has this normalized phone number
        const existing = await prisma.user.findFirst({
            where: {
                phone: normalized,
                id: {not: user.id}
            }
        });

        if (existing) {
            console.warn(`[CONFLICT] Cannot update User ID ${user.id} to "${normalized}" because it is already in use by User ID ${existing.id} (${existing.name}, ${existing.role})! Skipping...`);
            conflictCount++;
            continue;
        }

        await prisma.user.update({
            where: {id: user.id},
            data: {phone: normalized}
        });

        updatedCount++;
    }

    console.log("\nNormalization summary:");
    console.log(`- Total users checked: ${users.length}`);
    console.log(`- Phone numbers updated: ${updatedCount}`);
    console.log(`- Conflicts skipped: ${conflictCount}`);
}

main()
    .catch((e) => {
        console.error("Error executing normalization script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
