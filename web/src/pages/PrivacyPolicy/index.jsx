/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from '@douyinfe/semi-ui';
import { API } from '../../helpers';
import DocumentRenderer from '../../components/common/DocumentRenderer';
import LegalDocPage from '../Legal/LegalDocPage';
import { privacyDoc } from '../Legal/privacyDoc';

// 管理员在后台配置了隐私政策内容则优先展示，否则渲染设计稿默认文案
const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [hasAdminContent, setHasAdminContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    API.get('/api/privacy-policy')
      .then((res) => {
        const { success, data } = res.data || {};
        if (mounted) {
          setHasAdminContent(!!(success && data && data.trim() !== ''));
        }
      })
      .catch(() => {
        if (mounted) setHasAdminContent(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (hasAdminContent === null) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  if (hasAdminContent) {
    return (
      <DocumentRenderer
        apiEndpoint='/api/privacy-policy'
        title={t('隐私政策')}
        cacheKey='privacy_policy'
        emptyMessage={t('加载隐私政策内容失败...')}
      />
    );
  }

  return <LegalDocPage doc={privacyDoc} />;
};

export default PrivacyPolicy;
