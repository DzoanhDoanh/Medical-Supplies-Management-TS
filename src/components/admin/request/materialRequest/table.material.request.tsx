/* eslint-disable @typescript-eslint/no-unused-vars */
import { getMaterialRequestsApi, getUsersApi, updateStatusMaterialRequestApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { EditTwoTone, ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Badge, Button, Divider, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailDepartment from './detail.material.request';

type TSearch = {
    requestName: string;
    createAt: string;
    createAtRange: string;
};
const TableMaterialRequest = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IMaterialRequest | null>(null);
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
    const handleApprove = async (entity: IMaterialRequest) => {
        try {
            const res = await updateStatusMaterialRequestApi(entity.id, 1);
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
    const handleReject = async (entity: IMaterialRequest) => {
        try {
            const res = await updateStatusMaterialRequestApi(entity.id, 2);
            if (res && res.data) {
                message.success('Đã từ chối đơn yêu cầu');
                refreshTable();
            } else {
                message.error('Có lỗi xảy ra vui lòng thử lại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra vui lòng thử lại');
        }
    };
    const columns: ProColumns<IMaterialRequest>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Mã đơn yêu cầu',
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
            title: 'Tên người yêu cầu',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    const result = users.findIndex((e) => e.id === entity.requesterInfo.requesterName);
                    return <span>{users[result].fullName || entity.requesterInfo.requesterName}</span>;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        {
            title: 'Vật tư yêu cầu',
            hideInSearch: true,
            render(dom, entity) {
                return entity.materialRequests.map((item) => {
                    return (
                        <div key={item.materialId}>
                            <span>
                                + {item.materialName} <Divider type="vertical"></Divider> {item.quantity}
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
                    <Badge status="warning" text="Đã bàn giao" />
                );
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

                        <span style={{ cursor: 'pointer', marginLeft: '20px' }}>
                            <PrinterOutlined twoToneColor={'#ff4d4f'} style={{ cursor: 'pointer' }} />
                        </span>
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
            <ProTable<IMaterialRequest, TSearch>
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
                    const allMaterialRequest = await getMaterialRequestsApi(query);
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
                headerTitle="Duyệt đơn yêu cầu vật tư"
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

export default TableMaterialRequest;
