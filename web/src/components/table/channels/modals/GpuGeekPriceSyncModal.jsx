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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Banner,
  Button,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { IconRefresh, IconSearch } from '@douyinfe/semi-icons';
import { API, showError, showSuccess } from '../../../../helpers';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const { Text } = Typography;

const sourceMeta = {
  gpugeek_doc: { color: 'green', label: 'GpuGeek 价格文档' },
  upstream: { color: 'green', label: '上游价格' },
  similar_local: { color: 'blue', label: '本地相似价格' },
  none: { color: 'grey', label: '未获取价格' },
};

const statusMeta = {
  new: { color: 'green', label: '可新增' },
  update_available: { color: 'orange', label: '可更新' },
  configured: { color: 'blue', label: '已配置' },
  missing: { color: 'grey', label: '缺少价格' },
};

const formatValue = (value) =>
  value === null || value === undefined ? '-' : Number(value).toFixed(6);

const rowKey = (record) => record.source_model;

const GpuGeekPriceSyncModal = ({
  visible,
  onCancel,
  channelId,
  channelName,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [items, setItems] = useState([]);
  const [fetchErrors, setFetchErrors] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [targetModels, setTargetModels] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [writeableFilter, setWriteableFilter] = useState('all');

  useEffect(() => {
    if (!visible) {
      setItems([]);
      setFetchErrors([]);
      setSelectedRowKeys([]);
      setTargetModels({});
      setSearchKeyword('');
      setSourceFilter('all');
      setStatusFilter('all');
      setWriteableFilter('all');
      setLoading(false);
      setApplying(false);
    }
  }, [visible]);

  const selectedItems = useMemo(() => {
    const selected = new Set(selectedRowKeys);
    return items.filter((item) => selected.has(rowKey(item)));
  }, [items, selectedRowKeys]);

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return items.filter((item) => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (writeableFilter === 'writeable' && !item.selectable) {
        return false;
      }
      if (writeableFilter === 'readonly' && item.selectable) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      const key = rowKey(item);
      const values = [
        item.source_model,
        targetModels[key],
        item.target_model,
        item.similar_model,
        item.source,
        item.status,
        item.note,
      ];
      return values.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [
    items,
    searchKeyword,
    sourceFilter,
    statusFilter,
    targetModels,
    writeableFilter,
  ]);

  const filterOptions = useMemo(
    () => ({
      source: [
        { label: t('全部来源'), value: 'all' },
        ...Object.entries(sourceMeta).map(([value, meta]) => ({
          label: t(meta.label),
          value,
        })),
      ],
      status: [
        { label: t('全部状态'), value: 'all' },
        ...Object.entries(statusMeta).map(([value, meta]) => ({
          label: t(meta.label),
          value,
        })),
      ],
      writeable: [
        { label: t('全部价格'), value: 'all' },
        { label: t('可写入'), value: 'writeable' },
        { label: t('仅查看'), value: 'readonly' },
      ],
    }),
    [t],
  );

  const hasActiveFilters =
    sourceFilter !== 'all' ||
    statusFilter !== 'all' ||
    writeableFilter !== 'all' ||
    searchKeyword.trim() !== '';

  const clearFilters = () => {
    setSearchKeyword('');
    setSourceFilter('all');
    setStatusFilter('all');
    setWriteableFilter('all');
  };

  const fetchPreview = async () => {
    if (!channelId) {
      showError(t('请先保存渠道'));
      return;
    }
    setLoading(true);
    setSelectedRowKeys([]);
    try {
      const res = await API.post(
        `/api/channel/${channelId}/gpugeek/prices/fetch`,
      );
      if (!res.data.success) {
        showError(res.data.message);
        return;
      }
      const nextItems = res.data.data?.items || [];
      setItems(nextItems);
      setFetchErrors(res.data.data?.fetch_errors || []);
      setTargetModels(
        nextItems.reduce((acc, item) => {
          acc[rowKey(item)] = item.target_model || item.source_model;
          return acc;
        }, {}),
      );
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyPrices = async () => {
    if (selectedItems.length === 0) {
      showError(t('请选择至少一个价格配置'));
      return;
    }
    const payloadItems = selectedItems.map((item) => ({
      target_model: String(targetModels[rowKey(item)] || '').trim(),
      model_ratio: item.model_ratio,
      completion_ratio: item.completion_ratio,
      cache_ratio: item.cache_ratio,
    }));
    if (payloadItems.some((item) => !item.target_model)) {
      showError(t('写入模型名不能为空'));
      return;
    }
    setApplying(true);
    try {
      const res = await API.post(
        `/api/channel/${channelId}/gpugeek/prices/apply`,
        {
          items: payloadItems,
        },
      );
      if (res.data.success) {
        showSuccess(
          t('已写入 {{count}} 个模型价格', { count: payloadItems.length }),
        );
        await fetchPreview();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setApplying(false);
    }
  };

  const columns = [
    {
      title: t('上游模型'),
      dataIndex: 'source_model',
      width: 220,
      render: (text, record) => {
        const meta = sourceMeta[record.source] || sourceMeta.none;
        return (
          <Space vertical align='start' spacing={4}>
            <Text code>{text}</Text>
            <Space spacing={4} wrap>
              <Tag color={meta.color} size='small'>
                {t(meta.label)}
              </Tag>
              {record.similar_model ? (
                <Tag color='blue' size='small'>
                  {t('参考')}：{record.similar_model}
                </Tag>
              ) : null}
            </Space>
          </Space>
        );
      },
    },
    {
      title: t('写入模型名'),
      dataIndex: 'target_model',
      width: 220,
      render: (_, record) => (
        <Input
          size='small'
          value={targetModels[rowKey(record)] || ''}
          disabled={!record.selectable}
          onChange={(value) =>
            setTargetModels((prev) => ({ ...prev, [rowKey(record)]: value }))
          }
          placeholder={t('例如 GPT-5.5')}
        />
      ),
    },
    {
      title: t('建议价格'),
      dataIndex: 'model_ratio',
      render: (_, record) => (
        <Space vertical align='start' spacing={2}>
          <Text size='small'>
            {t('模型倍率')}：{formatValue(record.model_ratio)}
          </Text>
          <Text size='small'>
            {t('补全倍率')}：{formatValue(record.completion_ratio)}
          </Text>
          <Text size='small'>
            {t('缓存倍率')}：{formatValue(record.cache_ratio)}
          </Text>
        </Space>
      ),
    },
    {
      title: t('本地现状'),
      dataIndex: 'local_model_ratio',
      render: (_, record) => {
        const meta = statusMeta[record.status] || statusMeta.missing;
        return (
          <Space vertical align='start' spacing={2}>
            <Tag color={meta.color}>{t(meta.label)}</Tag>
            <Text size='small' type='tertiary'>
              {t('模型倍率')}：{formatValue(record.local_model_ratio)}
            </Text>
            <Text size='small' type='tertiary'>
              {t('补全倍率')}：{formatValue(record.local_completion_ratio)}
            </Text>
            {record.note ? (
              <Text size='small' type='tertiary'>
                {record.note}
              </Text>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={t('同步 GpuGeek 价格')}
      visible={visible}
      onCancel={onCancel}
      width={isMobile ? '100%' : 1040}
      bodyStyle={{ maxHeight: isMobile ? '70vh' : '72vh', overflow: 'auto' }}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('关闭')}</Button>
          <Button
            type='tertiary'
            icon={<IconRefresh />}
            loading={loading}
            onClick={fetchPreview}
          >
            {t('获取价格预览')}
          </Button>
          <Button
            type='primary'
            loading={applying}
            disabled={selectedItems.length === 0}
            onClick={applyPrices}
          >
            {t('写入选中价格')}
          </Button>
        </Space>
      }
    >
      <Space vertical align='start' spacing='medium' style={{ width: '100%' }}>
        <Banner
          type='info'
          closeIcon={null}
          description={t(
            '该操作只在你确认后写入系统价格配置，不修改渠道模型、模型映射、调度或模型广场。优先使用 GpuGeek 官方价格文档，文档未覆盖时可复制本地相似模型价格。',
          )}
          style={{ width: '100%' }}
        />
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 w-full'>
          <Text type='tertiary'>
            {t('渠道')}：{channelName || `#${channelId}`}
          </Text>
          <Space wrap align='center'>
            <Input
              prefix={<IconSearch />}
              value={searchKeyword}
              onChange={setSearchKeyword}
              placeholder={t('搜索模型、写入名或状态')}
              showClear
              style={{ width: isMobile ? '100%' : 320 }}
            />
            <Text type='tertiary'>
              {t('已选择')} {selectedItems.length} / {items.length}
              {searchKeyword.trim()
                ? `，${t('当前显示')} ${filteredItems.length}`
                : ''}
            </Text>
          </Space>
        </div>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 w-full'>
          <Space wrap>
            <Select
              value={sourceFilter}
              optionList={filterOptions.source}
              onChange={setSourceFilter}
              style={{ width: isMobile ? '100%' : 180 }}
            />
            <Select
              value={statusFilter}
              optionList={filterOptions.status}
              onChange={setStatusFilter}
              style={{ width: isMobile ? '100%' : 160 }}
            />
            <Select
              value={writeableFilter}
              optionList={filterOptions.writeable}
              onChange={setWriteableFilter}
              style={{ width: isMobile ? '100%' : 140 }}
            />
            <Button
              type='tertiary'
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              {t('重置筛选')}
            </Button>
          </Space>
          <Text type='tertiary'>
            {t('当前显示')} {filteredItems.length} / {items.length}
          </Text>
        </div>
        {fetchErrors.length > 0 ? (
          <Banner
            type='warning'
            closeIcon={null}
            description={
              <Space vertical align='start' spacing={2}>
                <Text>
                  {t('GpuGeek 价格文档暂不可用，已继续生成本地相似价格候选。')}
                </Text>
                <div className='max-h-24 overflow-auto'>
                  {fetchErrors.map((error) => (
                    <Text
                      key={error}
                      size='small'
                      type='tertiary'
                      className='block'
                    >
                      {error}
                    </Text>
                  ))}
                </div>
              </Space>
            }
            style={{ width: '100%' }}
          />
        ) : null}
        <Table
          dataSource={filteredItems}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          size='small'
          pagination={{ pageSize: 8 }}
          scroll={{ x: 920 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: !record.selectable,
            }),
          }}
          empty={
            <Empty
              image={<IllustrationNoResult />}
              darkModeImage={<IllustrationNoResultDark />}
              title={t('暂无价格预览')}
              description={t('点击获取价格预览后选择要写入系统的模型价格')}
            />
          }
        />
      </Space>
    </Modal>
  );
};

export default GpuGeekPriceSyncModal;
