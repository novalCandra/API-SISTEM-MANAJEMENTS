"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../errors/AppError");
const collectIssues = (details, scope, error) => {
    for (const issue of error.issues) {
        const path = issue.path.length > 0 ? issue.path.join('.') : scope;
        details[path] = issue.message;
    }
};
const validate = (schemas) => {
    return (req, _res, next) => {
        const details = {};
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (result.success) {
                req.params = result.data;
            }
            else {
                collectIssues(details, 'params', result.error);
            }
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (result.success) {
                Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
            }
            else {
                collectIssues(details, 'query', result.error);
            }
        }
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (result.success) {
                req.body = result.data;
            }
            else {
                collectIssues(details, 'body', result.error);
            }
        }
        if (Object.keys(details).length > 0) {
            next(new AppError_1.BadRequestError('Validasi gagal', details));
            return;
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map