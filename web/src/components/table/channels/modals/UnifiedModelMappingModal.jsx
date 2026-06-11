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
  Checkbox,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  TabPane,
  Table,
  Tabs,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { IconSearch } from '@douyinfe/semi-icons';
import { API, showError, showSuccess } from '../../../../helpers';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const { Text, Title } = Typography;

const makeChannelRowKey = (row) => String(row.channel_id);
const makeMappingRowKey = (row) => `${row.channel_id}:${row.unified_model}`;

const sourceTagMap = {
  upstream: { color: 'blue', text: '上游模型' },
  channel: { color: 'green', text: '渠道模型' },
  mapping: { color: 'orange', text: '已有映射' },
};

const ModelCode = ({ children, className = '' }) => (
  <Text
    code
    className={`inline-block max-w-full whitespace-nowrap overflow-hidden text-ellipsis align-middle ${className}`}
    title={String(children || '')}
  >
    {children}
  </Text>
);

const UnifiedModelMappingModal = ({ visible, onCancel, onApplied }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [unifiedModel, setUnifiedModel] = useState('');
  const [activeTab, setActiveTab] = useState('select');
  const [keyword, setKeyword] = useState('');
  const [includeUpstream, setIncludeUpstream] = useState(true);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [items, setItems] = useState([]);
  const [summaryItems, setSummaryItems] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannelKeys, setSelectedChannelKeys] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState({});
  const [summaryKeyword, setSummaryKeyword] = useState('');
  const [editTargets, setEditTargets] = useState({});
  const [rowSaving, setRowSaving] = useState({});
  const [rowDeleting, setRowDeleting] = useState({});
  const [draftMapping, setDraftMapping] = useState({
    unified_model: '',
    channel_id: undefined,
    upstream_model: '',
  });

  const normalizedUnifiedModel = unifiedModel.trim();
  const normalizedKeyword = keyword.trim() || normalizedUnifiedModel;
  const canSearch = Boolean(normalizedUnifiedModel && normalizedKeyword);

  useEffect(() => {
    if (!visible) {
      setUnifiedModel('');
      setActiveTab('select');
      setKeyword('');
      setIncludeUpstream(true);
      setItems([]);
      setSummaryItems([]);
      setChannels([]);
      setSelectedChannelKeys([]);
      setSelectedTargets({});
      setSummaryKeyword('');
      setEditTargets({});
      setRowSaving({});
      setRowDeleting({});
      setDraftMapping({
        unified_model: '',
        channel_id: undefined,
        upstream_model: '',
      });
      setLoading(false);
      setSummaryLoading(false);
      setChannelsLoading(false);
      setApplying(false);
    }
  }, [visible]);

  const channelRows = useMemo(() => {
    const rowsByChannel = new Map();
    const sourceOrder = {
      mapping: 0,
      upstream: 1,
      channel: 2,
    };
    items.forEach((item) => {
      const channelId = item.channel_id;
      if (!rowsByChannel.has(channelId)) {
        rowsByChannel.set(channelId, {
          channel_id: channelId,
          channel_name: item.channel_name,
          channel_type: item.channel_type,
          channel_status: item.channel_status,
          has_unified_model: item.has_unified_model,
          mapped_to: item.mapped_to,
          fetch_error: item.fetch_error,
          candidates: [],
        });
      }
      const row = rowsByChannel.get(channelId);
      row.has_unified_model = row.has_unified_model || item.has_unified_model;
      row.mapped_to = row.mapped_to || item.mapped_to;
      row.fetch_error = row.fetch_error || item.fetch_error;
      if (
        item.upstream_model &&
        !row.candidates.some(
          (candidate) => candidate.upstream_model === item.upstream_model,
        )
      ) {
        row.candidates.push(item);
      }
    });

    const rows = Array.from(rowsByChannel.values()).map((row) => {
      row.candidates.sort((a, b) => {
        const aSelf = a.upstream_model === normalizedUnifiedModel ? 1 : 0;
        const bSelf = b.upstream_model === normalizedUnifiedModel ? 1 : 0;
        if (aSelf !== bSelf) {
          return aSelf - bSelf;
        }
        const aMissingPrice = a.price_configured ? 0 : 1;
        const bMissingPrice = b.price_configured ? 0 : 1;
        if (aMissingPrice !== bMissingPrice) {
          return aMissingPrice - bMissingPrice;
        }
        const aOrder = sourceOrder[a.source] ?? 9;
        const bOrder = sourceOrder[b.source] ?? 9;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.upstream_model.localeCompare(b.upstream_model);
      });

      const existingTarget =
        row.mapped_to && row.mapped_to !== normalizedUnifiedModel
          ? row.mapped_to
          : '';
      const existingCandidate = existingTarget
        ? row.candidates.find(
            (candidate) => candidate.upstream_model === existingTarget,
          )
        : null;
      const recommended =
        (existingCandidate?.price_configured ? existingCandidate : null) ||
        row.candidates.find(
          (candidate) =>
            candidate.price_configured &&
            candidate.upstream_model !== normalizedUnifiedModel &&
            candidate.source === 'upstream',
        ) ||
        row.candidates.find(
          (candidate) =>
            candidate.price_configured &&
            candidate.upstream_model !== normalizedUnifiedModel &&
            candidate.source === 'mapping',
        ) ||
        row.candidates.find(
          (candidate) =>
            candidate.price_configured &&
            candidate.upstream_model !== normalizedUnifiedModel,
        ) ||
        row.candidates[0];

      return {
        ...row,
        recommended_target: recommended?.upstream_model || '',
        is_self_mapping_only:
          row.candidates.length > 0 &&
          row.candidates.every(
            (candidate) => candidate.upstream_model === normalizedUnifiedModel,
          ),
      };
    });

    rows.sort((a, b) => a.channel_id - b.channel_id);
    return rows;
  }, [items, normalizedUnifiedModel]);

  useEffect(() => {
    const nextTargets = {};
    const nextKeys = [];
    channelRows.forEach((row) => {
      if (row.recommended_target) {
        nextTargets[row.channel_id] = row.recommended_target;
        const recommendedCandidate = row.candidates.find(
          (candidate) => candidate.upstream_model === row.recommended_target,
        );
        if (
          row.recommended_target !== normalizedUnifiedModel &&
          recommendedCandidate?.price_configured
        ) {
          nextKeys.push(makeChannelRowKey(row));
        }
      }
    });
    setSelectedTargets(nextTargets);
    setSelectedChannelKeys(nextKeys);
  }, [channelRows, normalizedUnifiedModel]);

  const selectedItems = useMemo(() => {
    const selectedSet = new Set(selectedChannelKeys);
    return channelRows
      .filter((row) => selectedSet.has(makeChannelRowKey(row)))
      .map((row) => ({
        channel_id: row.channel_id,
        upstream_model:
          selectedTargets[row.channel_id] || row.recommended_target,
        price_configured: row.candidates.some(
          (candidate) =>
            candidate.upstream_model ===
              (selectedTargets[row.channel_id] || row.recommended_target) &&
            candidate.price_configured,
        ),
      }))
      .filter(
        (item) =>
          item.upstream_model && item.upstream_model !== normalizedUnifiedModel,
      )
      .filter((item) => item.price_configured);
  }, [
    channelRows,
    normalizedUnifiedModel,
    selectedChannelKeys,
    selectedTargets,
  ]);
  const canApply = Boolean(normalizedUnifiedModel && selectedItems.length > 0);

  const filteredSummaryItems = useMemo(() => {
    const text = summaryKeyword.trim().toLowerCase();
    if (!text) {
      return summaryItems;
    }
    return summaryItems.filter((item) =>
      [
        item.channel_name,
        item.channel_id,
        item.unified_model,
        item.upstream_model,
        item.has_unified_model ? '已加入渠道模型' : '未加入渠道模型',
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(text),
      ),
    );
  }, [summaryItems, summaryKeyword]);

  const configuredCount = useMemo(
    () =>
      normalizedUnifiedModel
        ? summaryItems.filter(
            (item) => item.unified_model === normalizedUnifiedModel,
          ).length
        : summaryItems.length,
    [normalizedUnifiedModel, summaryItems],
  );

  const loadMappingSummary = async (modelName = normalizedUnifiedModel) => {
    setSummaryLoading(true);
    try {
      const res = await API.get('/api/channel/model_mapping/list', {
        params: {
          model: modelName,
          status: 'all',
        },
        disableDuplicate: true,
      });
      if (res.data.success) {
        setSummaryItems(res.data.data || []);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const timer = setTimeout(() => {
      loadMappingSummary(normalizedUnifiedModel);
    }, 400);
    return () => clearTimeout(timer);
  }, [visible, normalizedUnifiedModel]);

  const loadChannels = async () => {
    setChannelsLoading(true);
    try {
      const res = await API.get(
        '/api/channel/?p=1&page_size=1000&id_sort=false&tag_mode=false&status=all',
        { disableDuplicate: true },
      );
      if (res.data.success) {
        setChannels(res.data.data?.items || []);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setChannelsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadChannels();
    }
  }, [visible]);

  const searchMappings = async () => {
    if (!normalizedUnifiedModel) {
      showError(t('请输入统一模型名称'));
      return;
    }
    if (!normalizedKeyword) {
      showError(t('请输入搜索关键词'));
      return;
    }
    setLoading(true);
    setSelectedChannelKeys([]);
    setSelectedTargets({});
    try {
      const res = await API.get('/api/channel/model_mapping/search', {
        params: {
          unified_model: normalizedUnifiedModel,
          keyword: normalizedKeyword,
          include_upstream: includeUpstream,
          status: 'enabled',
        },
        disableDuplicate: true,
      });
      if (res.data.success) {
        setItems(res.data.data || []);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyMappings = async ({ overwrite = false } = {}) => {
    if (!normalizedUnifiedModel) {
      showError(t('请输入统一模型名称'));
      return;
    }
    if (selectedItems.length === 0) {
      showError(t('请选择至少一个上游模型'));
      return;
    }
    setApplying(true);
    try {
      const res = await API.post('/api/channel/model_mapping/apply', {
        unified_model: normalizedUnifiedModel,
        overwrite,
        items: selectedItems.map((item) => ({
          channel_id: item.channel_id,
          upstream_model: item.upstream_model,
        })),
      });
      if (res.data.success) {
        const results = res.data.data?.results || [];
        showSuccess(
          t('已应用 {{count}} 个渠道映射', { count: results.length }),
        );
        onApplied && onApplied();
        await Promise.all([searchMappings(), loadMappingSummary()]);
        return;
      }

      const conflicts = res.data.data?.conflicts || [];
      if (conflicts.length > 0 && !overwrite) {
        Modal.confirm({
          title: t('存在已有映射冲突'),
          content: (
            <div className='space-y-2'>
              <Text>
                {t(
                  '以下渠道已存在不同映射，确认后将覆盖为本次选择的上游模型。',
                )}
              </Text>
              <div className='max-h-60 overflow-auto'>
                {conflicts.map((conflict) => (
                  <div key={conflict.channel_id} className='mb-2'>
                    <Text strong>{conflict.channel_name}</Text>
                    <br />
                    <Text size='small' type='tertiary'>
                      {conflict.existing_target} {'->'} {conflict.next_target}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          ),
          onOk: () => applyMappings({ overwrite: true }),
        });
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setApplying(false);
    }
  };

  const saveMapping = async ({ channelId, unified, upstream, key }) => {
    const nextUnified = String(unified || '').trim();
    const nextUpstream = String(upstream || '').trim();
    if (!channelId || !nextUnified || !nextUpstream) {
      showError(t('渠道、统一模型名和上游模型不能为空'));
      return;
    }
    if (key) {
      setRowSaving((prev) => ({ ...prev, [key]: true }));
    } else {
      setApplying(true);
    }
    try {
      const res = await API.post('/api/channel/model_mapping/apply', {
        unified_model: nextUnified,
        overwrite: true,
        items: [
          {
            channel_id: Number(channelId),
            upstream_model: nextUpstream,
          },
        ],
      });
      if (res.data.success) {
        showSuccess(t('映射已保存'));
        setDraftMapping({
          unified_model: '',
          channel_id: undefined,
          upstream_model: '',
        });
        onApplied && onApplied();
        await loadMappingSummary(normalizedUnifiedModel);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      if (key) {
        setRowSaving((prev) => ({ ...prev, [key]: false }));
      } else {
        setApplying(false);
      }
    }
  };

  const deleteMapping = (record) => {
    const key = makeMappingRowKey(record);
    Modal.confirm({
      title: t('删除模型映射'),
      content: (
        <Space vertical align='start' spacing={4}>
          <Text>
            {record.channel_name} #{record.channel_id}
          </Text>
          <Text size='small' type='tertiary'>
            <Text code>{record.unified_model}</Text>
            <Text type='tertiary'> {'->'} </Text>
            <Text code>{record.upstream_model}</Text>
          </Text>
          <Text size='small' type='warning'>
            {t('删除时会同时从该渠道模型列表移除这个统一模型名。')}
          </Text>
        </Space>
      ),
      onOk: async () => {
        setRowDeleting((prev) => ({ ...prev, [key]: true }));
        try {
          const res = await API.delete('/api/channel/model_mapping', {
            data: {
              channel_id: record.channel_id,
              unified_model: record.unified_model,
              remove_model: true,
            },
          });
          if (res.data.success) {
            showSuccess(t('映射已删除'));
            onApplied && onApplied();
            await loadMappingSummary(normalizedUnifiedModel);
          } else {
            showError(res.data.message);
          }
        } catch (error) {
          showError(error);
        } finally {
          setRowDeleting((prev) => ({ ...prev, [key]: false }));
        }
      },
    });
  };

  const columns = [
    {
      title: t('渠道'),
      dataIndex: 'channel_name',
      width: 170,
      render: (text, record) => (
        <Space vertical align='start' spacing={2}>
          <Text strong>{text}</Text>
          <Text size='small' type='tertiary'>
            #{record.channel_id}
          </Text>
        </Space>
      ),
    },
    {
      title: t('选择真实上游模型'),
      dataIndex: 'selected_target',
      width: 420,
      render: (_, record) => {
        const currentTarget =
          selectedTargets[record.channel_id] || record.recommended_target;
        const currentCandidate = record.candidates.find(
          (candidate) => candidate.upstream_model === currentTarget,
        );
        const currentTag = currentCandidate
          ? sourceTagMap[currentCandidate.source] || {
              color: 'grey',
              text: currentCandidate.source,
            }
          : null;
        return (
          <Space vertical align='start' spacing={6} style={{ width: '100%' }}>
            <Select
              value={currentTarget}
              onChange={(value) => {
                setSelectedTargets((prev) => ({
                  ...prev,
                  [record.channel_id]: value,
                }));
                setSelectedChannelKeys((prev) => {
                  const next = new Set(prev);
                  if (value && value !== normalizedUnifiedModel) {
                    next.add(makeChannelRowKey(record));
                  } else {
                    next.delete(makeChannelRowKey(record));
                  }
                  return Array.from(next);
                });
              }}
              placeholder={t('选择该渠道真实模型')}
              filter
              style={{ width: '100%', maxWidth: 380 }}
              dropdownStyle={{ minWidth: 520 }}
              renderSelectedItem={(optionNode) => (
                <div
                  className='flex items-center gap-2 min-w-0'
                  title={String(optionNode?.value || '')}
                >
                  <span className='truncate font-mono text-sm'>
                    {optionNode?.value}
                  </span>
                </div>
              )}
            >
              {record.candidates.map((candidate) => {
                const tag = sourceTagMap[candidate.source] || {
                  color: 'grey',
                  text: candidate.source,
                };
                const isSelf =
                  candidate.upstream_model === normalizedUnifiedModel;
                const disabled = isSelf || !candidate.price_configured;
                return (
                  <Select.Option
                    key={candidate.upstream_model}
                    value={candidate.upstream_model}
                    disabled={disabled}
                  >
                    <div className='flex items-center gap-2 min-w-0 py-1'>
                      <span
                        className='font-mono text-sm truncate flex-1'
                        title={candidate.upstream_model}
                      >
                        {candidate.upstream_model}
                      </span>
                      <Tag color={tag.color} size='small'>
                        {t(tag.text)}
                      </Tag>
                      {isSelf ? (
                        <Tag color='orange' size='small'>
                          {t('同名')}
                        </Tag>
                      ) : null}
                      {candidate.price_configured ? (
                        <Tag color='green' size='small'>
                          {t('价格可用')}
                        </Tag>
                      ) : (
                        <Tag color='red' size='small'>
                          {t('未配置价格')}
                        </Tag>
                      )}
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
            <Space spacing={6} wrap className='leading-6'>
              {currentTag ? (
                <Tag color={currentTag.color} size='small'>
                  {t(currentTag.text)}
                </Tag>
              ) : null}
              <Tag size='small'>
                {t('候选')} {record.candidates.length}
              </Tag>
              {currentTarget === normalizedUnifiedModel ? (
                <Tag color='orange' size='small'>
                  {t('与统一模型同名，通常不作为真实上游模型')}
                </Tag>
              ) : null}
              {currentCandidate && !currentCandidate.price_configured ? (
                <Tag color='red' size='small'>
                  {t('该真实模型未配置价格，不能映射')}
                </Tag>
              ) : null}
            </Space>
          </Space>
        );
      },
    },
    {
      title: t('保存后写入'),
      dataIndex: 'mapping_preview',
      width: 340,
      render: (_, record) => (
        <Space vertical align='start' spacing={6} className='w-full'>
          <div className='grid grid-cols-[72px_minmax(0,1fr)] gap-2 w-full items-start'>
            <Text size='small' type='tertiary'>
              {t('渠道模型')}
            </Text>
            {normalizedUnifiedModel ? (
              <ModelCode>{normalizedUnifiedModel}</ModelCode>
            ) : (
              <Text type='tertiary'>{t('待填写')}</Text>
            )}
          </div>
          <div className='grid grid-cols-[72px_minmax(0,1fr)] gap-2 w-full items-start'>
            <Text size='small' type='tertiary'>
              {t('重定向')}
            </Text>
            {normalizedUnifiedModel ? (
              <div className='flex items-center gap-1 min-w-0'>
                <ModelCode className='max-w-[108px]'>
                  {normalizedUnifiedModel}
                </ModelCode>
                <Text type='tertiary' size='small'>
                  {'->'}
                </Text>
                <ModelCode className='max-w-[150px]'>
                  {selectedTargets[record.channel_id] ||
                    record.recommended_target ||
                    t('未选择')}
                </ModelCode>
              </div>
            ) : (
              <Text type='tertiary'>{t('待填写统一模型')}</Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: t('当前状态'),
      dataIndex: 'mapped_to',
      width: 210,
      render: (mappedTo, record) => (
        <Space vertical align='start' spacing={2}>
          {record.has_unified_model ? (
            <Tag color='green'>{t('已加入渠道模型')}</Tag>
          ) : (
            <Tag>{t('未加入渠道模型')}</Tag>
          )}
          {mappedTo ? (
            <div className='flex items-center gap-1 max-w-full'>
              <Text size='small' type='tertiary'>
                {t('当前映射')}：
              </Text>
              <ModelCode className='max-w-[120px]'>{mappedTo}</ModelCode>
            </div>
          ) : (
            <Text size='small' type='tertiary'>
              {t('暂无映射')}
            </Text>
          )}
        </Space>
      ),
    },
  ];

  const summaryColumns = [
    {
      title: t('统一模型'),
      dataIndex: 'unified_model',
      width: 190,
      render: (text, record) => (
        <Space vertical align='start' spacing={3}>
          <Text code>{text}</Text>
          {record.has_unified_model ? (
            <Tag color='green' size='small'>
              {t('已加入渠道模型')}
            </Tag>
          ) : (
            <Tag color='orange' size='small'>
              {t('仅有重定向')}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('渠道'),
      dataIndex: 'channel_name',
      width: 190,
      render: (text, record) => (
        <Space vertical align='start' spacing={2}>
          <Space spacing={6} wrap>
            <Text strong>{text}</Text>
            <Tag
              color={record.channel_status === 1 ? 'green' : 'grey'}
              size='small'
            >
              {record.channel_status === 1 ? t('启用') : t('停用')}
            </Tag>
          </Space>
          <Text size='small' type='tertiary'>
            #{record.channel_id}
          </Text>
        </Space>
      ),
    },
    {
      title: t('映射到上游模型'),
      dataIndex: 'upstream_model',
      render: (upstreamModel, record) => {
        const key = makeMappingRowKey(record);
        return (
          <Input
            size='small'
            value={editTargets[key] ?? upstreamModel}
            onChange={(value) =>
              setEditTargets((prev) => ({ ...prev, [key]: value }))
            }
            placeholder={t('上游模型名称')}
          />
        );
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operate',
      width: 170,
      render: (_, record) => {
        const key = makeMappingRowKey(record);
        const nextTarget = String(
          editTargets[key] ?? record.upstream_model,
        ).trim();
        return (
          <Space>
            <Button
              size='small'
              type='primary'
              loading={rowSaving[key]}
              disabled={!nextTarget || nextTarget === record.upstream_model}
              onClick={() =>
                saveMapping({
                  channelId: record.channel_id,
                  unified: record.unified_model,
                  upstream: nextTarget,
                  key,
                })
              }
            >
              {t('保存')}
            </Button>
            <Button
              size='small'
              type='danger'
              loading={rowDeleting[key]}
              onClick={() => deleteMapping(record)}
            >
              {t('删除')}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={t('统一模型映射')}
      visible={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('取消')}</Button>
          {activeTab === 'select' ? (
            <Button
              type='primary'
              loading={applying}
              disabled={!canApply}
              onClick={() => applyMappings()}
            >
              {selectedItems.length > 0
                ? t('应用 {{count}} 个映射', { count: selectedItems.length })
                : t('应用映射')}
            </Button>
          ) : null}
        </Space>
      }
      width={isMobile ? '100%' : 1180}
      bodyStyle={{ maxHeight: isMobile ? '70vh' : '72vh', overflow: 'auto' }}
    >
      <Space vertical align='start' style={{ width: '100%' }} spacing='medium'>
        <Banner
          type='info'
          closeIcon={null}
          description={t(
            '该工具仅批量写入渠道模型和模型重定向，不修改计费、调度、模型广场或价格配置。',
          )}
          style={{ width: '100%' }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type='line'
          style={{ width: '100%' }}
        >
          <TabPane tab={t('选择映射')} itemKey='select'>
            <Space
              vertical
              align='start'
              spacing='medium'
              style={{ width: '100%' }}
            >
              <div className='grid grid-cols-1 lg:grid-cols-5 gap-3 w-full'>
                <div className='rounded-lg border border-solid border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-4 lg:col-span-2'>
                  <Space
                    vertical
                    align='start'
                    spacing={10}
                    style={{ width: '100%' }}
                  >
                    <Title heading={6} style={{ margin: 0 }}>
                      {t('定义对外模型')}
                    </Title>
                    <Text size='small' type='tertiary'>
                      {t('这是客户实际调用的模型名称，由你手动定义。')}
                    </Text>
                    <Input
                      value={unifiedModel}
                      onChange={(value) => {
                        setUnifiedModel(value);
                        if (!keyword.trim()) {
                          setKeyword(value);
                        }
                      }}
                      placeholder={t('例如 GPT-5-pro')}
                      prefix={t('统一模型')}
                      size='large'
                    />
                    <div className='flex flex-wrap gap-2'>
                      <Tag color='blue'>
                        {t('已映射渠道')} {configuredCount}
                      </Tag>
                      <Tag color={selectedItems.length > 0 ? 'green' : 'grey'}>
                        {t('待写入渠道')} {selectedItems.length}
                      </Tag>
                    </div>
                  </Space>
                </div>

                <div className='rounded-lg border border-solid border-[var(--semi-color-border)] bg-[var(--semi-color-bg-0)] p-4 lg:col-span-3'>
                  <Space
                    vertical
                    align='start'
                    spacing={10}
                    style={{ width: '100%' }}
                  >
                    <Title heading={6} style={{ margin: 0 }}>
                      {t('搜索可映射的上游模型')}
                    </Title>
                    <Text size='small' type='tertiary'>
                      {t(
                        '搜索渠道中已有的真实模型，选中后会写入对应渠道的模型重定向。',
                      )}
                    </Text>
                    <div className='flex flex-col md:flex-row gap-2 w-full'>
                      <Input
                        value={keyword}
                        onChange={setKeyword}
                        placeholder={t('输入上游模型关键词，例如 gpt-5')}
                        prefix={t('搜索')}
                        size='large'
                        disabled={!normalizedUnifiedModel}
                        suffix={
                          <Button
                            size='small'
                            type='primary'
                            icon={<IconSearch />}
                            loading={loading}
                            disabled={!canSearch}
                            onClick={searchMappings}
                          >
                            {t('搜索')}
                          </Button>
                        }
                        onEnterPress={() => {
                          if (canSearch) {
                            searchMappings();
                          }
                        }}
                      />
                      <Checkbox
                        checked={includeUpstream}
                        onChange={(e) => setIncludeUpstream(e.target.checked)}
                        className='md:pt-3'
                      >
                        {t('实时获取上游模型列表')}
                      </Checkbox>
                    </div>
                    {!normalizedUnifiedModel ? (
                      <Text size='small' type='warning'>
                        {t('请先填写统一模型名称，再搜索上游候选。')}
                      </Text>
                    ) : null}
                  </Space>
                </div>
              </div>

              <div className='rounded-lg border border-solid border-[var(--semi-color-border)] bg-[var(--semi-color-bg-0)] w-full overflow-hidden'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 border-0 border-b border-solid border-[var(--semi-color-border)]'>
                  <Title heading={6} style={{ margin: 0 }}>
                    {t('选择渠道并确认写入内容')}
                  </Title>
                  <Space spacing={8} wrap>
                    <Tag color={selectedItems.length > 0 ? 'green' : 'grey'}>
                      {t('已选择')} {selectedItems.length} /{' '}
                      {channelRows.length}
                    </Tag>
                    {normalizedUnifiedModel ? (
                      <Tag color='blue'>
                        {t('对外模型')}：{normalizedUnifiedModel}
                      </Tag>
                    ) : null}
                  </Space>
                </div>

                {selectedItems.length > 0 && normalizedUnifiedModel ? (
                  <div className='px-4 py-3 bg-[var(--semi-color-fill-0)] border-0 border-b border-solid border-[var(--semi-color-border)]'>
                    <Text size='small'>
                      {t('将为选中渠道写入')}：
                      <Text code>{normalizedUnifiedModel}</Text>
                      <Text type='tertiary'> {'->'} </Text>
                      <Text type='tertiary'>
                        {t('各渠道选中的真实上游模型')}
                      </Text>
                    </Text>
                  </div>
                ) : null}

                <Table
                  dataSource={channelRows}
                  columns={columns}
                  rowKey={makeChannelRowKey}
                  loading={loading}
                  size='small'
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1140 }}
                  rowSelection={{
                    selectedRowKeys: selectedChannelKeys,
                    onChange: (keys) => setSelectedChannelKeys(keys),
                    getCheckboxProps: (record) => ({
                      disabled:
                        !normalizedUnifiedModel ||
                        !record.candidates.some(
                          (candidate) =>
                            candidate.price_configured &&
                            candidate.upstream_model !== normalizedUnifiedModel,
                        ),
                    }),
                  }}
                  empty={
                    <Empty
                      image={<IllustrationNoResult />}
                      darkModeImage={<IllustrationNoResultDark />}
                      title={t('暂无上游候选')}
                      description={
                        normalizedUnifiedModel
                          ? t('输入关键词后搜索可映射的渠道模型')
                          : t('先填写统一模型名称，再搜索上游模型')
                      }
                    />
                  }
                />
              </div>
            </Space>
          </TabPane>

          <TabPane tab={t('已有映射')} itemKey='manage'>
            <Space
              vertical
              align='start'
              spacing='medium'
              style={{ width: '100%' }}
            >
              <div className='rounded-lg border border-solid border-[var(--semi-color-border)] bg-[var(--semi-color-fill-0)] p-4 w-full'>
                <Space
                  vertical
                  align='start'
                  spacing={10}
                  style={{ width: '100%' }}
                >
                  <Title heading={6} style={{ margin: 0 }}>
                    {t('新增或更新映射')}
                  </Title>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-2 w-full'>
                    <Input
                      value={draftMapping.unified_model}
                      onChange={(value) =>
                        setDraftMapping((prev) => ({
                          ...prev,
                          unified_model: value,
                        }))
                      }
                      placeholder={t('统一模型名')}
                    />
                    <Select
                      value={draftMapping.channel_id}
                      onChange={(value) =>
                        setDraftMapping((prev) => ({
                          ...prev,
                          channel_id: value,
                        }))
                      }
                      placeholder={t('选择渠道')}
                      loading={channelsLoading}
                      filter
                      showClear
                    >
                      {channels.map((channel) => (
                        <Select.Option key={channel.id} value={channel.id}>
                          {channel.name} #{channel.id}
                        </Select.Option>
                      ))}
                    </Select>
                    <Input
                      value={draftMapping.upstream_model}
                      onChange={(value) =>
                        setDraftMapping((prev) => ({
                          ...prev,
                          upstream_model: value,
                        }))
                      }
                      placeholder={t('上游模型名')}
                    />
                    <Button
                      type='primary'
                      loading={applying}
                      onClick={() =>
                        saveMapping({
                          channelId: draftMapping.channel_id,
                          unified: draftMapping.unified_model,
                          upstream: draftMapping.upstream_model,
                        })
                      }
                    >
                      {t('保存映射')}
                    </Button>
                  </div>
                </Space>
              </div>

              <div className='rounded-lg border border-solid border-[var(--semi-color-border)] bg-[var(--semi-color-bg-0)] w-full overflow-hidden'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 border-0 border-b border-solid border-[var(--semi-color-border)]'>
                  <Title heading={6} style={{ margin: 0 }}>
                    {t('已有映射列表')}
                  </Title>
                  <Space wrap>
                    <Input
                      prefix={<IconSearch />}
                      value={summaryKeyword}
                      onChange={setSummaryKeyword}
                      placeholder={t('搜索统一模型、渠道或上游模型')}
                      showClear
                      size='small'
                      style={{ width: isMobile ? '100%' : 300 }}
                    />
                    <Button
                      size='small'
                      type='tertiary'
                      loading={summaryLoading}
                      onClick={() => loadMappingSummary()}
                    >
                      {t('刷新')}
                    </Button>
                  </Space>
                </div>
                <Table
                  dataSource={filteredSummaryItems}
                  columns={summaryColumns}
                  rowKey={makeMappingRowKey}
                  loading={summaryLoading}
                  size='small'
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 980 }}
                  empty={
                    <Empty
                      image={<IllustrationNoResult />}
                      darkModeImage={<IllustrationNoResultDark />}
                      title={t('暂无已映射渠道')}
                      description={t(
                        '可以在上方新增映射，或到选择映射页批量写入',
                      )}
                    />
                  }
                />
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Space>
    </Modal>
  );
};

export default UnifiedModelMappingModal;
