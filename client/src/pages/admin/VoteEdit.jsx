import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

function VoteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [vote, setVote] = useState(null);
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    loadVote();
  }, [id]);

  const loadVote = async () => {
    setInitLoading(true);
    try {
      const res = await api.get(`/votes/${id}`);
      if (res?.code === 0) {
        setVote(res.data);
        const opts = JSON.parse(res.data.options || '[]');
        setOptions(opts.length > 0 ? opts : ['', '']);
        form.setFieldsValue({
          title: res.data.title,
          description: res.data.description,
          type: res.data.type,
          max_votes_per_user: res.data.max_votes_per_user,
          end_time: res.data.end_time ? moment(res.data.end_time) : null,
          share_title: res.data.share_title,
          share_desc: res.data.share_desc
        });
      } else {
        message.error(res?.message || '加载失败');
      }
    } catch (err) {
      message.error('加载失败');
    } finally {
      setInitLoading(false);
    }
  };

  const addOption = () => {
    if (options.length < 20) setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onFinish = async (values) => {
    const filteredOptions = options.filter(o => o.trim());
    if (filteredOptions.length < 2) {
      return message.error('至少需要2个选项');
    }

    setLoading(true);
    try {
      const res = await api.put(`/votes/${id}`, {
        ...values,
        options: filteredOptions,
        end_time: values.end_time?.endOf('day').toISOString()
      });
      if (res?.code === 0) {
        message.success('更新成功');
        navigate('/admin/votes');
      } else {
        message.error(res?.message || '更新失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/votes')}>返回</Button>
        <h2>编辑投票</h2>
      </Space>
      <Card loading={initLoading}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="投票标题" rules={[{ required: true }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="投票说明">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item name="type" label="投票类型">
            <Select>
              <Select.Option value="single">单选</Select.Option>
              <Select.Option value="multiple">多选</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="投票选项">
            <Space direction="vertical">
              {options.map((option, index) => (
                <Space key={index}>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={50}
                    style={{ width: 300 }}
                  />
                  {options.length > 2 && (
                    <Button danger onClick={() => removeOption(index)}>删除</Button>
                  )}
                </Space>
              ))}
              {options.length < 20 && <Button onClick={addOption}>添加选项</Button>}
            </Space>
          </Form.Item>
          <Form.Item name="max_votes_per_user" label="每人投票次数">
            <Select>
              {[1, 2, 3, 5, 0].map(n => (
                <Select.Option key={n} value={n}>{n === 0 ? '无限' : `${n}次`}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="end_time" label="截止时间">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
              <Button onClick={() => navigate('/admin/votes')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VoteEdit;