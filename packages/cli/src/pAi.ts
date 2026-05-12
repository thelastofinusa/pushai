#!/usr/bin/env node

import { Command } from "commander";
import { login, logout, whoami, account, clear } from "./auth.js";
import chalk from "chalk";

const program = new Command();

program
  .name("pAi")
  .description("PushAI CLI - AI-powered git commit messages")
  .version("0.0.1");

program.command("login").description("Login to PushAI").action(login);

program
  .command("whoami")
  .description("Show logged-in user info")
  .action(whoami);

program.command("logout").description("Logout from PushAI").action(logout);

program
  .command("account")
  .description("Open account dashboard")
  .action(account);

program
  .command("clear")
  .description("Clear local authentication file")
  .action(clear);

program
  .command("generate")
  .description("Generate AI commit message")
  .action(() => {
    console.log(chalk.yellow("Coming soon..."));
  });

program
  .command("usage")
  .description("Show usage stats")
  .action(() => {
    console.log(chalk.yellow("Coming soon..."));
  });

program.parse(process.argv);
