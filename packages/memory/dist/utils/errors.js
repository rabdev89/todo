"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get DuplicateError () {
        return DuplicateError;
    },
    get KnowledgeMemoryError () {
        return KnowledgeMemoryError;
    },
    get NotFoundError () {
        return NotFoundError;
    },
    get StorageError () {
        return StorageError;
    },
    get ValidationError () {
        return ValidationError;
    }
});
let KnowledgeMemoryError = class KnowledgeMemoryError extends Error {
    code;
    details;
    constructor(message, code, details){
        super(message), this.code = code, this.details = details;
        this.name = 'KnowledgeMemoryError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
    toJSON() {
        return {
            error: this.code,
            message: this.message,
            details: this.details
        };
    }
};
let ValidationError = class ValidationError extends KnowledgeMemoryError {
    constructor(message, details){
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
};
let DuplicateError = class DuplicateError extends KnowledgeMemoryError {
    existingId;
    duplicateType;
    constructor(message, existingId, duplicateType){
        super(message, 'DUPLICATE_ERROR', {
            existingId,
            duplicateType
        }), this.existingId = existingId, this.duplicateType = duplicateType;
        this.name = 'DuplicateError';
    }
};
let StorageError = class StorageError extends KnowledgeMemoryError {
    constructor(message, details){
        super(message, 'STORAGE_ERROR', details);
        this.name = 'StorageError';
    }
};
let NotFoundError = class NotFoundError extends KnowledgeMemoryError {
    constructor(message, id){
        super(message, 'NOT_FOUND_ERROR', id ? {
            id
        } : undefined);
        this.name = 'NotFoundError';
    }
};

//# sourceMappingURL=errors.js.map