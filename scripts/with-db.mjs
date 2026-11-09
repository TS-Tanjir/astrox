import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PG_BIN = "/usr/lib/postgresql/17/bin";
const PG_DATA = path.join(ROOT, ".pgdata");
const SOCKET_DIR = "/tmp";

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function isPgReady() {
  try {
    execFileSync(path.join(PG_BIN, "pg_isready"), ["-h", SOCKET_DIR, "-p", "5432"], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function ensureLocalPostgres() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("host=/tmp")) {
    return false;
  }

  if (!fs.existsSync(path.join(PG_DATA, "PG_VERSION"))) {
    fs.mkdirSync(PG_DATA, { recursive: true });
    execFileSync(
      path.join(PG_BIN, "initdb"),
      ["-D", PG_DATA, "-U", "astrox", "-A", "trust", "--no-locale", "--encoding=UTF8"],
      { stdio: "inherit" }
    );
  }

  if (isPgReady()) {
    return false;
  }

  const pidFile = path.join(PG_DATA, "postmaster.pid");
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }

  execFileSync(
    path.join(PG_BIN, "pg_ctl"),
    ["-D", PG_DATA, "-l", path.join(PG_DATA, "logfile"), "-o", `-k ${SOCKET_DIR} -h ''`, "start"],
    { stdio: "inherit" }
  );

  try {
    execFileSync(
      path.join(PG_BIN, "psql"),
      ["-h", SOCKET_DIR, "-p", "5432", "-U", "astrox", "-d", "postgres", "-tc", "SELECT 1 FROM pg_database WHERE datname = 'astrox'"],
      { encoding: "utf8" }
    ).includes("1") ||
      execFileSync(
        path.join(PG_BIN, "createdb"),
        ["-h", SOCKET_DIR, "-p", "5432", "-U", "astrox", "astrox"],
        { stdio: "inherit" }
      );
  } catch {
    // Database may already exist
  }

  return true;
}

function stopLocalPostgres() {
  try {
    if (isPgReady()) {
      execFileSync(path.join(PG_BIN, "pg_ctl"), ["-D", PG_DATA, "-m", "fast", "stop"], {
        stdio: "ignore",
      });
    }
  } catch {
    // Ignore shutdown errors
  }
}

loadEnv();
const startedByUs = ensureLocalPostgres();

const args = process.argv.slice(2);
if (args.length === 0) {
  process.exit(0);
}

const binName = args[0];
const localBin = path.join(ROOT, "node_modules", ".bin", binName);
const cmd = fs.existsSync(localBin) ? localBin : binName;

const child = spawn(cmd, args.slice(1), {
  stdio: "inherit",
  env: {
    ...process.env,
    PATH: `${path.join(ROOT, "node_modules", ".bin")}:/usr/bin:/bin:${process.env.PATH || ""}`,
  },
});

const cleanup = () => {
  if (startedByUs) {
    stopLocalPostgres();
  }
};

process.on("SIGINT", () => {
  child.kill("SIGINT");
});
process.on("SIGTERM", () => {
  child.kill("SIGTERM");
});

child.on("exit", (code) => {
  cleanup();
  process.exit(code ?? 0);
});
