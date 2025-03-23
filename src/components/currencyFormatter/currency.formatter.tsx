import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface CurrencyFormatterProps {
    value: number;
    locale?: string; // Locale, mặc định là 'vi-VN'
    currencySymbol?: string; // Ký hiệu tiền tệ, mặc định là 'đ'
    color?: string;
}

const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
    value,
    locale = 'vi-VN',
    currencySymbol = 'đ',
    color = 'red',
}) => {
    // Định dạng số
    const formattedValue = new Intl.NumberFormat(locale).format(value);

    return (
        <Text style={{ color: color }}>
            {formattedValue} {currencySymbol}
        </Text>
    );
};

export default CurrencyFormatter;
