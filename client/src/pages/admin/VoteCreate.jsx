import { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

const { RangePicker } = DatePicker;

function VoteCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 20) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
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
      const res = await api.post('/votes', {
        ...values,
        options: filteredOptions,
        end_time: values.end_time?.endOf('day').toISOString()
      });
      if (res.code === 0) {
        message.success('创建成功');
        navigate('/admin/votes');
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>创建投票</h2>
      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="投票标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入投票标题（最多100字）" maxLength={100} />
          </Form.Item>

          <Form.Item name="description" label="投票说明">
            <Input.TextArea placeholder="选填，投票说明（最多500字）" maxLength={500} rows={3} />
          </Form.Item>

          <Form.Item name="type" label="投票类型" initialValue="single">
            <Select>
              <Select.Option value="single">单选</Select.Option>
              <Select.Option value="multiple">多选</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="投票选项">
            <Space direction="vertical" style={{ width: '100%' }}>
              {options.map((option, index) => (
                <Space key={index}>
                  <Input
                    placeholder={`选项${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={50}
                    style={{ width: 300 }}
                  />
                  {options.length > 2 && (
                    <Button icon={<DeleteOutlined />} onClick={() => removeOption(index)} danger />
                  )}
                </Space>
              ))}
              {options.length < 20 && (
                <Button icon={<PlusOutlined />} onClick={addOption}>添加选项</Button>
              )}
            </Space>
          </Form.Item>

          <Form.Item name="max_votes_per_user" label="每人投票次数" initialValue={1}>
            <Select>
              {[1, 2, 3, 5, 0].map(n => (
                <Select.Option key={n} value={n}>
                  {n === 0 ? '无限' : `${n}次`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="end_time" label="截止时间">
            <DatePicker showTime placeholder="不设置则不限制" />
          </Form.Item>

          <Form.Item name="share_title" label="分享标题">
            <Input placeholder="自定义分享标题（默认使用投票标题）" />
          </Form.Item>

          <Form.Item name="share_desc" label="分享描述">
            <Input placeholder="自定义分享描述" maxLength={200} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>创建</Button>
              <Button onClick={() => navigate('/admin/votes')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VoteCreate;