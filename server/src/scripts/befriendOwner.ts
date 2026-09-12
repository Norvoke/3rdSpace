// One-off backfill: run once with `npx ts-node src/scripts/befriendOwner.ts`
// to make every existing user friends with @finnellingwood.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import User from '../models/User';

dotenv.config();

async function main() {
  await connectDB();

  const owner = await User.findOne({ username: 'finnellingwood' });
  if (!owner) {
    console.error('No user with username "finnellingwood" found — nothing to do.');
    process.exit(1);
  }

  const others = await User.find({ _id: { $ne: owner._id } }, '_id');
  const otherIds = others.map(u => u._id);

  await User.updateOne({ _id: owner._id }, { $addToSet: { friends: { $each: otherIds } } });
  await Promise.all(
    otherIds.map(id => User.updateOne({ _id: id }, { $addToSet: { friends: owner._id } }))
  );

  console.log(`Befriended ${otherIds.length} existing user(s) with @finnellingwood.`);
  await mongoose.disconnect();
}

main();
