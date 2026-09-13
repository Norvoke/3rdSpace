// One-off backfill: existing customHTML/customCSS values predate the
// sanitizer and may already contain the payload that got the domain flagged.
// Run once with `npx ts-node src/scripts/resanitizeProfiles.ts`.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import User from '../models/User';
import { sanitizeCustomHTML, sanitizeCustomCSS } from '../utils/sanitizeProfile';

dotenv.config();

async function main() {
  await connectDB();

  const users = await User.find({
    $or: [{ customHTML: { $ne: null } }, { customCSS: { $ne: null } }],
  });

  let changed = 0;
  for (const u of users) {
    const newHTML = u.customHTML ? sanitizeCustomHTML(u.customHTML) : u.customHTML;
    const newCSS = u.customCSS ? sanitizeCustomCSS(u.customCSS) : u.customCSS;
    if (newHTML !== u.customHTML || newCSS !== u.customCSS) {
      u.customHTML = newHTML;
      u.customCSS = newCSS;
      await u.save();
      changed++;
    }
  }

  console.log(`Re-sanitized ${changed} of ${users.length} user(s).`);
  await mongoose.disconnect();
}

main();
