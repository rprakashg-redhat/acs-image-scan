import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as path from "path";

import { CommandResult } from "./types";

export class Command {
    public static async execute(
        binary: string,
        args: string[],
        execOptions: exec.ExecOptions & { group?: boolean } = {}
    ): Promise<CommandResult> {
        let stdout = "";
        let stderr = "";

        const finalExecOptions = { ...execOptions };
        finalExecOptions.ignoreReturnCode = true; // the return code is processed below

        finalExecOptions.listeners = {
            stdline: (line): void => {
                stdout += line + "\n";
            },
            errline: (line): void => {
                stderr += line + "\n";
            },
        };
        if (execOptions.group) {
            const groupName = [ binary, ...args ].join(" ");
            core.startGroup(groupName);
        }

        try {
            const exitCode = await exec.exec(binary, args, finalExecOptions);
            if (execOptions.ignoreReturnCode !== true && exitCode !== 0) {
                let error = `${path.basename(binary)} exited with code ${exitCode}`;
                if (stderr) {
                    error += `\n${stderr}`;
                }
                throw new Error(error);
            }

            return {
                exitCode, output: stdout, error: stderr,
            };

        }
        finally {
            if (execOptions.group) {
                core.endGroup();
            }
        }
    }
}
