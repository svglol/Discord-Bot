import { BotUpdate } from "../types";
import shell = require("shelljs");
import * as dotenv from "dotenv";
dotenv.config();

export class Update implements BotUpdate {
	async update(): Promise<void> {
		if (process.env.NODE_ENV === "production") {
			shell.cd("../");
			shell.exec("git remote update");
			shell.exec(
				"git pull;npm ci; pm2 restart Discord-Bot-Nuxt;pm2 restart Discord-Bot"
			);
		}
	}
	async checkForUpdate(): Promise<boolean> {
		shell.cd("../");
		if (shell.which("git")) {
			shell.exec("git remote update");
			const update = shell.exec("git status -uno").toString();
			if (update.includes("Your branch is up to date with 'origin/master'.")) {
				shell.cd("bot");
				return false;
			} else {
				shell.cd("bot");
				return true;
			}
		}
		return false;
	}
}
