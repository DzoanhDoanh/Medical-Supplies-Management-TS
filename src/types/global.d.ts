export {};
declare global {
    interface IBackendRes<T> {
        [x: string]: string;
        status: number | string;
        data?: T;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        results: T[];
    }

    interface IAuth {
        accessToken: string;
        user: IUser;
    }

    interface IUser {
        email: string;
        phone: string;
        fullName: string;
        role: string;
        avatar: string;
        id: string;
        departIdentity: string;
        position: string;
        gender: string;
        dateOfBirth: string;
        address: string;
        createAt: string;
        originalPass?: string;
    }

    interface ICategory {
        id: string;
        categoryName: string;
        createAt: string;
    }
    interface IDepartment {
        id: string;
        name: string;
        affiliatedUnit: string;
        userId: string;
        userName: string;
        createAt: string;
    }
    interface ISupplies {
        id: string;
        name: string;
        categoryId: string;
        desc: string;
        unit: string; //don vi tinh
        manufacturer: string;
        batchNumber: number;
        expirationDate: string;
        costPrice: number;
        quantity: number;
        status: number;
        createAt: string;
        updateAt: string;
        thumbnail?: string;
    }
    interface RequesterInfo {
        requesterName: string;
        departmentId: string;
        type: string;
    }
    interface MaterialRequests {
        materialId: string;
        materialName: string;
        quantity: number;
        deliveredQuantity?: number;
    }
    interface IMaterialRequest {
        id: string;
        status: number;
        createAt: string;
        updateAt: string;
        requestName: string;
        requesterInfo: RequesterInfo;
        materialRequests: MaterialRequests[];
    }
    interface IImportRequest {
        id: string;
        status: number;
        createAt: string;
        updateAt: string;
        requestName: string;
        requesterName: string;
        materialRequests: MaterialRequests[];
    }
    interface IUnit {
        id: string;
        name: string;
        createAt: string;
        updateAt: string;
        a;
    }
    interface IManufacturer {
        id: string;
        name: string;
        createAt: string;
        updteAt: string;
    }
}
