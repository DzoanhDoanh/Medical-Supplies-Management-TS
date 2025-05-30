/* eslint-disable @typescript-eslint/no-unused-vars */
import { getImportRequestsApi, getUsersApi, updateStatusMateriaImportApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { EditTwoTone, ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Badge, Button, Divider, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailDepartment from './detail.material.import';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';

type TSearch = {
    requestName: string;
    createAt: string;
    createAtRange: string;
};
const TableMaterialImportApproved = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IImportRequest | null>(null);
    const [excelData, setExcelData] = useState([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [isDeleteMaterialRequest, setIsDeleteMaterialRequest] = useState<boolean>(false);
    const { message } = App.useApp();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUsersApi('');
            if (res && res.data) {
                setUsers(res.data);
            }
        };
        fetchUser();
    }, []);

    const handleApprove = async (entity: IImportRequest) => {
        try {
            const res = await updateStatusMateriaImportApi(entity.id, 1);
            if (res && res.data) {
                message.success('Duyệt đơn thành công');
                refreshTable();
            } else {
                message.error('Có lỗi xảy ra vui lòng thử lại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra vui lòng thử lại');
        }
    };
    const handleReject = async (entity: IImportRequest) => {
        try {
            const res = await updateStatusMateriaImportApi(entity.id, 2);
            if (res && res.data) {
                message.success('Đã từ chối đơn này');
                refreshTable();
            } else {
                message.error('Có lỗi xảy ra vui lòng thử lại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra vui lòng thử lại');
        }
    };
    const handlePrint = async (entity: IImportRequest) => {
        const requestData = {
            requestNumber: entity.id,
            requestName: entity.requestName || 'N/A',
            requester: users.find((e) => e.id === entity.requesterName)?.fullName || 'N/A',
            senderInfo: entity.senderInfo?.userName,
            state: entity.receiverInfo?.userName,
            requestDate: dayjs(entity.createAt).format('DD/MM/YYYY'),
            items: entity.materialRequests.map((item, index) => ({
                stt: index + 1,
                name: item.materialName,
                quantity: item.deliveredQuantity,
            })),
        };

        // Tiêu đề phiếu yêu cầu
        const title = new Paragraph({
            children: [new TextRun({ text: 'PHIẾU NHẬP VẬT TƯ', bold: true, size: 28 })],
            alignment: 'center',
        });

        // Thông tin chung (xuống dòng mỗi dòng riêng biệt)
        const info = [
            new Paragraph({ children: [new TextRun(`Số phiếu: ${requestData.requestNumber}`)] }),
            new Paragraph({ children: [new TextRun(`Người nhập: ${requestData.senderInfo}`)] }),
            new Paragraph({ children: [new TextRun(`Ngày nhập: ${requestData.requestDate}`)] }),
            new Paragraph({ children: [new TextRun(`Đợt nhập: ${requestData.state}`)] }),
        ];

        // Tạo bảng danh sách vật tư
        const table = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                // Header của bảng
                new TableRow({
                    children: ['STT', 'Tên vật tư', 'Số lượng'].map(
                        (text) =>
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                            }),
                    ),
                }),
                // Dữ liệu vật tư
                ...requestData.items.map(
                    (item) =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(item.stt.toString())] }),
                                new TableCell({ children: [new Paragraph(item.name)] }),
                                new TableCell({ children: [new Paragraph((item.quantity ?? 0).toString())] }),
                            ],
                        }),
                ),
            ],
        });

        // Chữ ký
        const signature = new Paragraph({
            children: [new TextRun('\n\nNgười nhập\n(Ký và ghi rõ họ tên)')],
            alignment: 'right',
        });

        // Tạo file Word
        const doc = new Document({
            sections: [{ properties: {}, children: [title, ...info, table, signature] }],
        });

        // Chuyển thành file Blob
        const blob = await Packer.toBlob(doc);

        // Tải file xuống mà không hiển thị hộp thoại in
        saveAs(blob, 'Phieu_Nhap_Vat_Tu.docx');
    };
    const columns: ProColumns<IImportRequest>[] = [
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
            dataIndex: 'requestName',
            render(dom, entity) {
                return <span>{entity.requestName}</span>;
            },
        },
        {
            title: 'Tên người đề nghị',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    const result = users.findIndex((e) => e.id === entity.requesterName);
                    return <span>{users[result].fullName || entity.requesterName}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Tên người nhập',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    return <span>{entity.senderInfo?.userName}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Vật tư đề nghị nhập',
            hideInSearch: true,
            render(dom, entity) {
                return entity.materialRequests.map((item) => {
                    return (
                        <div key={item.materialId}>
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
            title: 'Trạng thái',
            dataIndex: 'status',
            hideInSearch: true,
            render(dom, entity) {
                return entity.status === 0 ? (
                    <Badge status="default" text="Đang chờ" />
                ) : entity.status === 1 ? (
                    <Badge status="success" text="Đã duyệt" />
                ) : entity.status === 2 ? (
                    <Badge status="error" text="Từ chối" />
                ) : (
                    <Badge status="warning" text="Đã nhập vào kho tổng" />
                );
            },
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'createAt',
            valueType: 'date',
            hideInSearch: true,
            render(dom, entity) {
                return <>{dayjs(entity.createAt).format('DD-MM-YYYY')}</>;
            },
        },
        {
            title: 'Create At',
            dataIndex: 'createAtRange',
            valueType: 'dateRange',
            sorter: true,
            hideInTable: true,
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            render(dom, entity) {
                return (
                    <>
                        {entity.status === 0 ? (
                            <Popconfirm
                                placement="leftTop"
                                title={'Duyệt đơn yêu cầu'}
                                description="Bạn có muốn duyệt đơn này?"
                                onConfirm={() => handleApprove(entity)}
                                onCancel={() => handleReject(entity)}
                                okText="Duyệt"
                                cancelText="Từ chối"
                                okButtonProps={{ loading: isDeleteMaterialRequest }}
                            >
                                <EditTwoTone twoToneColor={'#f57800'} style={{ cursor: 'pointer', marginRight: 15 }} />
                            </Popconfirm>
                        ) : (
                            <></>
                        )}

                        <span style={{ cursor: 'pointer', marginLeft: '20px' }} onClick={() => handlePrint(entity)}>
                            <PrinterOutlined twoToneColor={'#ff4d4f'} style={{ cursor: 'pointer' }} />
                        </span>
                        {/* <span style={{ cursor: 'pointer', marginLeft: '20px' }}>
                            <PrinterOutlined twoToneColor={'#ff4d4f'} style={{ cursor: 'pointer' }} />
                        </span> */}
                    </>
                );
            },
        },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    };
    return (
        <>
            <ProTable<IImportRequest, TSearch>
                columns={columns}
                scroll={{ x: 1000 }}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if (params) {
                        if (params.requestName) {
                            query += `&requestName_like=${params.requestName}`;
                        }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allMaterialRequest = await getImportRequestsApi(query + '&status=3');
                    if (allMaterialRequest && typeof allMaterialRequest.data !== 'string') {
                        if (allMaterialRequest.data) {
                            const data = allMaterialRequest.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    requestName: item.requestName,
                                    executer: item.senderInfo?.userName,
                                    materials: item.materialRequests.map(
                                        (item) => item.materialName + '(' + item.deliveredQuantity + '),',
                                    ),
                                    createAt: item.createAt,
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
                headerTitle="Danh sách đơn nhập vật tư"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-material-request.csv">
                            Tải excel
                        </CSVLink>
                    </Button>,
                ]}
            />
            <DetailDepartment
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
        </>
    );
};

export default TableMaterialImportApproved;
