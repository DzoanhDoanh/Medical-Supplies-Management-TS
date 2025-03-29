/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { addBookApi, createSupplyApi, getCategoryApi, getCategoryByIdApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select, Upload, Row, Col, InputNumber, DatePicker } from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
}
type FieldType = {
    name: string;
    categoryId: string;
    desc: string;
    unit: string;
    manufacturer: string;
    batchNumber: number;
    expirationDate: string;
    costPrice: number;
    quantity: number;
    status: number;
    createAt: string;
    updateAt: string;
    thumbnail?: string;
};
const { Option } = Select;
const CreateSupply = (props: IProps) => {
    const { openModalCreate, setOpenModalCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [listCategory, setListCategory] = useState<ICategory[]>([]);

    // start handle image
    const [previewOpenThumb, setPreviewOpenThumb] = useState(false);
    const [previewImageThumb, setPreviewImageThumb] = useState<string>('');
    const [fileListThumb, setFileListThumb] = useState<any[]>([]);

    const [form] = Form.useForm();

    // Xử lý hiển thị ảnh preview
    const handlePreview = async (file: any) => {
        setPreviewImageThumb(file.thumbUrl || file.url);
        setPreviewOpenThumb(true);
    };
    // Xử lý thêm file vào danh sách (không gửi lên server ngay)
    const handleChange = ({ fileList }: any) => {
        setFileListThumb(fileList);
    };

    // end handle image

    const { message } = App.useApp();
    const normFile = (e: any) => {
        console.log('File event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };
    useEffect(() => {
        const fetchCategory = async () => {
            const res = await getCategoryApi();
            if (res && res.data) {
                setListCategory(res.data);
            }
        };
        fetchCategory();
    }, []);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        try {
            if (fileListThumb.length === 0) {
                const res = await createSupplyApi(
                    values.name,
                    values.categoryId,
                    values.desc,
                    values.unit,
                    values.manufacturer,
                    values.batchNumber,
                    values.expirationDate,
                    values.costPrice,
                    values.quantity,
                    2,
                );
                if (res && res.data) {
                    message.success('Thêm mới thành công!');
                    setIsSubmit(false);
                    form.resetFields();
                    refreshTable();
                    setOpenModalCreate(false);
                } else {
                    message.error('Thêm mới thất bại!');
                    setIsSubmit(false);
                }
            } else {
                const fileObj = fileListThumb[0].originFileObj;
                // Chuyển file thành base64
                const reader = new FileReader();
                reader.readAsDataURL(fileObj);
                const base64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });

                const res = await createSupplyApi(
                    values.name,
                    values.categoryId,
                    values.desc,
                    values.unit,
                    values.manufacturer,
                    values.batchNumber,
                    values.expirationDate,
                    values.costPrice,
                    values.quantity,
                    2,
                    base64,
                );
                if (res && res.data) {
                    message.success('Thêm mới thành công!');
                    setIsSubmit(false);
                    form.resetFields();
                    refreshTable();
                    setOpenModalCreate(false);
                } else {
                    message.error('Thêm mới thất bại!');
                    setIsSubmit(false);
                }
            }
        } catch (error) {
            console.log(error);
            message.error('Error: ' + error);
            setIsSubmit(false);
        }
    };
    const priceRules: Rule[] = [
        { required: true, message: 'Giá nhập là bắt buộc' },
        { type: 'number', min: 0, message: 'Giá nhập phải là số' },
    ];
    const quantityRules: Rule[] = [
        { required: true, message: 'Số lượng là bắt buộc' },
        {
            validator: (_, value) => {
                if (value >= 0) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('Số lượng không được nhỏ hơn 0!'));
            },
        },
    ];
    return (
        <>
            <Modal
                title="Thêm mới sản phẩm"
                open={openModalCreate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalCreate(false);
                    form.resetFields();
                }}
                okText={'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={isSubmit}
                width={800}
            >
                <Divider />
                <Form form={form} name="basic" layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                label="Tên vật tư"
                                name="name"
                                rules={[{ required: true, message: 'Tên vật tư là bắt buộc' }]}
                            >
                                <Input placeholder="Điền tên vật tư" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Mô tả"
                                name="desc"
                                rules={[{ required: true, message: 'Mô tả là bắt buộc' }]}
                            >
                                <Input placeholder="Vui lòng viết mô tả " />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Danh mục vật tư"
                                name="categoryId"
                                rules={[{ required: true, message: 'danh mục vật tư là bắt buộc' }]}
                            >
                                <Select placeholder="Vui lòng chọn danh mục vật tư" allowClear>
                                    {listCategory &&
                                        listCategory.map((category) => (
                                            <Option key={category.id} value={category.id}>
                                                {category.categoryName}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>
                            <Form.Item<FieldType>
                                label="Hãy điền đơn vị tính"
                                name="unit"
                                rules={[{ required: true, message: 'Đơn vị tính là bắt buộc' }]}
                            >
                                <Input placeholder="Vui lòng điền đơn vị tính " />
                            </Form.Item>
                            <Form.Item<FieldType>
                                label="Vui lòng điền tên nhà cung cấp"
                                name="manufacturer"
                                rules={[{ required: true, message: 'Nhà cung cấp là bắt buộc' }]}
                            >
                                <Input placeholder="Vui lòng điền tên nhà cung cấp " />
                            </Form.Item>
                            <Form.Item
                                label="Hãy chọn ảnh đại diện cho vật tư"
                                name="thumbnail"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
                                <Upload
                                    listType="picture-card"
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    fileList={fileListThumb}
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    multiple
                                >
                                    {fileListThumb.length >= 8 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Chọn tệp</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType>
                                label="Số lô sản xuất"
                                name="batchNumber"
                                rules={[
                                    { required: true, message: 'Số lô sản xuất là bắt buộc' },
                                    {
                                        validator: (_, value) => {
                                            if (value >= 0) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Số lô sản xuất không được nhỏ hơn 0'));
                                        },
                                    },
                                ]}
                            >
                                <Input type="number" placeholder="Vui lòng điền số lô sản xuất" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Chọn hạn sử dụng"
                                name="expirationDate"
                                rules={[{ required: true, message: 'Hạn sử dụng là bắt buộc' }]}
                            >
                                <DatePicker />
                            </Form.Item>
                            <Form.Item<FieldType> label="Giá nhập" name="costPrice" rules={priceRules}>
                                <InputNumber<number>
                                    defaultValue={1000}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                    addonAfter={'đ'}
                                />
                            </Form.Item>
                            {/* <Form.Item<FieldType>
                                label="Trạng thái"
                                name="status"
                                rules={[{ required: true, message: 'Trạng thái là bắt buộc' }]}
                            >
                                <Select placeholder="Vui lòng chọn trạng thái" allowClear>
                                    <Option value={2}>Tốt</Option>
                                </Select>
                            </Form.Item> */}

                            <Form.Item<FieldType> label="Số lượng" name="quantity" rules={quantityRules}>
                                <Input min={0} type="number" placeholder="Enter quantity" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default CreateSupply;
