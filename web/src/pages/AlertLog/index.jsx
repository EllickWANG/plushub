import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Modal,
  Space,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import {
  API,
  copy,
  getTodayStartTimestamp,
  showError,
  showSuccess,
  timestamp2string,
} from '../../helpers';
import { ITEMS_PER_PAGE } from '../../constants';
import { DATE_RANGE_PRESETS } from '../../constants/console.constants';
import CardTable from '../../components/common/ui/CardTable';

const { Text } = Typography;

function parseJSONText(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function renderLevel(level, t) {
  if (level === 'warning') {
    return (
      <Tag color='orange' shape='circle'>
        {t('警告')}
      </Tag>
    );
  }
  return (
    <Tag color='red' shape='circle'>
      {t('错误')}
    </Tag>
  );
}

function renderResolved(resolved, t) {
  return resolved ? (
    <Tag color='green' shape='circle'>
      {t('已处理')}
    </Tag>
  ) : (
    <Tag color='red' shape='circle'>
      {t('未处理')}
    </Tag>
  );
}

const AlertLog = () => {
  const { t } = useTranslation();
  const [formApi, setFormApi] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    error: 0,
    warning: 0,
    unresolved: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [detailRecord, setDetailRecord] = useState(null);

  const now = new Date();
  const formInitValues = {
    dateRange: [
      timestamp2string(getTodayStartTimestamp()),
      timestamp2string(now.getTime() / 1000 + 3600),
    ],
    level: '',
    resolved: '',
    source: '',
    category: '',
    model_name: '',
    channel_id: '',
    status_code: '',
    error_code: '',
    request_id: '',
    username: '',
    token_name: '',
  };

  const getFilters = () => {
    const values = formApi ? formApi.getValues() : formInitValues;
    const [start, end] = values.dateRange || [];
    return {
      ...values,
      start_timestamp: start ? Math.floor(Date.parse(start) / 1000) : '',
      end_timestamp: end ? Math.floor(Date.parse(end) / 1000) : '',
    };
  };

  const buildQuery = (page, size, includePaging = true) => {
    const filters = getFilters();
    const params = new URLSearchParams();
    if (includePaging) {
      params.set('p', String(page));
      params.set('page_size', String(size));
    }
    [
      'level',
      'resolved',
      'source',
      'category',
      'model_name',
      'channel_id',
      'status_code',
      'error_code',
      'request_id',
      'username',
      'token_name',
      'start_timestamp',
      'end_timestamp',
    ].forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && String(value) !== '') {
        params.set(key, String(value));
      }
    });
    return params.toString();
  };

  const loadStats = async () => {
    const res = await API.get(
      `/api/alert_log/stat?${buildQuery(1, pageSize, false)}`,
    );
    const { success, message, data } = res.data;
    if (!success) {
      showError(message);
      return;
    }
    setStats(data || {});
  };

  const loadLogs = async (page = activePage, size = pageSize) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/alert_log/?${buildQuery(page, size)}`);
      const { success, message, data } = res.data;
      if (!success) {
        showError(message);
        return;
      }
      setLogs((data.items || []).map((item) => ({ ...item, key: item.id })));
      setActivePage(data.page || page);
      setPageSize(data.page_size || size);
      setTotal(data.total || 0);
      await loadStats();
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setActivePage(1);
    loadLogs(1, pageSize);
  };

  const toggleResolved = async (record) => {
    const nextResolved = !record.resolved;
    const res = await API.patch(`/api/alert_log/${record.id}/resolve`, {
      resolved: nextResolved,
    });
    const { success, message } = res.data;
    if (!success) {
      showError(message);
      return;
    }
    showSuccess(nextResolved ? t('已标记为已处理') : t('已标记为未处理'));
    loadLogs(activePage, pageSize);
  };

  const copyValue = async (value) => {
    if (!value) return;
    await copy(String(value));
    showSuccess(t('已复制'));
  };

  const columns = useMemo(
    () => [
      {
        title: t('时间'),
        dataIndex: 'created_at',
        key: 'created_at',
        width: 170,
        render: (value) => timestamp2string(value),
      },
      {
        title: t('级别'),
        dataIndex: 'level',
        key: 'level',
        width: 90,
        render: (value) => renderLevel(value, t),
      },
      {
        title: t('状态'),
        dataIndex: 'resolved',
        key: 'resolved',
        width: 100,
        render: (value) => renderResolved(value, t),
      },
      {
        title: t('模型'),
        dataIndex: 'model_name',
        key: 'model_name',
        width: 180,
        render: (value) => (
          <Text ellipsis={{ showTooltip: true }} style={{ maxWidth: 180 }}>
            {value || '-'}
          </Text>
        ),
      },
      {
        title: t('渠道'),
        dataIndex: 'channel_id',
        key: 'channel_id',
        width: 130,
        render: (value, record) =>
          value ? (
            <Text ellipsis={{ showTooltip: true }} style={{ maxWidth: 130 }}>
              #{value} {record.channel_name || ''}
            </Text>
          ) : (
            '-'
          ),
      },
      {
        title: t('状态码'),
        dataIndex: 'status_code',
        key: 'status_code',
        width: 90,
        render: (value) =>
          value ? (
            <Tag color={value >= 500 ? 'red' : 'orange'} shape='circle'>
              {value}
            </Tag>
          ) : (
            '-'
          ),
      },
      {
        title: t('错误码'),
        dataIndex: 'error_code',
        key: 'error_code',
        width: 190,
        render: (value) => (
          <Text ellipsis={{ showTooltip: true }} style={{ maxWidth: 190 }}>
            {value || '-'}
          </Text>
        ),
      },
      {
        title: t('Request ID'),
        dataIndex: 'request_id',
        key: 'request_id',
        width: 180,
        render: (value) => (
          <Text
            link={Boolean(value)}
            onClick={() => copyValue(value)}
            ellipsis={{ showTooltip: true }}
            style={{ maxWidth: 180 }}
          >
            {value || '-'}
          </Text>
        ),
      },
      {
        title: t('内容'),
        dataIndex: 'message',
        key: 'message',
        render: (value) => (
          <Text ellipsis={{ showTooltip: true }} style={{ maxWidth: 360 }}>
            {value || '-'}
          </Text>
        ),
      },
      {
        title: t('操作'),
        key: 'actions',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              size='small'
              type='tertiary'
              onClick={() => setDetailRecord(record)}
            >
              {t('详情')}
            </Button>
            <Button size='small' onClick={() => toggleResolved(record)}>
              {record.resolved ? t('撤销') : t('处理')}
            </Button>
          </Space>
        ),
      },
    ],
    [t, activePage, pageSize],
  );

  const detailData = useMemo(() => {
    if (!detailRecord) return [];
    const metadata = parseJSONText(detailRecord.metadata);
    return [
      { key: t('时间'), value: timestamp2string(detailRecord.created_at) },
      { key: t('级别'), value: detailRecord.level },
      { key: t('来源'), value: detailRecord.source || '-' },
      { key: t('分类'), value: detailRecord.category || '-' },
      { key: t('标题'), value: detailRecord.title || '-' },
      { key: t('用户'), value: detailRecord.username || '-' },
      { key: t('令牌'), value: detailRecord.token_name || '-' },
      { key: t('模型'), value: detailRecord.model_name || '-' },
      {
        key: t('渠道'),
        value: detailRecord.channel_id
          ? `#${detailRecord.channel_id} ${detailRecord.channel_name || ''}`
          : '-',
      },
      { key: t('状态码'), value: detailRecord.status_code || '-' },
      { key: t('错误类型'), value: detailRecord.error_type || '-' },
      { key: t('错误码'), value: detailRecord.error_code || '-' },
      {
        key: t('请求'),
        value: `${detailRecord.method || '-'} ${detailRecord.path || ''}`,
      },
      { key: t('Request ID'), value: detailRecord.request_id || '-' },
      { key: t('消息'), value: detailRecord.message || '-' },
      { key: t('详情'), value: detailRecord.detail || '-' },
      {
        key: t('元数据'),
        value: metadata ? (
          <pre className='whitespace-pre-wrap break-all text-xs m-0'>
            {JSON.stringify(metadata, null, 2)}
          </pre>
        ) : (
          detailRecord.metadata || '-'
        ),
      },
    ];
  }, [detailRecord, t]);

  useEffect(() => {
    loadLogs(1, pageSize);
  }, [formApi]);

  return (
    <div className='mt-[60px] px-2'>
      <Card>
        <div className='flex flex-col gap-3'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            <div>
              <Text type='secondary'>{t('总数')}</Text>
              <div className='text-lg font-semibold'>{stats.total || 0}</div>
            </div>
            <div>
              <Text type='secondary'>{t('错误')}</Text>
              <div className='text-lg font-semibold text-red-500'>
                {stats.error || 0}
              </div>
            </div>
            <div>
              <Text type='secondary'>{t('警告')}</Text>
              <div className='text-lg font-semibold text-orange-500'>
                {stats.warning || 0}
              </div>
            </div>
            <div>
              <Text type='secondary'>{t('未处理')}</Text>
              <div className='text-lg font-semibold'>
                {stats.unresolved || 0}
              </div>
            </div>
          </div>

          <Form
            initValues={formInitValues}
            getFormApi={(api) => setFormApi(api)}
            onSubmit={refresh}
            allowEmpty
            autoComplete='off'
            layout='vertical'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
              <div className='col-span-1 lg:col-span-2'>
                <Form.DatePicker
                  field='dateRange'
                  className='w-full'
                  type='dateTimeRange'
                  placeholder={[t('开始时间'), t('结束时间')]}
                  showClear
                  pure
                  size='small'
                  presets={DATE_RANGE_PRESETS.map((preset) => ({
                    text: t(preset.text),
                    start: preset.start(),
                    end: preset.end(),
                  }))}
                />
              </div>
              <Form.Select
                field='level'
                placeholder={t('级别')}
                showClear
                pure
                size='small'
              >
                <Form.Select.Option value='error'>
                  {t('错误')}
                </Form.Select.Option>
                <Form.Select.Option value='warning'>
                  {t('警告')}
                </Form.Select.Option>
              </Form.Select>
              <Form.Select
                field='resolved'
                placeholder={t('处理状态')}
                showClear
                pure
                size='small'
              >
                <Form.Select.Option value='false'>
                  {t('未处理')}
                </Form.Select.Option>
                <Form.Select.Option value='true'>
                  {t('已处理')}
                </Form.Select.Option>
              </Form.Select>
              <Form.Input
                field='model_name'
                prefix={<IconSearch />}
                placeholder={t('模型名称')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='channel_id'
                prefix={<IconSearch />}
                placeholder={t('渠道 ID')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='status_code'
                prefix={<IconSearch />}
                placeholder={t('状态码')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='error_code'
                prefix={<IconSearch />}
                placeholder={t('错误码')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='request_id'
                prefix={<IconSearch />}
                placeholder={t('Request ID')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='username'
                prefix={<IconSearch />}
                placeholder={t('用户名称')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='token_name'
                prefix={<IconSearch />}
                placeholder={t('令牌名称')}
                showClear
                pure
                size='small'
              />
              <Form.Input
                field='source'
                prefix={<IconSearch />}
                placeholder={t('来源')}
                showClear
                pure
                size='small'
              />
            </div>
            <div className='flex justify-end mt-2'>
              <Button
                htmlType='submit'
                type='primary'
                loading={loading}
                size='small'
              >
                {t('查询')}
              </Button>
            </div>
          </Form>

          <CardTable
            columns={columns}
            dataSource={logs}
            rowKey='id'
            loading={loading}
            size='small'
            scroll={{ x: 'max-content' }}
            empty={<Empty description={t('暂无告警日志')} />}
            pagination={{
              currentPage: activePage,
              pageSize,
              total,
              pageSizeOptions: [10, 20, 50, 100],
              showSizeChanger: true,
              onPageChange: (page) => loadLogs(page, pageSize),
              onPageSizeChange: (size) => {
                setPageSize(size);
                loadLogs(1, size);
              },
            }}
          />
        </div>
      </Card>

      <Modal
        title={t('告警详情')}
        visible={Boolean(detailRecord)}
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={820}
      >
        <Descriptions data={detailData} />
      </Modal>
    </div>
  );
};

export default AlertLog;
