import React, { useState } from 'react';
import { Radio } from 'antd';
import ImportExistingMaterial from './components/import.existing.material';
import { useNavigate } from 'react-router-dom';
// import ImportNewMaterial from './components/create.new.material';

const MaterialEntryMenu: React.FC = () => {
    const [formType, setFormType] = useState<'existing' | 'new'>('existing');
    const navigate = useNavigate();

    return (
        <div style={{ margin: '0 auto', padding: 20, background: '#fff', borderRadius: 8 }}>
            <Radio.Group value={formType} onChange={(e) => setFormType(e.target.value)} style={{ marginBottom: 20 }}>
                <Radio.Button value="existing">Cập nhật vật tư hiện có</Radio.Button>
                <Radio.Button value="new" onClick={() => navigate('/admin/supplies')}>
                    Thêm vật tư mới
                </Radio.Button>
            </Radio.Group>
            {formType === 'existing' && (
                <div>
                    <ImportExistingMaterial />
                </div>
            )}

            {/* {formType === 'new' && (
                <div>
                    <ImportNewMaterial />
                </div>
            )} */}
        </div>
    );
};

export default MaterialEntryMenu;
