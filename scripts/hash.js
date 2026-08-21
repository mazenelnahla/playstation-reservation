import bcrypt from "bcryptjs";

const text = process.argv[2];

if (!text) {
  console.log("❌ Please provide text to hash.\n");
  console.log("Usage:");
  console.log("  node scripts/hash.js <your-password-or-text>");
  console.log("  npm run hash -- <your-password-or-text>\n");
  process.exit(1);
}

const saltRounds = 10;
const hash = await bcrypt.hash(text, saltRounds);

console.log("\n🔒 Bcrypt Hash Result:");
console.log("----------------------------------------");
console.log(`Original Text : ${text}`);
console.log(`Bcrypt Hash   : ${hash}`);
console.log("----------------------------------------\n");
