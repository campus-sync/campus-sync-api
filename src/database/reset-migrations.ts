import dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}\\.env` });

import { Client } from "pg";
import { config } from "./connection";
import Prompt from "prompt-sync";
import { runMigrations } from "./migrations/main";

const resetMigrations = async () => {
  const client = new Client({ ...config, database: "postgres" });
  const environment = process.env.ENVIRONMENT;

  if (environment === "production") {
    console.log(
      "\x1b[31mENV is in production mode!\x1b[0m\nAborting reset.....\n"
    );
    return;
  }
  try {
    const prompt = Prompt({ sigint: true });

    const choice = prompt(
      "\x1b[33mAre you sure you want to reset the database?\x1b[0m (\x1b[32my\x1b[0m/\x1b[31mn\x1b[0m): "
    ).toLowerCase();
    if (choice !== "y" && choice !== "yes") {
      console.log("\nAborting Reset...\n");
      return;
    }

    await client.connect();

    await client.query("DROP DATABASE IF EXISTS " + config.database);
    console.log("Database dropped! Starting migrations...\n");

    await runMigrations();
  } catch (e) {
    console.log("\x1b[31mError: ", (e as unknown as Error).message, "\x1b[0m");
    console.log("Aborting Reset...\n");
    return;
  } finally {
    await client.end();
  }
};

resetMigrations();
