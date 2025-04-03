import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getImportRequestsApi, getMaterialRequestsApi, getUsersApi } from '@/services/api';

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

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
};

interface IProps {
    fromDate: string;
    toDate: string;
}
const MaterialRequestReport = ({ fromDate, toDate }: IProps) => {
    const [materialRequests, setMaterialRequests] = useState<IMaterialRequest[]>([]);
    const [importRequests, setImportRequests] = useState<IImportRequest[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchImport, fetchExport, fetchUser] = await Promise.all([
                    getImportRequestsApi(''),
                    getMaterialRequestsApi('&status=3'),
                    getUsersApi(''),
                ]);
                if (fetchImport?.data) setImportRequests(fetchImport.data);
                if (fetchExport?.data) setMaterialRequests(fetchExport.data);
                if (fetchUser.data) setUsers(fetchUser.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const filterRequestsByDate = <T extends { createAt: string }>(requests: T[]) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // Đảm bảo lấy hết ngày cuối cùng

        return requests.filter((req) => {
            const requestDate = new Date(req.createAt);
            return requestDate >= from && requestDate <= to;
        });
    };

    const filteredMaterialRequests = filterRequestsByDate(materialRequests);
    const filteredImportRequests = filterRequestsByDate(importRequests);

    const columns = [
        { title: 'Loại yêu cầu', dataIndex: 'type', key: 'type' },
        { title: 'Ngày tạo', dataIndex: 'createAt', key: 'createAt' },
        { title: 'Người thực hiện', dataIndex: 'requester', key: 'requester' },
        { title: 'Tên vật tư', dataIndex: 'materials', key: 'materials' },
        { title: 'Tổng số lượng yêu cầu', dataIndex: 'totalQuantity', key: 'totalQuantity' },
        { title: 'Tổng đã giao', dataIndex: 'totalDelivered', key: 'totalDelivered' },
    ];

    const data = [
        ...filteredMaterialRequests.map((req) => ({
            key: req.id,
            type: 'Xuất kho',
            createAt: formatDate(req.createAt),
            requester: users.find((e) => e.id === req.requesterInfo.requesterName)?.fullName,
            materials: req.materialRequests.map((m) => `${m.materialName} (${m.quantity})`).join(', '),
            totalQuantity: req.materialRequests.reduce((sum, m) => sum + m.quantity, 0),
            totalDelivered: req.materialRequests.reduce((sum, m) => sum + (m.deliveredQuantity || 0), 0),
        })),
        ...filteredImportRequests.map((req) => ({
            key: req.id,
            type: 'Nhập kho',
            createAt: formatDate(req.createAt),
            requester: users.find((e) => e.id === req.requesterName)?.fullName,
            materials: req.materialRequests.map((m) => `${m.materialName} (${m.quantity})`).join(', '),
            totalQuantity: req.materialRequests.reduce((sum, m) => sum + m.quantity, 0),
            totalDelivered: '-',
        })),
    ];

    return (
        <div>
            <Table columns={columns} dataSource={data} pagination={false} />
        </div>
    );
};

export default MaterialRequestReport;
