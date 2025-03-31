import React, { useState } from 'react';
import { Radio } from 'antd';
import ImportExistingMaterial from './components/import.existing.material';
import ImportNewMaterial from './components/create.new.material';

const MaterialEntryMenu: React.FC = () => {
    const [formType, setFormType] = useState<'existing' | 'new'>('existing');

    return (
        <div style={{ margin: '0 auto', padding: 20, background: '#fff', borderRadius: 8 }}>
            <Radio.Group value={formType} onChange={(e) => setFormType(e.target.value)} style={{ marginBottom: 20 }}>
                <Radio.Button value="existing">Cập nhật vật tư hiện có</Radio.Button>
                <Radio.Button value="new">Thêm vật tư mới</Radio.Button>
            </Radio.Group>

            {/* // TODO: Phần này là giao diện nhập vật tư, bạn hãy code phần xử lý form tại đây */}

            {formType === 'existing' && (
                <div>
                    {/* // TODO: Form cập nhật số lượng của vật tư hiện có */}
                    <ImportExistingMaterial />
                </div>
            )}

            {formType === 'new' && (
                <div>
                    {/* // TODO: Form thêm mới vật tư */}
                    <ImportNewMaterial />
                </div>
            )}
        </div>
    );
};

export default MaterialEntryMenu;
