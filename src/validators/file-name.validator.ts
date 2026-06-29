import { FileValidator } from "@nestjs/common";

export class FileNameValidator extends FileValidator {
    constructor() {
        super({});
    }

    isValid(
        file: any
    ): boolean {
        return !file.originalname.includes(
            ' ',
        );
    }
    
    buildErrorMessage(): string {
        return 'Filename should not contain spaces.'
    }
}