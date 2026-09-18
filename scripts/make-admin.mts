/**
 * Macht einen bestehenden Account zum Admin.
 *
 * Loest das Henne-Ei-Problem: Um Rollen im Admin zu vergeben, braucht es einen
 * Admin — und den ersten gibt es noch nicht. ADMIN_USER_IDS tut dasselbe per
 * Environment, aber nur fuer die Umgebung, in der es gesetzt ist.
 *
 * Aufruf:
 *   npm run make-admin -- <username|email|id>            -> admin
 *   npm run make-admin -- <username|email|id> owner       -> owner
 *   npm run make-admin -- --list                          -> alle Accounts zeigen
 */
import { config } from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

config({ path: ".env.local" });
config({ path: ".env" });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/voltfm";
const dbName = process.env.MONGODB_DB ?? "voltfm";

const [target, roleArg] = process.argv.slice(2);
const role = roleArg ?? "admin";
const VALID_ROLES = ["user", "editor", "admin", "owner"];

if (!target) {
  console.error("Bitte Username, E-Mail oder User-ID angeben.");
  console.error("  npm run make-admin -- <username|email|id> [rolle]");
  console.error("  npm run make-admin -- --list");
  process.exit(1);
}

if (target !== "--list" && !VALID_ROLES.includes(role)) {
  console.error(`Unbekannte Rolle "${role}". Erlaubt: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const users = db.collection("user");

if (target === "--list") {
  const all = await users.find({}).limit(50).toArray();
  if (all.length === 0) {
    console.log("\nKeine Accounts vorhanden. Registriere dich zuerst unter /registrieren.\n");
  } else {
    console.log(`\n${all.length} Account(s):\n`);
    for (const u of all) {
      console.log(`  ${String(u._id)}  ${u.username ?? "-"}  ${u.email ?? "-"}  [${u.role ?? "user"}]`);
    }
    console.log();
  }
  await client.close();
  process.exit(0);
}

// Username, E-Mail oder ObjectId — je nachdem, was uebergeben wurde.
const query = ObjectId.isValid(target)
  ? { _id: new ObjectId(target) }
  : { $or: [{ username: target.toLowerCase() }, { email: target }] };

const user = await users.findOne(query);

if (!user) {
  console.error(`\nKein Account gefunden fuer "${target}".`);
  console.error("Vorhandene Accounts anzeigen:  npm run make-admin -- --list\n");
  await client.close();
  process.exit(1);
}

await users.updateOne({ _id: user._id }, { $set: { role } });

console.log(`\n${user.username ?? user.email} ist jetzt "${role}".`);
console.log(`ID: ${String(user._id)}`);
console.log("Einmal ab- und wieder anmelden, damit die Session die neue Rolle kennt.\n");

await client.close();
