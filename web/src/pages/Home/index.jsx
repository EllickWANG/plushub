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

import React, { useContext, useEffect, useState } from 'react';
import { API, showError, getSystemName } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Sparkles,
  Share2,
  SquareActivity,
  ShieldUser,
  Send,
  Mail,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

// 浮动联系方式链接，部署时按需填写
const CONTACT_LINKS = {
  wechat: '#',
  telegram: '#',
  email: '#',
  whatsapp: '#',
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [expandedSecurity, setExpandedSecurity] = useState(0);
  const isMobile = useIsMobile();
  const systemName = getSystemName();

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  const advantages = [
    {
      icon: <Sparkles size={36} strokeWidth={2} />,
      title: t('一站接入'),
      desc: t(
        'ChatGPT · Claude · Gemini · DeepSeek · Seedance · Seedream 等主流模型，一站式接入。',
      ),
    },
    {
      icon: <Share2 size={36} strokeWidth={2} />,
      title: t('官方直连'),
      desc: t('全系模型均采用官方接口，稳定可靠、响应迅速、体验一致。'),
    },
    {
      icon: <SquareActivity size={36} strokeWidth={2} />,
      title: t('按需付费'),
      desc: t('按实际使用量计费，余额不过期，随用随充，成本可控'),
    },
    {
      icon: <ShieldUser size={36} strokeWidth={2} />,
      title: t('明细可查'),
      desc: t('请求消耗全程可追踪，价格透明清晰，无隐藏费用，用得放心'),
    },
  ];

  const providerIcons = [
    { key: 'Moonshot', node: <Moonshot size={40} /> },
    { key: 'OpenAI', node: <OpenAI size={40} /> },
    { key: 'XAI', node: <XAI size={40} /> },
    { key: 'Zhipu', node: <Zhipu.Color size={40} /> },
    { key: 'Volcengine', node: <Volcengine.Color size={40} /> },
    { key: 'Cohere', node: <Cohere.Color size={40} /> },
    { key: 'Claude', node: <Claude.Color size={40} /> },
    { key: 'Gemini', node: <Gemini.Color size={40} /> },
    { key: 'Suno', node: <Suno size={40} /> },
    { key: 'Minimax', node: <Minimax.Color size={40} /> },
    { key: 'Wenxin', node: <Wenxin.Color size={40} /> },
    { key: 'Spark', node: <Spark.Color size={40} /> },
    { key: 'Qingyan', node: <Qingyan.Color size={40} /> },
    { key: 'DeepSeek', node: <DeepSeek.Color size={40} /> },
    { key: 'Qwen', node: <Qwen.Color size={40} /> },
    { key: 'Midjourney', node: <Midjourney size={40} /> },
    { key: 'Grok', node: <Grok size={40} /> },
    { key: 'AzureAI', node: <AzureAI.Color size={40} /> },
    { key: 'Hunyuan', node: <Hunyuan.Color size={40} /> },
    { key: 'Xinference', node: <Xinference.Color size={40} /> },
  ];

  const securityItems = [
    {
      title: t('端到端加密，整个链路全程安心无忧'),
      desc: t(
        'MaaS导入模型时，用户可选择HTTPS传输协议。为保证数据传输安全，建议用户使用更安全的HTTPS协议。',
      ),
    },
    {
      title: t('整个操作过程可审计，风险在整个用户范围内可控'),
      desc: t(
        '平台对关键操作全程留痕，提供完整的日志与审计能力，风险可追溯、可控制。',
      ),
    },
  ];

  const steps = [
    {
      title: t('注册账号'),
      desc: t('创建一个账户开始使用。您可以稍后为您的团队设置一个组织。'),
    },
    {
      title: t('购买积分'),
      desc: t('积分可用于任何模型或提供商。'),
    },
    {
      title: t('获取您的API密钥'),
      desc: t('创建API密钥并开始发起请求。完全兼容OpenAI。'),
    },
  ];

  const contactRailItems = [
    {
      key: 'wechat',
      label: t('微信'),
      icon: <MessageCircle size={16} />,
      href: CONTACT_LINKS.wechat,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <Send size={16} />,
      href: CONTACT_LINKS.telegram,
    },
    {
      key: 'email',
      label: t('邮箱'),
      icon: <Mail size={16} />,
      href: CONTACT_LINKS.email,
    },
  ];

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden bg-[#ffffff] dark:bg-[#18181b]'>
          {/* Hero */}
          <section className='ph-hero'>
            <img
              src='/hero-3d.webp'
              alt=''
              className='ph-hero-art absolute right-0 top-0 h-[88%] w-auto hidden md:block'
            />
            <div className='relative max-w-[1264px] mx-auto px-6 flex items-center min-h-[480px] md:min-h-[560px] lg:min-h-[640px]'>
              <div className='max-w-2xl py-16'>
                <h1 className='text-4xl md:text-5xl lg:text-[56px] font-semibold text-[#ffffff] leading-[1.15]'>
                  {t('LLM的统一接口')}
                </h1>
                <p className='text-[rgba(255,255,255,0.92)] text-sm md:text-base mt-5 max-w-xl leading-relaxed'>
                  {t('价格更优惠，运行时间更长，无需订阅')}
                </p>
                <div className='flex flex-wrap items-center gap-4 mt-9'>
                  <Link to='/console/token'>
                    <button className='h-11 px-8 rounded-full bg-[#ffffff] text-[#1F2329] text-sm font-medium hover:bg-[#EFF6FF] transition-colors'>
                      {t('获取API密钥')}
                    </button>
                  </Link>
                  <Link to='/pricing'>
                    <button className='h-11 px-8 rounded-full bg-[rgba(255,255,255,0.2)] text-[#ffffff] text-sm font-medium hover:bg-[rgba(255,255,255,0.3)] transition-colors'>
                      {t('探索模型')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 与主流模型供应商深度对接 */}
          <section className='max-w-[1264px] mx-auto px-6 pt-16 md:pt-24'>
            <h2 className='text-3xl md:text-4xl font-semibold text-[#1F2329] dark:text-[#ffffff]'>
              {t('与主流模型供应商深度对接')}
            </h2>
            <p className='text-[#6B7280] dark:text-[#a1a1aa] text-sm md:text-base mt-4'>
              {t('保持统一协议，快速切换扩展模型能力，随时接入最新模型')}
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 mt-10'>
              {providerIcons.map((item) => (
                <div
                  key={item.key}
                  className='bg-[#ffffff] dark:bg-[#27272a] border border-[#E5E9F0] dark:border-[#3f3f46] rounded-xl h-[88px] md:h-[96px] flex items-center justify-center text-[#1F2329] dark:text-[#ffffff]'
                >
                  {item.node}
                </div>
              ))}
              <div className='bg-[#ffffff] dark:bg-[#27272a] border border-[#E5E9F0] dark:border-[#3f3f46] rounded-xl h-[88px] md:h-[96px] flex items-center justify-center'>
                <span className='text-2xl font-semibold text-[#1F2329] dark:text-[#ffffff]'>
                  30+
                </span>
              </div>
            </div>
          </section>

          {/* 核心优势 */}
          <section className='max-w-[1264px] mx-auto px-6 py-16 md:py-24'>
            <h2 className='text-3xl md:text-4xl font-semibold text-[#1F2329] dark:text-[#ffffff]'>
              {t('核心优势')}
            </h2>
            <p className='text-[#6B7280] dark:text-[#a1a1aa] text-sm md:text-base mt-4'>
              {t('一站式AI模型集成平台，赋能企业四大核心能力，实现高效开发')}
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-10'>
              {advantages.map((item) => (
                <div
                  key={item.title}
                  className='bg-[#F3F6FA] dark:bg-[#27272a] rounded-2xl p-8 min-h-[240px] flex flex-col justify-between'
                >
                  <div className='text-[#1C7AFF]'>{item.icon}</div>
                  <div className='mt-16'>
                    <h3 className='text-lg md:text-xl font-semibold text-[#1F2329] dark:text-[#ffffff]'>
                      {item.title}
                    </h3>
                    <p className='text-[#6B7280] dark:text-[#a1a1aa] text-sm md:text-base mt-3 leading-relaxed'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 三步上手（蓝色点阵横幅） */}
          <section className='ph-band py-16 md:py-24'>
            <div className='max-w-[1264px] mx-auto px-6'>
              <div className='text-center'>
                <h2 className='text-3xl md:text-4xl font-semibold text-[#ffffff]'>
                  {t('三步即可使用API')}
                </h2>
                <p className='text-[rgba(255,255,255,0.88)] text-sm md:text-base mt-4'>
                  {t(
                    '开始使用 {{name}} 非常简单。您可以在短短 3 分钟内开始编码。',
                    {
                      name: systemName,
                    },
                  )}
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 mt-12 md:mt-16'>
                {steps.map((step, index) => (
                  <div key={step.title} className='flex flex-col items-center'>
                    <div className='flex items-center w-full'>
                      <div
                        className={`flex-1 ${index > 0 ? 'ph-step-dots !mx-0' : ''}`}
                      />
                      <span className='text-4xl md:text-5xl font-bold text-[#ffffff] px-3'>
                        {`0${index + 1}`}
                        <span className='text-[rgba(255,255,255,0.5)] font-light'>
                          /
                        </span>
                      </span>
                      <div
                        className={`flex-1 ${index < steps.length - 1 ? 'ph-step-dots !mx-0' : ''}`}
                      />
                    </div>
                    <h3 className='text-lg md:text-xl font-semibold text-[#ffffff] mt-8 text-center'>
                      {step.title}
                    </h3>
                    <p className='text-[rgba(255,255,255,0.85)] text-sm md:text-base mt-3 text-center max-w-xs leading-relaxed'>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 可信赖的安全基础 */}
          <section className='max-w-[1264px] mx-auto px-6 py-16 md:py-24'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
              <img
                src='/security-shield.webp'
                alt=''
                className='w-full max-w-[520px] rounded-3xl mx-auto lg:mx-0'
              />
              <div>
                <h2 className='text-3xl md:text-4xl font-semibold text-[#1F2329] dark:text-[#ffffff]'>
                  {t('可信赖的安全基础')}
                </h2>
                <p className='text-[#6B7280] dark:text-[#a1a1aa] text-sm md:text-base mt-4 leading-relaxed'>
                  {t('全方位安全防护，为企业级AI应用构筑坚实的合规防线')}
                </p>
                <div className='mt-8'>
                  {securityItems.map((item, index) => (
                    <div
                      key={item.title}
                      className='border-t border-[#E5E9F0] dark:border-[#3f3f46] py-6'
                    >
                      <button
                        type='button'
                        onClick={() =>
                          setExpandedSecurity(
                            expandedSecurity === index ? -1 : index,
                          )
                        }
                        className='w-full flex items-start justify-between gap-6 text-left'
                      >
                        <span className='text-base md:text-lg font-semibold text-[#1F2329] dark:text-[#ffffff] leading-snug'>
                          {item.title}
                        </span>
                        <span className='flex-shrink-0 w-7 h-7 rounded-full border border-[#D7DDE5] dark:border-[#52525b] text-[#1F2329] dark:text-[#ffffff] flex items-center justify-center mt-0.5'>
                          {expandedSecurity === index ? (
                            <Minus size={14} />
                          ) : (
                            <Plus size={14} />
                          )}
                        </span>
                      </button>
                      {expandedSecurity === index && (
                        <p className='text-[#6B7280] dark:text-[#a1a1aa] text-sm md:text-base mt-3 leading-relaxed pr-12'>
                          {item.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 右侧浮动联系栏 */}
          <div className='hidden lg:flex flex-col fixed right-3 top-1/2 -translate-y-1/2 z-40 bg-[#ffffff] dark:bg-[#27272a] rounded-xl shadow-lg border border-semi-color-border overflow-hidden'>
            {contactRailItems.map((item, index) => (
              <a
                key={item.key}
                href={item.href}
                target='_blank'
                rel='noopener noreferrer'
                className={`flex flex-col items-center gap-1.5 px-3.5 py-3.5 hover:bg-[#F3F6FA] dark:hover:bg-[#3f3f46] transition-colors ${index > 0 ? 'border-t border-semi-color-border' : ''}`}
              >
                <span className='w-7 h-7 rounded-full bg-[#4B5563] text-[#ffffff] flex items-center justify-center'>
                  {item.icon}
                </span>
                <span className='text-xs text-[#6B7280] dark:text-[#a1a1aa]'>
                  {item.label}
                </span>
              </a>
            ))}
          </div>

          {/* WhatsApp 浮动按钮 */}
          <a
            href={CONTACT_LINKS.whatsapp}
            target='_blank'
            rel='noopener noreferrer'
            className='hidden lg:flex flex-col items-center gap-1 fixed right-3 bottom-6 z-40 bg-[#ffffff] dark:bg-[#27272a] rounded-xl shadow-lg border border-semi-color-border px-3 py-2.5 hover:bg-[#F3F6FA] dark:hover:bg-[#3f3f46] transition-colors'
          >
            <span className='w-7 h-7 rounded-full bg-[#25D366] text-[#ffffff] flex items-center justify-center'>
              <FaWhatsapp size={16} />
            </span>
            <span className='text-[10px] text-[#6B7280] dark:text-[#a1a1aa]'>
              Whatsapp
            </span>
          </a>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
