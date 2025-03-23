import { getOrderByUserId } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { ExportOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import DetailOrder from './detail.order';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import { useCurrentApp } from '@/components/context/app.context';

type TSearch = {
    name: string;
    address: string;
    totalPrice: string;
};
const TableOrder = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IOrder | null>(null);
    const [currentDataTable, setCurrentDataTable] = useState<IOrder[]>([]);
    const { user } = useCurrentApp();

    const columns: ProColumns<IOrder>[] = [
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
            title: 'Full Name',
            dataIndex: 'name',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            copyable: true,
        },
        {
            title: 'CreateAt',
            dataIndex: 'createAt',
            valueType: 'date',
            hideInSearch: true,
            render(dom, entity) {
                return <>{dayjs(entity.createAt).format('DD-MM-YYYY')}</>;
            },
        },
    ];
    return (
        <>
            <ProTable<IOrder, TSearch>
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
                        if (params.address) {
                            query += `&address_like=${params.address}`;
                        }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allUser = await getOrderByUserId(user?.id ?? '', query);
                    if (allUser && typeof allUser.data !== 'string') {
                        setCurrentDataTable(allUser.data ?? []);
                    }
                    return {
                        data: allUser.data,
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
                headerTitle="Table order"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={currentDataTable} filename="export-order.csv">
                            Export
                        </CSVLink>
                    </Button>,
                ]}
            />
            <DetailOrder
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
        </>
    );
};

export default TableOrder;
