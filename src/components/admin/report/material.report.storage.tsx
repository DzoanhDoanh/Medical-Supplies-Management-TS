import React, { useEffect, useState } from 'react';
import { Select, Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getStorageApi, getStorageByIdApi } from '@/services/api';
import { CSVLink } from 'react-csv';
import { ExportOutlined } from '@ant-design/icons';

interface MaterialStorage {
    supplyId: string;
    materialName: string;
    quantity: number;
}

interface IStorage {
    id: string;
    name: string;
    materials: MaterialStorage[];
}

// Thêm kiểu dữ liệu có `key`
interface MaterialStorageWithKey extends MaterialStorage {
    key: string;
}

const StorageReport: React.FC = () => {
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [selectedStorageId, setSelectedStorageId] = useState<string | null>(null);
    const [storageMaterials, setStorageMaterials] = useState<MaterialStorageWithKey[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch danh sách kho khi component mount
    useEffect(() => {
        const fetchStorages = async () => {
            try {
                const response = await getStorageApi('');
                if (response?.data) {
                    setStorages(response.data);
                }
            } catch (error) {
                message.error('Lỗi khi lấy danh sách kho.');
                console.log(error);
            }
        };

        fetchStorages();
    }, []);

    // Xử lý khi nhấn "Báo cáo"
    const handleGenerateReport = async () => {
        if (!selectedStorageId) {
            message.warning('Vui lòng chọn kho trước khi tạo báo cáo.');
            return;
        }

        setLoading(true);
        try {
            const response = await getStorageByIdApi(selectedStorageId);
            if (response?.data) {
                const storage: IStorage = response.data;
                const mappedMaterials = storage.materials.map((material) => ({
                    ...material,
                    key: material.supplyId, // Thêm key vào mỗi vật tư
                    storageName: storage.name,
                }));
                setStorageMaterials(mappedMaterials);
                message.success(`Báo cáo kho "${storage.name}" đã được tạo.`);
            } else {
                setStorageMaterials([]);
                message.info('Không có dữ liệu tồn kho.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi lấy dữ liệu tồn kho.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình cột cho bảng
    const columns: ColumnsType<MaterialStorageWithKey> = [
        { title: 'Tên vật tư', dataIndex: 'materialName', key: 'materialName' },
        { title: 'Số lượng tồn kho', dataIndex: 'quantity', key: 'quantity' },
    ];

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Select
                    placeholder="Chọn kho"
                    style={{ width: 200 }}
                    onChange={(value) => setSelectedStorageId(value)}
                    options={storages.map((storage) => ({
                        label: storage.name,
                        value: storage.id,
                    }))}
                />
                <Button type="primary" onClick={handleGenerateReport} disabled={!selectedStorageId} loading={loading}>
                    Lọc dữ liệu
                </Button>
                {storageMaterials.length === 0 ? (
                    <></>
                ) : (
                    <CSVLink data={storageMaterials} filename="report.csv" style={{ marginLeft: '12px' }}>
                        <Button icon={<ExportOutlined />} type="primary">
                            Tải excel
                        </Button>
                    </CSVLink>
                )}
            </div>
            <Table columns={columns} dataSource={storageMaterials} bordered pagination={false} loading={loading} />
        </div>
    );
};

export default StorageReport;
