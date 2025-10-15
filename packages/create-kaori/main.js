#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";

export const VERSION = "0.0.2"; // todo pull from package.json

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	console.log("\n🌸 Welcome to Kaori - A fragrant TS framework\n");
	console.log(`using create-kaori ${VERSION}\n`);

	const response = await prompts({
		type: "text",
		name: "projectName",
		message: "What is your project name?",
		initial: "my-kaori-app",
		validate: (value) => {
			if (!value.trim()) {
				return "Project name is required";
			}
			if (!/^[a-z0-9-_]+$/i.test(value)) {
				return "Project name should only contain letters, numbers, hyphens, and underscores";
			}
			return true;
		},
	});

	if (!response.projectName) {
		console.log("Project creation cancelled.");
		process.exit(0);
	}

	const projectName = response.projectName.trim();
	const targetDir = path.resolve(process.cwd(), projectName);
	const templateDir = path.resolve(__dirname, "templates", "basic");

	// Check if target directory already exists
	if (fs.existsSync(targetDir)) {
		console.error(`\n❌ Directory "${projectName}" already exists!`);
		process.exit(1);
	}

	try {
		console.log(`\n📁 Creating project "${projectName}"...`);

		// Copy template directory
		copyDir(templateDir, targetDir);

		// Rename gitignore to .gitignore
		const gitignoreSrc = path.join(targetDir, "gitignore");
		const gitignoreDest = path.join(targetDir, ".gitignore");
		if (fs.existsSync(gitignoreSrc)) {
			fs.renameSync(gitignoreSrc, gitignoreDest);
		}

		// Update package.json with project name
		const packageJsonPath = path.join(targetDir, "package.json");
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
		packageJson.name = projectName;

		fs.writeFileSync(
			packageJsonPath,
			JSON.stringify(packageJson, null, "\t") + "\n"
		);

		console.log("✅ Project created successfully!\n");
		console.log("Next steps:");
		console.log(`  cd ${projectName}`);
		console.log("  pnpm install");
		console.log("  pnpm dev\n");
		console.log("Happy coding! 🌸");
	} catch (error) {
		console.error("❌ Error creating project:", error.message);
		process.exit(1);
	}
}

function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

main().catch(console.error);
