import dayjs from 'dayjs';

export interface MaterialStorage {
    supplyId: string;
    materialName: string;
    quantity: number; // Số lượng hiện tại trong kho
}

export interface MaterialRequest {
    materialId: string;
    quantity: number;
    deliveredQuantity?: number; // chỉ với phiếu xuất
}

export interface ImportRequest {
    materialRequests: MaterialRequest[];
    createAt: string; // ngày tạo phiếu nhập
}

export interface ExportRequest {
    materialRequests: MaterialRequest[];
    updateAt: string; // ngày cập nhật phiếu xuất
}

export interface MaterialStockReport {
    key: string;
    name: string;
    openingStock: number; // tồn đầu kỳ
    importInPeriod: number; // nhập trong kỳ
    exportInPeriod: number; // xuất trong kỳ
    closingStock: number; // tồn cuối kỳ
}

/**
 * Hàm tính toán tồn kho theo khoảng thời gian
 */
export function calculateMaterialStock(
    materials: MaterialStorage[],
    importRequests: ImportRequest[],
    exportRequests: ExportRequest[],
    fromDate: string,
    toDate: string
): MaterialStockReport[] {
    const from = dayjs(fromDate);
    const to = dayjs(toDate);

    const reports: MaterialStockReport[] = materials.map((material) => {
        const { supplyId, materialName, quantity } = material;

        // Tổng nhập sau fromDate -> hiện tại
        const totalImportAfterFrom = importRequests.reduce((total, req) => {
            if (dayjs(req.createAt).isAfter(from)) {
                const materialReq = req.materialRequests.find((m) => m.materialId === supplyId);
                return total + (materialReq ? materialReq.quantity : 0);
            }
            return total;
        }, 0);

        // Tổng xuất sau fromDate -> hiện tại
        const totalExportAfterFrom = exportRequests.reduce((total, req) => {
            if (dayjs(req.updateAt).isAfter(from)) {
                const materialReq = req.materialRequests.find((m) => m.materialId === supplyId);
                return total + (materialReq ? materialReq.deliveredQuantity || 0 : 0);
            }
            return total;
        }, 0);

        // Tính tồn đầu kỳ
        const openingStock = quantity - totalImportAfterFrom + totalExportAfterFrom;

        // Tổng nhập trong kỳ
        const importInPeriod = importRequests.reduce((total, req) => {
            if (dayjs(req.createAt).isBetween(from, to, null, '[]')) {
                const materialReq = req.materialRequests.find((m) => m.materialId === supplyId);
                return total + (materialReq ? materialReq.quantity : 0);
            }
            return total;
        }, 0);

        // Tổng xuất trong kỳ
        const exportInPeriod = exportRequests.reduce((total, req) => {
            if (dayjs(req.updateAt).isBetween(from, to, null, '[]')) {
                const materialReq = req.materialRequests.find((m) => m.materialId === supplyId);
                return total + (materialReq ? materialReq.deliveredQuantity || 0 : 0);
            }
            return total;
        }, 0);

        // Tính tồn cuối kỳ
        const closingStock = openingStock + importInPeriod - exportInPeriod;

        return {
            key: supplyId,
            name: materialName,
            openingStock,
            importInPeriod,
            exportInPeriod,
            closingStock,
        };
    });

    return reports;
}
