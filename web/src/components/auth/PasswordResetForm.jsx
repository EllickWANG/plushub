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
import { API, showError, showInfo, showSuccess } from '../../helpers';
import Turnstile from 'react-turnstile';
import { Button, Form, Typography } from '@douyinfe/semi-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const PasswordResetForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
  });
  const { email } = inputs;

  const [loading, setLoading] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  function handleChange(value) {
    setInputs((inputs) => ({ ...inputs, email: value }));
  }

  async function handleSubmit(e) {
    if (!email) {
      showError(t('请输入邮箱地址'));
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo(t('请稍后几秒重试，Turnstile 正在检查用户环境！'));
      return;
    }
    setDisableButton(true);
    setLoading(true);
    const res = await API.get(
      `/api/reset_password?email=${email}&turnstile=${turnstileToken}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('重置邮件发送成功，请检查邮箱！'));
      setInputs({ ...inputs, email: '' });
    } else {
      showError(message);
    }
    setLoading(false);
  }

  return (
    <div className='ph-auth-bg min-h-screen flex items-start justify-center px-4 pt-32 pb-16'>
      <div className='w-full max-w-[560px]'>
        <div className='bg-[#ffffff] dark:bg-[#27272a] rounded-2xl shadow-sm px-7 py-9 md:px-9'>
          <h1 className='text-[28px] font-bold text-semi-color-text-0 mb-7'>
            {t('密码重置')}
          </h1>

          <Form className='space-y-1'>
            <Form.Input
              field='email'
              label={t('电子邮件')}
              placeholder={t('请输入您的电子邮件地址')}
              name='email'
              size='large'
              className='!rounded-lg'
              value={email}
              onChange={handleChange}
            />

            <div className='pt-5'>
              <Button
                theme='solid'
                className='w-full !h-12 !rounded-full !text-base'
                type='primary'
                htmlType='submit'
                onClick={handleSubmit}
                loading={loading}
                disabled={disableButton}
              >
                {disableButton ? `${t('重试')} (${countdown})` : t('继续')}
              </Button>
            </div>
          </Form>

          <div className='mt-6 text-center text-sm'>
            <Text className='!text-sm'>
              {t('想起来了吗？')}
              <Link
                to='/login'
                className='text-semi-color-primary font-medium ml-1'
              >
                {t('登录')}
              </Link>
            </Text>
          </div>
        </div>

        {turnstileEnabled && (
          <div className='flex justify-center mt-6'>
            <Turnstile
              sitekey={turnstileSiteKey}
              onVerify={(token) => {
                setTurnstileToken(token);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetForm;
