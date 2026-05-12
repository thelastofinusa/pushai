import open from "open";
import http from "http";
import axios from "axios";
import {
  setToken,
  setUser,
  clearToken,
  clearUser,
  getToken,
  getUser,
  clearAuth,
} from "./utils.js";
import chalk from "chalk";
import ora from "ora";

const BACKEND_URL = "http://localhost:4000";
const FRONTEND_URL = "http://localhost:3000";

export const login = async () => {
  const existingUser = getUser();
  if (existingUser) {
    console.log(
      chalk.yellow(
        `\nℹ️  You are already logged in as ${chalk.bold(existingUser.name)} (${existingUser.email}).`,
      ),
    );
    console.log(
      chalk.gray("   Run 'pAi logout' first if you want to switch accounts.\n"),
    );
    process.exit(0);
  }

  console.log(
    `\n${chalk.cyan.bold("PushAI Authentication")}\n` +
      `${chalk.gray("---------------------")}\n` +
      `${chalk.white("Press ")}${chalk.cyan.bold("ENTER")}${chalk.white(" to open your browser for authentication...")}`,
  );

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (token) {
      const spinner = ora("Verifying session with backend...").start();
      try {
        const response = await axios
          .get(`${BACKEND_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000,
          })
          .catch((err) => {
            if (err.code === "ECONNREFUSED")
              throw new Error(
                "Backend server is unreachable. Please try again later.",
              );
            throw new Error(
              `Verification failed: ${err.response?.data?.error || err.message}`,
            );
          });

        setToken(token);
        setUser(response.data);

        spinner.succeed(chalk.green("Session verified successfully!"));

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb; margin: 0;">
              <div style="background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px;">
                <div style="background: #ecfdf5; color: #10b981; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h1 style="color: #111827; margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 700;">Login Successful</h1>
                <p style="color: #4b5563; line-height: 1.5; margin: 0;">You can now close this tab and return to your terminal to start using PushAI.</p>
              </div>
            </body>
          </html>
        `);

        console.log(`\n${chalk.green.bold("✅ Successfully logged in!")}`);
        console.log(
          `${chalk.blue("👤 User:")} ${chalk.bold(response.data.name)} ${chalk.gray(`(${response.data.email})`)}\n`,
        );

        server.close(() => {
          process.exit(0);
        });
      } catch (error: any) {
        spinner.fail(chalk.red(`Login Failed: ${error.message}`));
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(`<h1>Login Failed</h1><p>${error.message}</p>`);
        server.close(() => {
          process.exit(1);
        });
      }
    }
  });

  const timeout = setTimeout(() => {
    console.log(chalk.red("\n\n⌛ Wait time exceeded. Login cancelled."));
    server.close(() => {
      process.exit(1);
    });
  }, 300000); // 5 minutes

  server.listen(0, async () => {
    const port = (server.address() as any).port;
    const authUrl = `${FRONTEND_URL}/login?callback=http://localhost:${port}`;

    await new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.once("data", () => {
        process.stdin.pause();
        resolve(null);
      });
    });

    open(authUrl);
    console.log(chalk.gray(`\n🚀 Opening browser at ${authUrl}...`));
    console.log(chalk.gray("   Waiting for you to complete the sign-in..."));
  });

  server.on("close", () => clearTimeout(timeout));
};

export const logout = () => {
  const user = getUser();
  if (!user) {
    console.log(chalk.yellow("\nℹ️  You are not currently logged in.\n"));
    return;
  }

  clearToken();
  clearUser();
  console.log(
    chalk.green(
      `\n✅ Successfully logged out from ${chalk.bold(user.email)}.\n`,
    ),
  );
};

export const whoami = async () => {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    console.log(chalk.red("\n❌ Not logged in. Run 'pAi login' first.\n"));
    return;
  }

  const spinner = ora("Checking session...").start();
  try {
    await axios.get(`${BACKEND_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    spinner.stop();

    console.log(`\n${chalk.blue.bold("Account Information")}`);
    console.log(chalk.gray("-------------------"));
    console.log(`${chalk.bold("Name: ")}  ${user.name}`);
    console.log(`${chalk.bold("Email:")}  ${user.email}`);
    console.log(`${chalk.bold("Status:")} ${chalk.green("Active")}\n`);
  } catch (error: any) {
    spinner.fail(chalk.yellow("Your session has expired."));
    console.log(
      chalk.gray("Please run 'pAi login' again to refresh your session.\n"),
    );
    clearToken();
    clearUser();
  }
};

export const account = () => {
  const token = getToken();
  if (!token) {
    console.log(
      chalk.yellow("\nℹ️  You need to login first to view your account."),
    );
    open(`${FRONTEND_URL}/login`);
    return;
  }
  console.log(chalk.gray("\n🚀 Opening account dashboard..."));
  open(`${FRONTEND_URL}/dashboard`);
};

export const clear = () => {
  clearAuth();
  console.log(chalk.green("\n✅ Local authentication file cleared.\n"));
};
