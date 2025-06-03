/* eslint-disable @typescript-eslint/no-unused-vars */
import { getHandOverApi, getStorageApi, getUsersApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { EditTwoTone, ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Badge, Button, Divider, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailHandOver from './detail.hand.over';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

type TSearch = {
    name: string;
    createAt: string;
    createAtRange: string;
};
const TableHandOver = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IHandOver | null>(null);
    const [excelData, setExcelData] = useState([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const { message } = App.useApp();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUsersApi('');
            const storage = await getStorageApi('');
            if (res && res.data) {
                setUsers(res.data);
            }
            if (storage && storage.data) {
                setStorages(storage.data);
            }
        };
        fetchUser();
    }, []);
    const handleExportHandOverToWord = async (entity: IHandOver) => {
        const docTitle = new Paragraph({
            children: [new TextRun({ text: 'BIÊN BẢN GIAO NHẬN VẬT TƯ', bold: true, size: 28 })],
            alignment: 'center',
        });

        const info = [
            new Paragraph({ children: [new TextRun(`Mã biên bản: ${entity.id}`)] }),
            new Paragraph({ children: [new TextRun(`Tên biên bản: ${entity.name}`)] }),
            new Paragraph({ children: [new TextRun(`Người bàn giao: ${entity.senderInfo?.userName || 'N/A'}`)] }),
            new Paragraph({ children: [new TextRun(`Người nhận: ${entity.receiverInfo?.userName || 'N/A'}`)] }),
            new Paragraph({ children: [new TextRun(`Ngày bàn giao: ${dayjs(entity.sendDate).format('DD/MM/YYYY')}`)] }),
            new Paragraph({ children: [new TextRun(`Ngày nhận: ${dayjs(entity.receiveDate).format('DD/MM/YYYY')}`)] }),
            new Paragraph({
                children: [
                    new TextRun(
                        `Kho thực hiện bàn giao: ${storages.find((e) => e.id === entity.storage)?.name || 'N/A'}`,
                    ),
                ],
            }),
            new Paragraph({ children: [new TextRun(`Đợt: ${entity.batch || 'N/A'}`)] }),
        ];

        const tableHeader = new TableRow({
            children: ['STT', 'Tên vật tư', 'Số lượng'].map(
                (text) =>
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                    }),
            ),
        });

        const tableRows = entity.materials.map(
            (item, index) =>
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                        new TableCell({ children: [new Paragraph(item.materialName)] }),
                        new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                    ],
                }),
        );

        const table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeader, ...tableRows],
        });

        const signature = new Paragraph({
            children: [new TextRun('\n\nNgười bàn giao\n(Ký và ghi rõ họ tên)')],
            alignment: 'right',
        });

        const doc = new Document({
            sections: [{ properties: {}, children: [docTitle, ...info, table, signature] }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Bien_Ban_Giao_Nhan_${entity.id}.docx`);
    };
    const columns: ProColumns<IHandOver>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'ID',
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true,
            render(dom, entity) {
                return (
                    <a
                        onClick={() => {
                            setDataViewDetail(entity);
                            setOpenViewDetail(true);
                        }}
                        href="#"
                    >
                        {entity.id}
                    </a>
                );
            },
        },
        {
            title: 'Tên đơn',
            hideInSearch: false,
            dataIndex: 'name',
        },
        {
            title: 'Kho thực hiện bàn giao',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    return <span>{storages.find((e) => e.id === entity.storage)?.name}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Tên người bàn giao',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    return <span>{entity.senderInfo.userName}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Tên người nhận',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    return <span>{entity.receiverInfo.userName}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Ngày bàn giao',
            dataIndex: 'createAt',
            valueType: 'date',
            hideInSearch: true,
            render(dom, entity) {
                return <>{dayjs(entity.sendDate).format('DD-MM-YYYY')}</>;
            },
        },
        {
            title: 'Vật tư bàn giao',
            hideInSearch: true,
            render(dom, entity) {
                return entity.materials.map((item) => {
                    return (
                        <div key={item.supplyId}>
                            <span style={{ display: 'flex', justifyContent: 'space-between', marginRight: '20px' }}>
                                <Badge status="success" text={item.materialName} /> <Divider type="vertical"></Divider>{' '}
                                <p>Số lượng: {item.quantity}</p>
                            </span>
                        </div>
                    );
                });
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            hideInSearch: true,
            render: (_, record) => (
                <Button icon={<PrinterOutlined />} onClick={() => handleExportHandOverToWord(record)}></Button>
            ),
        },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    };
    return (
        <>
            <ProTable<IHandOver, TSearch>
                columns={columns}
                scroll={{ x: 1000 }}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if (params) {
                        if (params.name) {
                            query += `&name_like=${params.name}`;
                        }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allMaterialRequest = await getHandOverApi(query);
                    if (allMaterialRequest && typeof allMaterialRequest.data !== 'string') {
                        if (allMaterialRequest.data) {
                            const data = allMaterialRequest.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    storage: storages.find((e) => e.id === item.storage)?.name,
                                    sender: item.senderInfo.userName,
                                    receiver: item.receiverInfo.userName,
                                    date: dayjs(item.receiveDate).format('DD/MM/YYYY'),
                                    materials: item.materials.map((item) => item.materialName + ' - ' + item.quantity),
                                };
                            });
                            setExcelData(result as []);
                        }
                    }
                    return {
                        data: allMaterialRequest.data,
                        page: 1,
                        success: true,
                        // total: 3,
                    };
                }}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    onChange: (page) => console.log(page),
                }}
                headerTitle="Danh sách bàn giao"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-hand-over.csv">
                            Tải excel
                        </CSVLink>
                    </Button>,
                ]}
            />
            <DetailHandOver
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
        </>
    );
};

export default TableHandOver;
