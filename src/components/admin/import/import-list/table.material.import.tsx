/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    getImportRequestsApi,
    getMaterialRequestsApi,
    getUsersApi,
    updateStatusMaterialRequestApi,
} from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { EditTwoTone, ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Badge, Button, Divider, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailDepartment from './detail.material.import';

type TSearch = {
    requestName: string;
    createAt: string;
    createAtRange: string;
};
const TableMaterialImport = () => {
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
    const columns: ProColumns<IImportRequest>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Mã đơn nhập',
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
            title: 'Tên người thực hiện',
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
            title: 'Vật tư đã nhập',
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
            title: 'Tạo ngày',
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
                    const allMaterialRequest = await getImportRequestsApi(query);
                    if (allMaterialRequest && typeof allMaterialRequest.data !== 'string') {
                        if (allMaterialRequest.data) {
                            const data = allMaterialRequest.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
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

export default TableMaterialImport;
