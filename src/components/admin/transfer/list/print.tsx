import { Button, Card, Space, Table } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getDepartmentByIdApi, getHandOverApi, getStorageApi, getUsersApi } from '@/services/api';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { useCurrentApp } from '@/components/context/app.context';

const PrintOneHandOver = () => {
    const [data, setData] = useState<IHandOver[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [users, setUsers] = useState<IUser[]>([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const { user } = useCurrentApp();

    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentByIdApi(user?.departIdentity ?? '');
            const [handOverRes, userRes, storageRes] = await Promise.all([
                getHandOverApi(`&storage=${fetchDepart.data?.storageId}`),
                getUsersApi(''),
                getStorageApi(''),
            ]);
            if (handOverRes?.data) setData(handOverRes.data);
            if (userRes?.data) setUsers(userRes.data);
            if (storageRes?.data) setStorages(storageRes.data);
        };
        fetchData();
    }, []);

    const handlePrint = async () => {
        const selected = data.find((item) => item.id === selectedId);
        if (!selected) return;

        const docTitle = new Paragraph({
            children: [new TextRun({ text: 'BIÊN BẢN GIAO NHẬN VẬT TƯ', bold: true, size: 28 })],
            alignment: 'center',
        });

        const getName = (id: string | undefined) => users.find((u) => u.id === id)?.fullName || 'N/A';
        const getStorageName = (id: string | undefined) => storages.find((s) => s.id === id)?.name || 'N/A';

        const info = [
            `Mã biên bản: ${selected.id}`,
            `Tên biên bản: ${selected.name}`,
            `Người bàn giao: ${getName(selected.senderInfo?.userId)}`,
            `Người nhận: ${getName(selected.receiverInfo?.userId)}`,
            `Ngày bàn giao: ${dayjs(selected.sendDate).format('DD/MM/YYYY')}`,
            `Ngày nhận: ${dayjs(selected.receiveDate).format('DD/MM/YYYY')}`,
            `Kho thực hiện bàn giao: ${getStorageName(selected.storage)}`,
            `Đợt: ${selected.batch || 'N/A'}`,
        ].map((text) => new Paragraph({ children: [new TextRun(text)] }));

        const table = new DocxTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: ['STT', 'Tên vật tư', 'Số lượng'].map(
                        (text) =>
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                            }),
                    ),
                }),
                ...selected.materials.map(
                    (item, index) =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                                new TableCell({ children: [new Paragraph(item.materialName)] }),
                                new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                            ],
                        }),
                ),
            ],
        });

        const signature = new Paragraph({
            children: [new TextRun('\n\nNgười bàn giao\n(Ký và ghi rõ họ tên)')],
            alignment: 'right',
        });

        const doc = new Document({
            sections: [{ properties: {}, children: [docTitle, ...info, table, signature] }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Bien_Ban_Giao_${selected.id}.docx`);
    };

    return (
        <Card style={{ margin: '0 auto', marginTop: 32 }} title="Danh sách biên bản giao nhận vật tư">
            <Table
                dataSource={data}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: selectedId ? [selectedId] : [],
                    onChange: (keys) => setSelectedId(keys[0] as string),
                }}
                columns={[
                    { title: 'Mã biên bản', dataIndex: 'id' },
                    { title: 'Tên biên bản', dataIndex: 'name' },
                    {
                        title: 'Ngày bàn giao',
                        render: (_, record) => dayjs(record.sendDate).format('DD/MM/YYYY'),
                    },
                ]}
            />
            <Space style={{ marginTop: 16 }}>
                <Button icon={<PrinterOutlined />} type="primary" disabled={!selectedId} onClick={handlePrint}>
                    In biên bản
                </Button>
            </Space>
        </Card>
    );
};

export default PrintOneHandOver;
