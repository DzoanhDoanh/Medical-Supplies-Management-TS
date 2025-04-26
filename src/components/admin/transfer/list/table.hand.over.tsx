/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    getHandOverApi,
    getImportRequestsApi,
    getMaterialRequestsApi,
    getUsersApi,
    updateStatusMateriaImportApi,
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
import DetailHandOver from './detail.hand.over';

type TSearch = {
    requestName: string;
    createAt: string;
    createAtRange: string;
};
const TableHandOver = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IHandOver | null>(null);
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
            title: 'Ngày nhận',
            dataIndex: 'createAt',
            valueType: 'date',
            hideInSearch: true,
            render(dom, entity) {
                return <>{dayjs(entity.receiveDate).format('DD-MM-YYYY')}</>;
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
                        if (params.requestName) {
                            query += `&requestName_like=${params.requestName}`;
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
