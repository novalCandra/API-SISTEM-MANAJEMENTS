"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStockStatus = void 0;
const computeStockStatus = (item) => {
    if (item.stock <= 0)
        return 'HABIS';
    if (item.stock <= item.minStock)
        return 'MENIPIS';
    return 'AMAN';
};
exports.computeStockStatus = computeStockStatus;
//# sourceMappingURL=stock.js.map