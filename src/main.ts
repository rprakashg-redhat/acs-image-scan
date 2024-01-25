import * as core from "@actions/core";
import * as io from "@actions/io";
import * as ioUtil from "@actions/io/lib/io-util";
import * as path from "path";
import { Command } from "./command";
import { UploadArtifact } from "./uploadArtifact";
import { Inputs, Outputs } from "./generated/inputs-outputs";
import * as fs from "mz/fs";
import uuidV4 from 'uuid/v4'
import { FindBinaryStatus } from "./helper";
import { Installer } from "./installer";

export async function run(): Promise<void> {
    const runnerOS = process.env.RUNNER_OS || process.platform;
    const centralUrl = core.getInput(Inputs.CENTRAL, { required: true });
    const apiToken = core.getInput(Inputs.API_TOKEN, { required: true });
    const image = core.getInput(Inputs.IMAGE, { required: true });
    const output = core.getInput(Inputs.OUTPUT);
    const outputPath = core.getInput(Inputs.OUTPUT_PATH, { required: true });
    
    let reportExt = ""
    switch(output) {
        case "json":
        case "sarif":
            reportExt = ".json";
            break;
        case "csv":
            reportExt = ".csv"
            break;
        case "table":
            reportExt = ".txt"
            break;
        default:
            core.setFailed(`Unsupported output: ${output}`)
            break;
    }
    
    // check valid output directory path is specified
    if (!( await ioUtil.exists(outputPath))) {
        core.info(`Specified output directory path ${outputPath} doesn't exist, creating...`)
        await io.mkdirP(outputPath);
    }
    
    const reportName = path.join(image, uuidV4(), reportExt);
    const scanReport = path.join(outputPath, reportName)

    //set rox api token environment variable
    process.env.ROX_API_TOKEN = apiToken;

    let roxctl = await io.which("roxctl", false);
    if (roxctl === "") {
        core.debug(`roxctl not installed, installing latest version of roxctl`);
        const binary: FindBinaryStatus = await Installer.install("latest", runnerOS);
        if (binary.found === false) {
            throw new Error("Error installing");
        }
        roxctl = binary.path;
        core.debug("Installed roxctl");

    }
    core.debug(`Runner OS: ${runnerOS}`)
    const imageCheckCmd = [
        "image scan --output json --insecure-skip-tls-verify",
    ];

    // add central URL to command
    imageCheckCmd.push("--endpoint");
    imageCheckCmd.push(centralUrl + ":443");

     //add image to run container vulnerability scanning on
    imageCheckCmd.push("--image");
    imageCheckCmd.push(image);

    
    core.info(`running roxctl ${imageCheckCmd.toString()}`);
    const result = await Command.execute(roxctl, imageCheckCmd);
    if (result.exitCode !== 0) {
        core.setOutput(Outputs.PASS, false);
    }
    
    // save the command output to an output file
    await fs.writeFile(scanReport, result.output, "utf-8");

    // add upload the output as artifact
    UploadArtifact.upload(reportName, [scanReport])

    // set output
    core.setOutput(Outputs.PASS, true);
}

run().catch(core.setFailed);
