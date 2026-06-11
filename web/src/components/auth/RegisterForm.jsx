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

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  API,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
  getOAuthProviderIcon,
  setUserData,
  onDiscordOAuthClicked,
  onCustomOAuthClicked,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Icon,
  Modal,
  Tooltip,
} from '@douyinfe/semi-ui';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import { IconGithubLogo } from '@douyinfe/semi-icons';
import {
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '../../helpers';
import OIDCIcon from '../common/logo/OIDCIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import TelegramLoginButton from 'react-telegram-login/src';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';

const RegisterForm = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const githubButtonTextKeyByState = {
    idle: '使用 GitHub 继续',
    redirecting: '正在跳转 GitHub...',
    timeout: '请求超时，请刷新页面后重新发起 GitHub 登录',
  };
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    verification_code: '',
    wechat_verification_code: '',
  });
  const { username, password, password2 } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verificationCodeLoading, setVerificationCodeLoading] = useState(false);
  const [wechatCodeSubmitLoading, setWechatCodeSubmitLoading] = useState(false);
  const [customOAuthLoading, setCustomOAuthLoading] = useState({});
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasUserAgreement, setHasUserAgreement] = useState(false);
  const [hasPrivacyPolicy, setHasPrivacyPolicy] = useState(false);
  const [githubButtonState, setGithubButtonState] = useState('idle');
  const [githubButtonDisabled, setGithubButtonDisabled] = useState(false);
  const githubTimeoutRef = useRef(null);
  const githubButtonText = t(githubButtonTextKeyByState[githubButtonState]);

  let affCode = new URLSearchParams(window.location.search).get('aff');
  if (affCode) {
    localStorage.setItem('aff', affCode);
  }

  const status = useMemo(() => {
    if (statusState?.status) return statusState.status;
    const savedStatus = localStorage.getItem('status');
    if (!savedStatus) return {};
    try {
      return JSON.parse(savedStatus) || {};
    } catch (err) {
      return {};
    }
  }, [statusState?.status]);
  const hasCustomOAuthProviders =
    (status.custom_oauth_providers || []).length > 0;
  const hasOAuthRegisterOptions = Boolean(
    status.github_oauth ||
      status.discord_oauth ||
      status.oidc_enabled ||
      status.wechat_login ||
      status.linuxdo_oauth ||
      status.telegram_oauth ||
      hasCustomOAuthProviders,
  );

  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    setShowEmailVerification(!!status?.email_verification);
    if (status?.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(status.turnstile_site_key);
    }

    // 从 status 获取用户协议和隐私政策的启用状态
    setHasUserAgreement(status?.user_agreement_enabled || false);
    setHasPrivacyPolicy(status?.privacy_policy_enabled || false);
  }, [status]);

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
    return () => clearInterval(countdownInterval); // Clean up on unmount
  }, [disableButton, countdown]);

  useEffect(() => {
    return () => {
      if (githubTimeoutRef.current) {
        clearTimeout(githubTimeoutRef.current);
      }
    };
  }, []);

  const onWeChatLoginClicked = () => {
    setWechatLoading(true);
    setShowWeChatLoginModal(true);
    setWechatLoading(false);
  };

  const onSubmitWeChatVerificationCode = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setWechatCodeSubmitLoading(true);
    try {
      const res = await API.get(
        `/api/oauth/wechat?code=${inputs.wechat_verification_code}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        setUserData(data);
        updateAPI();
        navigate('/');
        showSuccess('登录成功！');
        setShowWeChatLoginModal(false);
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    } finally {
      setWechatCodeSubmitLoading(false);
    }
  };

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (password.length < 8) {
      showInfo('密码长度不得小于 8 位！');
      return;
    }
    if (password !== password2) {
      showInfo('两次输入的密码不一致');
      return;
    }
    if (username && password) {
      if (turnstileEnabled && turnstileToken === '') {
        showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
        return;
      }
      setRegisterLoading(true);
      try {
        if (!affCode) {
          affCode = localStorage.getItem('aff');
        }
        inputs.aff_code = affCode;
        const res = await API.post(
          `/api/user/register?turnstile=${turnstileToken}`,
          inputs,
        );
        const { success, message } = res.data;
        if (success) {
          navigate('/login');
          showSuccess('注册成功！');
        } else {
          showError(message);
        }
      } catch (error) {
        showError('注册失败，请重试');
      } finally {
        setRegisterLoading(false);
      }
    }
  }

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setVerificationCodeLoading(true);
    try {
      const res = await API.get(
        `/api/verification?email=${encodeURIComponent(inputs.email)}&turnstile=${turnstileToken}`,
      );
      const { success, message } = res.data;
      if (success) {
        showSuccess('验证码发送成功，请检查你的邮箱！');
        setDisableButton(true); // 发送成功后禁用按钮，开始倒计时
      } else {
        showError(message);
      }
    } catch (error) {
      showError('发送验证码失败，请重试');
    } finally {
      setVerificationCodeLoading(false);
    }
  };

  const handleGitHubClick = () => {
    if (githubButtonDisabled) {
      return;
    }
    setGithubLoading(true);
    setGithubButtonDisabled(true);
    setGithubButtonState('redirecting');
    if (githubTimeoutRef.current) {
      clearTimeout(githubTimeoutRef.current);
    }
    githubTimeoutRef.current = setTimeout(() => {
      setGithubLoading(false);
      setGithubButtonState('timeout');
      setGithubButtonDisabled(true);
    }, 20000);
    try {
      onGitHubOAuthClicked(status.github_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setGithubLoading(false), 3000);
    }
  };

  const handleDiscordClick = () => {
    setDiscordLoading(true);
    try {
      onDiscordOAuthClicked(status.discord_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setDiscordLoading(false), 3000);
    }
  };

  const handleOIDCClick = () => {
    setOidcLoading(true);
    try {
      onOIDCClicked(
        status.oidc_authorization_endpoint,
        status.oidc_client_id,
        false,
        { shouldLogout: true },
      );
    } finally {
      setTimeout(() => setOidcLoading(false), 3000);
    }
  };

  const handleLinuxDOClick = () => {
    setLinuxdoLoading(true);
    try {
      onLinuxDOOAuthClicked(status.linuxdo_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setLinuxdoLoading(false), 3000);
    }
  };

  const handleCustomOAuthClick = (provider) => {
    setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: true }));
    try {
      onCustomOAuthClicked(provider, { shouldLogout: true });
    } finally {
      setTimeout(() => {
        setCustomOAuthLoading((prev) => ({ ...prev, [provider.slug]: false }));
      }, 3000);
    }
  };

  const onTelegramLoginClicked = async (response) => {
    const fields = [
      'id',
      'first_name',
      'last_name',
      'username',
      'photo_url',
      'auth_date',
      'hash',
      'lang',
    ];
    const params = {};
    fields.forEach((field) => {
      if (response[field]) {
        params[field] = response[field];
      }
    });
    try {
      const res = await API.get(`/api/oauth/telegram/login`, { params });
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        setUserData(data);
        updateAPI();
        navigate('/');
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    }
  };

  // 带红色星号的必填项标签
  const requiredLabel = (text) => (
    <span>
      {text}
      <span className='text-red-500 ml-0.5' style={{ color: '#f5222d' }}>
        *
      </span>
    </span>
  );

  // 第三方注册圆形图标按钮
  const renderOAuthIconRow = () => {
    const iconButtonClass =
      '!w-11 !h-11 !rounded-full !border !border-semi-color-border hover:!bg-semi-color-fill-0 transition-colors';
    return (
      <>
        <Divider margin='16px' align='center'>
          <span className='text-xs text-semi-color-text-2'>{t('或')}</span>
        </Divider>
        <div className='flex items-center justify-center flex-wrap gap-3'>
          {status.wechat_login && (
            <Tooltip content={t('使用 微信 继续')}>
              <Button
                theme='borderless'
                type='tertiary'
                className={iconButtonClass}
                icon={<Icon svg={<WeChatIcon />} style={{ color: '#07C160' }} />}
                onClick={onWeChatLoginClicked}
                loading={wechatLoading}
              />
            </Tooltip>
          )}
          {status.github_oauth && (
            <Tooltip content={githubButtonText}>
              <Button
                theme='borderless'
                type='tertiary'
                className={iconButtonClass}
                icon={<IconGithubLogo size='large' />}
                onClick={handleGitHubClick}
                loading={githubLoading}
                disabled={githubButtonDisabled}
              />
            </Tooltip>
          )}
          {status.discord_oauth && (
            <Tooltip content={t('使用 Discord 继续')}>
              <Button
                theme='borderless'
                type='tertiary'
                className={iconButtonClass}
                icon={
                  <SiDiscord
                    style={{ color: '#5865F2', width: '20px', height: '20px' }}
                  />
                }
                onClick={handleDiscordClick}
                loading={discordLoading}
              />
            </Tooltip>
          )}
          {status.oidc_enabled && (
            <Tooltip content={t('使用 OIDC 继续')}>
              <Button
                theme='borderless'
                type='tertiary'
                className={iconButtonClass}
                icon={<OIDCIcon style={{ color: '#1877F2' }} />}
                onClick={handleOIDCClick}
                loading={oidcLoading}
              />
            </Tooltip>
          )}
          {status.linuxdo_oauth && (
            <Tooltip content={t('使用 LinuxDO 继续')}>
              <Button
                theme='borderless'
                type='tertiary'
                className={iconButtonClass}
                icon={
                  <LinuxDoIcon
                    style={{ color: '#E95420', width: '20px', height: '20px' }}
                  />
                }
                onClick={handleLinuxDOClick}
                loading={linuxdoLoading}
              />
            </Tooltip>
          )}
          {status.custom_oauth_providers &&
            status.custom_oauth_providers.map((provider) => (
              <Tooltip
                key={provider.slug}
                content={t('使用 {{name}} 继续', { name: provider.name })}
              >
                <Button
                  theme='borderless'
                  type='tertiary'
                  className={iconButtonClass}
                  icon={getOAuthProviderIcon(provider.icon || '', 20)}
                  onClick={() => handleCustomOAuthClick(provider)}
                  loading={customOAuthLoading[provider.slug]}
                />
              </Tooltip>
            ))}
        </div>
        {status.telegram_oauth && (
          <div className='flex justify-center mt-4'>
            <TelegramLoginButton
              dataOnauth={onTelegramLoginClicked}
              botName={status.telegram_bot_name}
            />
          </div>
        )}
      </>
    );
  };

  const renderWeChatLoginModal = () => {
    return (
      <Modal
        title={t('微信扫码登录')}
        visible={showWeChatLoginModal}
        maskClosable={true}
        onOk={onSubmitWeChatVerificationCode}
        onCancel={() => setShowWeChatLoginModal(false)}
        okText={t('登录')}
        centered={true}
        okButtonProps={{
          loading: wechatCodeSubmitLoading,
        }}
      >
        <div className='flex flex-col items-center'>
          <img src={status.wechat_qrcode} alt='微信二维码' className='mb-4' />
        </div>

        <div className='text-center mb-4'>
          <p>
            {t('微信扫码关注公众号，输入「验证码」获取验证码（三分钟内有效）')}
          </p>
        </div>

        <Form>
          <Form.Input
            field='wechat_verification_code'
            placeholder={t('验证码')}
            label={t('验证码')}
            value={inputs.wechat_verification_code}
            onChange={(value) =>
              handleChange('wechat_verification_code', value)
            }
          />
        </Form>
      </Modal>
    );
  };

  return (
    <div className='ph-auth-bg min-h-screen flex items-start justify-center px-4 pt-28 pb-16'>
      <div className='w-full max-w-[560px]'>
        <div className='bg-[#ffffff] dark:bg-[#27272a] rounded-2xl shadow-sm px-7 py-9 md:px-9'>
          <h1 className='text-[28px] font-bold text-semi-color-text-0 mb-7'>
            {t('注册')}
          </h1>

          <Form className='space-y-1'>
            <Form.Input
              field='username'
              label={requiredLabel(t('用户名'))}
              placeholder={t('请输入用户名')}
              name='username'
              size='large'
              className='!rounded-lg'
              onChange={(value) => handleChange('username', value)}
            />

            <Form.Input
              field='password'
              label={requiredLabel(t('密码'))}
              placeholder={t('请输入您的密码')}
              name='password'
              mode='password'
              size='large'
              className='!rounded-lg'
              onChange={(value) => handleChange('password', value)}
            />

            <Form.Input
              field='password2'
              label={requiredLabel(t('确认密码'))}
              placeholder={t('请确认您的密码')}
              name='password2'
              mode='password'
              size='large'
              className='!rounded-lg'
              onChange={(value) => handleChange('password2', value)}
            />

            {showEmailVerification && (
              <>
                <Form.Input
                  field='email'
                  label={requiredLabel(t('邮箱'))}
                  placeholder={t('输入邮箱地址')}
                  name='email'
                  type='email'
                  size='large'
                  className='!rounded-lg'
                  onChange={(value) => handleChange('email', value)}
                  suffix={
                    <Button
                      onClick={sendVerificationCode}
                      loading={verificationCodeLoading}
                      disabled={disableButton || verificationCodeLoading}
                      theme='borderless'
                      type='primary'
                    >
                      {disableButton
                        ? `${t('重新发送')} (${countdown})`
                        : t('获取验证码')}
                    </Button>
                  }
                />
                <Form.Input
                  field='verification_code'
                  label={requiredLabel(t('验证码'))}
                  placeholder={t('输入验证码')}
                  name='verification_code'
                  size='large'
                  className='!rounded-lg'
                  onChange={(value) =>
                    handleChange('verification_code', value)
                  }
                />
              </>
            )}

            {(hasUserAgreement || hasPrivacyPolicy) && (
              <div className='pt-3'>
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                >
                  <Text size='small' className='!text-sm'>
                    {t('我已阅读并同意')}
                    {hasUserAgreement && (
                      <a
                        href='/user-agreement'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-semi-color-primary mx-1'
                      >
                        {t('用户协议')}
                      </a>
                    )}
                    {hasUserAgreement && hasPrivacyPolicy && t('和')}
                    {hasPrivacyPolicy && (
                      <a
                        href='/privacy-policy'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-semi-color-primary mx-1'
                      >
                        {t('隐私政策')}
                      </a>
                    )}
                  </Text>
                </Checkbox>
              </div>
            )}

            <div className='pt-6'>
              <Button
                theme='solid'
                type='primary'
                htmlType='submit'
                className='w-full !h-12 !rounded-full !text-base'
                onClick={handleSubmit}
                loading={registerLoading}
                disabled={
                  (hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms
                }
              >
                {t('注册')}
              </Button>
            </div>
          </Form>

          <div className='mt-6 text-center text-sm'>
            <Text className='!text-sm'>
              {t('已有账户？')}
              <Link
                to='/login'
                className='text-semi-color-primary font-medium ml-1'
              >
                {t('登录')}
              </Link>
            </Text>
          </div>

          {hasOAuthRegisterOptions && renderOAuthIconRow()}
        </div>

        {renderWeChatLoginModal()}

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

export default RegisterForm;
