import * as artifact from "@actions/artifact";
import * as path from "path";

const artifactClient = artifact.create();

export class UploadArtifact {
    public static async upload(
        artifactName: string,
        files: string[],
    ): Promise<string[]> {
        const rootDirectory = path.dirname(files[0]);
        const result = await artifactClient.uploadArtifact(
            artifactName,
            files,
            rootDirectory,
            { continueOnError: true }
        );
        return result.artifactItems;
    }
}
