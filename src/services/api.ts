import axios from './axios.customize';

export const loginApi = (username: string, password: string) => {
    return axios.post<IBackendRes<IAuth>>('/login', { email: username, password });
};
export const registerApi = (
    fullName: string,
    email: string,
    password: string,
    phone: string,
    role: string,
    departIdentity: string,
    position: string,
    gender: string,
    dateOfBirth: string,
    address: string,
    avatar?: string,
) => {
    const urlBackend = '/register';
    return axios.post<IBackendRes<IAuth>>(urlBackend, {
        fullName,
        email,
        password,
        phone,
        role: role ? role : 'user',
        avatar: avatar ? avatar : 'user.png',
        originalPass: password,
        departIdentity,
        position: position,
        gender: gender,
        dateOfBirth,
        address,
        createAt: new Date(),
    });
};
export const getUserByIdApi = (id: string) => {
    return axios.get<IBackendRes<IUser>>(`/660/users/${id}`);
};

export const getUsersApi = (query: string) => {
    return axios.get<IBackendRes<IUser[]>>(`/660/users?_page=1&_limit=100${query}`);
};

export const getAllUsers = () => {
    return axios.get<IBackendRes<IUser[]>>('/660/users');
};
export const importUserApi = (
    fullName: string,
    email: string,
    phone: string,
    password?: string,
    role?: string,
    avatar?: string,
) => {
    const urlBackend = '/register';
    return axios.post<IBackendRes<IAuth>>(urlBackend, {
        fullName,
        email,
        phone,
        password: password ? password : '123456',
        role: role ? role : 'user',
        avatar: avatar ? avatar : 'user.png',
        originalPass: password ? password : '123456',
        createAt: new Date(),
    });
};
export const updateUserApi = (
    id: string,
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: string,
    departIdentity: string,
    position: string,
    gender: string,
    dateOfBirth: string,
    address: string,
    avatar?: string,
) => {
    const urlBackend = `/660/users/${id}`;
    return axios.put<IBackendRes<IUser>>(urlBackend, {
        email,
        password,
        fullName,
        phone,
        role,
        avatar: avatar ? avatar : 'user.png',
        originalPass: password,
        departIdentity,
        position: position,
        gender: gender,
        dateOfBirth,
        address,
        createAt: new Date(),
    });
};
export const deleteUserApi = (id: string) => {
    const urlBackend = `/660/users/${id}`;
    return axios.delete<IBackendRes<IAuth>>(urlBackend);
};
export const getCategoryApi = () => {
    const urlBackend = `/categories`;
    return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};
export const getCategoryWidthQueryApi = (query: string) => {
    const urlBackend = `/categories?_page=1&${query}`;
    return axios.get<IBackendRes<ICategory[]>>(urlBackend);
};
export const getCategoryByIdApi = (id: string) => {
    const urlBackend = `/categories/${id}`;
    return axios.get<IBackendRes<ICategory>>(urlBackend);
};
export const createCategoryApi = (categoryName: string) => {
    const urlBackend = `/660/categories`;
    return axios.post<IBackendRes<ICategory>>(urlBackend, {
        categoryName,
        createAt: new Date(),
    });
};
export const updateCategoryApi = (id: string, categoryName: string, createAt: string) => {
    const urlBackend = `/660/categories/${id}`;
    return axios.put<IBackendRes<ICategory>>(urlBackend, {
        categoryName,
        createAt,
    });
};
export const deleteCategoryApi = (id: string) => {
    const urlBackend = `/660/categories/${id}`;
    return axios.delete<IBackendRes<ICategory>>(urlBackend);
};
export const getDepartmentsApi = (query: string) => {
    return axios.get<IBackendRes<IDepartment[]>>(`/departments?_page=1&${query}`);
};
export const getDepartmentByIdApi = (id: string) => {
    return axios.get<IBackendRes<IDepartment>>(`/departments/${id}`);
};
export const createDepartmentApi = (
    name: string,
    userId: string,
    userName: string,
    affiliatedUnit: string,
    storageId: string,
) => {
    const urlBackend = `/660/departments`;
    return axios.post<IBackendRes<IDepartment>>(urlBackend, {
        name,
        userId,
        userName,
        storageId,
        affiliatedUnit,
        createAt: new Date(),
    });
};
export const updateDepartmentApi = (
    id: string,
    name: string,
    userId: string,
    userName: string,
    affiliatedUnit: string,
    storageId: string,
    createAt: string,
) => {
    const urlBackend = `/660/departments/${id}`;
    return axios.put<IBackendRes<IDepartment>>(urlBackend, {
        name,
        userId,
        userName,
        affiliatedUnit,
        storageId,
        createAt,
    });
};
export const deleteDepartmentApi = (id: string) => {
    const urlBackend = `/660/departments/${id}`;
    return axios.delete<IBackendRes<IDepartment>>(urlBackend);
};

export const getSuppliesApi = (query: string) => {
    return axios.get<IBackendRes<ISupplies[]>>(`/supplies?_page=1&${query}`);
};
export const getSupplyByIdApi = (id: string) => {
    return axios.get<IBackendRes<ISupplies>>(`/supplies/${id}`);
};
export const createSupplyApi = (
    name: string,
    categoryId: string,
    desc: string,
    unit: string, //don vi tinh
    manufacturer: string,
    batchNumber: number,
    expirationDate: string,
    costPrice: number,
    quantity: number,
    status: number,
    thumbnail?: string,
) => {
    const urlBackend = `/660/supplies`;
    return axios.post<IBackendRes<ISupplies>>(urlBackend, {
        name,
        categoryId,
        desc,
        unit,
        manufacturer,
        batchNumber,
        expirationDate,
        costPrice,
        quantity,
        status,
        thumbnail: thumbnail ? thumbnail : 'user.png',
        createAt: new Date(),
        updateAt: new Date(),
    });
};
export const updateSupplyApi = (
    id: string,
    name: string,
    categoryId: string,
    desc: string,
    unit: string, //don vi tinh
    manufacturer: string,
    batchNumber: number,
    expirationDate: string,
    costPrice: number,
    quantity: number,
    status: number,
    createAt: string,
    thumbnail?: string,
) => {
    const urlBackend = `/660/supplies/${id}`;
    return axios.put<IBackendRes<ISupplies>>(urlBackend, {
        name,
        categoryId,
        desc,
        unit,
        manufacturer,
        batchNumber,
        expirationDate,
        costPrice,
        quantity,
        status,
        thumbnail: thumbnail ? thumbnail : 'user.png',
        createAt,
        updateAt: new Date(),
    });
};
export const updateQuantitySupplyApi = (id: string, quantity: number) => {
    const urlBackend = `/660/supplies/${id}`;
    return axios.patch<IBackendRes<ISupplies>>(urlBackend, {
        quantity,
        updateAt: new Date(),
    });
};
export const deleteSupplyApi = (id: string) => {
    const urlBackend = `/660/supplies/${id}`;
    return axios.delete<IBackendRes<ISupplies>>(urlBackend);
};
export const getMaterialRequestsApi = (query: string) => {
    return axios.get<IBackendRes<IMaterialRequest[]>>(`/requests?_page=1&${query}`);
};
export const createMaterialRequestsApi = (
    requestName: string,
    requesterInfo: RequesterInfo,
    materialRequests: MaterialRequests[],
) => {
    const urlBackend = `/660/requests`;
    return axios.post<IBackendRes<IMaterialRequest>>(urlBackend, {
        requestName,
        requesterInfo,
        materialRequests,
        status: 0,
        createAt: new Date(),
        updateAt: new Date(),
    });
};
export const updateStatusMaterialRequestApi = (id: string, status: number) => {
    const urlBackend = `/660/requests/${id}`;
    return axios.patch<IBackendRes<IMaterialRequest>>(urlBackend, {
        status,
        updateAt: new Date(),
    });
};
export const updateMaterialRequestApi = (id: string, status: number, materialRequests: MaterialRequests[]) => {
    const urlBackend = `/660/requests/${id}`;
    return axios.patch<IBackendRes<IMaterialRequest>>(urlBackend, {
        status,
        materialRequests,
        updateAt: new Date(),
    });
};
export const getImportRequestsApi = (query: string) => {
    return axios.get<IBackendRes<IImportRequest[]>>(`/importRequests?_page=1&${query}`);
};
export const createImportRequestsApi = (
    requestName: string,
    requesterName: string,
    materialRequests: MaterialRequests[],
) => {
    const urlBackend = `/660/importRequests`;
    return axios.post<IBackendRes<IMaterialRequest>>(urlBackend, {
        requestName,
        requesterName,
        materialRequests,
        status: 0,
        createAt: new Date(),
        updateAt: new Date(),
    });
};

export const getManufacturerApi = () => {
    const urlBackend = `/manufacturers`;
    return axios.get<IBackendRes<IManufacturer[]>>(urlBackend);
};
export const getManufacturerWidthQueryApi = (query: string) => {
    const urlBackend = `/manufacturers?_page=1&${query}`;
    return axios.get<IBackendRes<IManufacturer[]>>(urlBackend);
};
export const getManufacturerByIdApi = (id: string) => {
    const urlBackend = `/manufacturers/${id}`;
    return axios.get<IBackendRes<IManufacturer>>(urlBackend);
};
export const createManufacturerApi = (name: string) => {
    const urlBackend = `/660/manufacturers`;
    return axios.post<IBackendRes<IManufacturer>>(urlBackend, {
        name,
        createAt: new Date(),
        updateAt: new Date(),
    });
};
export const updateManufacturerApi = (id: string, name: string, createAt: string) => {
    const urlBackend = `/660/manufacturers/${id}`;
    return axios.put<IBackendRes<IManufacturer>>(urlBackend, {
        name,
        createAt,
        updateAt: new Date(),
    });
};
export const deleteManufacturerApi = (id: string) => {
    const urlBackend = `/660/manufacturers/${id}`;
    return axios.delete<IBackendRes<IManufacturer>>(urlBackend);
};

export const getUnitApi = () => {
    const urlBackend = `/units`;
    return axios.get<IBackendRes<IUnit[]>>(urlBackend);
};
export const getUnitWidthQueryApi = (query: string) => {
    const urlBackend = `/units?_page=1&${query}`;
    return axios.get<IBackendRes<IUnit[]>>(urlBackend);
};
export const getUnitByIdApi = (id: string) => {
    const urlBackend = `/units/${id}`;
    return axios.get<IBackendRes<IUnit>>(urlBackend);
};
export const createUnitApi = (name: string) => {
    const urlBackend = `/660/units`;
    return axios.post<IBackendRes<IUnit>>(urlBackend, {
        name,
        createAt: new Date(),
        updateAt: new Date(),
    });
};
export const updateUnitApi = (id: string, name: string, createAt: string) => {
    const urlBackend = `/660/units/${id}`;
    return axios.put<IBackendRes<IUnit>>(urlBackend, {
        name,
        createAt,
        updateAt: new Date(),
    });
};
export const deleteUnitApi = (id: string) => {
    const urlBackend = `/660/units/${id}`;
    return axios.delete<IBackendRes<IUnit>>(urlBackend);
};
export const getStorageApi = (query: string) => {
    const urlBackend = `/storages?_page=1&${query}`;
    return axios.get<IBackendRes<IStorage[]>>(urlBackend);
};
