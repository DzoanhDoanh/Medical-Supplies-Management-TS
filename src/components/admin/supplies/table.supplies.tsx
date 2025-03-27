import { deleteSupplyApi, getSuppliesApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
// import ImportUser from './data/import.user';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailSupply from './detail.supplies';
import CreateSupply from './create.supplies';
import UpdateSupply from './update.supplies';
// import CurrencyFormatter from '@/components/currencyFormatter/currency.formatter';

type TSearch = {
    name: string;
    manufacturer: string;
    createAt: string;
    createAtRange: string;
};
const TableSupplies = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<ISupplies | null>(null);
    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentDataTable, setCurrentDataTable] = useState<ISupplies[] | undefined>([]);
    const [excelData, setExcelData] = useState([]);
    const [dataUpdate, setDataUpdate] = useState<ISupplies | null>(null);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [isDeleteSupply, setIsDeleteSupply] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const handleDeleteSupply = async (id: string) => {
        const res = await deleteSupplyApi(id);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsDeleteSupply(true);
                return;
            } else {
                message.success('Xóa vật tư thành công');
                setIsDeleteSupply(false);
                refreshTable();
            }
        }, 500);
    };
    const columns: ProColumns<ISupplies>[] = [
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
            title: 'Tên vật tư',
            dataIndex: 'name',
        },
        // {
        //     title: 'Danh mục',
        //     dataIndex: 'categoryId',
        //     hideInSearch: true,
        // },
        // {
        //     title: 'Mô tả',
        //     dataIndex: 'desc',
        //     hideInSearch: false,
        // },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            hideInSearch: true,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'manufacturer',
            hideInSearch: false,
        },
        {
            title: 'Số lô',
            dataIndex: 'batchNumber',
            hideInSearch: false,
        },
        // {
        //     title: 'Ngày hết hạn',
        //     dataIndex: 'expirationDate',
        //     valueType: 'date',
        //     hideInSearch: true,
        //     render(dom, entity) {
        //         return <>{dayjs(entity.createAt).format('DD-MM-YYYY')}</>;
        //     },
        // },
        // {
        //     title: 'Giá nhập',
        //     dataIndex: 'costPrice',
        //     hideInSearch: true,
        //     render(dom, entity) {
        //         return <CurrencyFormatter value={entity.costPrice} />;
        //     },
        // },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            hideInSearch: false,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            hideInSearch: false,
            render(dom, entity) {
                return <span>{entity.status === 0 ? 'Hết hạn' : entity.status === 1 ? 'Sắp hết' : 'Tốt'}</span>;
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
                        <EditTwoTone
                            twoToneColor={'#f57800'}
                            style={{ cursor: 'pointer', marginRight: 15 }}
                            onClick={() => {
                                setDataUpdate(entity);
                                setOpenModalUpdate(true);
                            }}
                        />
                        <Popconfirm
                            placement="leftTop"
                            title={'Xóa vật tư'}
                            description="Bạn có chắc muốn xóa vật tư này?"
                            onConfirm={() => handleDeleteSupply(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteSupply }}
                        >
                            <span style={{ cursor: 'pointer', marginLeft: '20px' }}>
                                <DeleteTwoTone twoToneColor={'#ff4d4f'} style={{ cursor: 'pointer' }} />
                            </span>
                        </Popconfirm>
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
            <ProTable<ISupplies, TSearch>
                scroll={{ x: 1000 }}
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if (params) {
                        if (params.name) {
                            query += `&name_like=${params.name}`;
                        }
                        if (params.manufacturer) {
                            query += `&manufacturer_like=${params.manufacturer}`;
                        }
                        // const createDateRange = dateRangeValidate(params.createAtRange);
                        // if (createDateRange) {
                        //     query += `&createAt>=${createDateRange[0]}&createAt<=${createDateRange[1]}`;
                        // }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allSupplies = await getSuppliesApi(query);
                    if (allSupplies && typeof allSupplies.data !== 'string') {
                        setCurrentDataTable(allSupplies.data);
                        if (allSupplies.data) {
                            const data = allSupplies.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    categoryId: item.categoryId,
                                    desc: item.desc,
                                    unit: item.unit, //don vi tinh
                                    manufacturer: item.manufacturer,
                                    batchNumber: item.batchNumber,
                                    expirationDate: item.expirationDate,
                                    costPrice: item.costPrice,
                                    quantity: item.quantity,
                                    status: item.status,
                                    createAt: item.createAt,
                                    updateAt: item.updateAt,
                                };
                            });
                            setExcelData(result as []);
                        }
                    }
                    return {
                        data: allSupplies.data,
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
                headerTitle="Vật tư y tế"
                toolBarRender={() => [
                    <CSVLink data={excelData} filename="export-supplies.csv">
                        <Button icon={<ExportOutlined />} type="primary">
                            Tải excel
                        </Button>
                    </CSVLink>,
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setOpenModalCreate(true);
                        }}
                        type="primary"
                    >
                        Thêm mới
                    </Button>,
                ]}
            />
            <DetailSupply
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <CreateSupply
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />
            {/* <ImportUser openModalImport={openModalImport} setOpenModalImport={setOpenModalImport} /> */}
            <UpdateSupply
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                refreshTable={refreshTable}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default TableSupplies;
