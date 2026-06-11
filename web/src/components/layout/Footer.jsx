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

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Typography } from '@douyinfe/semi-ui';
import { getFooterHTML, getLogo, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const FooterBar = () => {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(getFooterHTML());
  const systemName = getSystemName();
  const logo = getLogo();
  const [statusState] = useContext(StatusContext);
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  const currentYear = new Date().getFullYear();

  // 双色字标：形如 “PLUSHUB” 的名称前段为品牌蓝、“HUB” 为深色
  const wordmarkMatch = /^(.+?)(hub)$/i.exec(systemName || '');

  const contactIcons = [
    { key: 'whatsapp', icon: <FaWhatsapp size={15} />, href: '#' },
    { key: 'telegram', icon: <Send size={15} />, href: '#' },
    { key: 'wechat', icon: <MessageCircle size={15} />, href: '#' },
    { key: 'email', icon: <Mail size={15} />, href: '#' },
  ];

  // 链接为 '#' 的条目为占位，部署时按需补充实际地址
  const linkColumns = [
    {
      title: t('产品'),
      links: [
        { label: t('首页'), to: '/' },
        { label: t('模型广场'), to: '/pricing' },
        { label: t('联系我们'), href: '#' },
      ],
    },
    {
      title: t('法律'),
      links: [
        { label: t('隐私政策'), to: '/privacy-policy' },
        { label: t('服务条款'), to: '/user-agreement' },
        { label: t('退款政策'), to: '/refund-policy' },
        { label: t('可接受使用政策'), href: '#' },
      ],
    },
    {
      title: t('联系方式'),
      links: [
        { label: 'Whatsapp', href: '#' },
        { label: t('微信'), href: '#' },
        { label: 'Telegram', href: '#' },
        { label: t('邮箱'), href: '#' },
      ],
    },
  ];

  const customFooter = useMemo(
    () => (
      <footer className='relative h-auto py-14 px-6 w-full flex flex-col items-center justify-between overflow-hidden border-t border-semi-color-border'>
        {isDemoSiteMode && (
          <div className='flex flex-col md:flex-row justify-between w-full max-w-[1110px] mb-10 gap-8'>
            <div className='flex-shrink-0'>
              <img
                src={logo}
                alt={systemName}
                className='w-16 h-16 rounded-full bg-gray-800 p-1.5 object-contain'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full'>
              <div className='text-left'>
                <p className='!text-semi-color-text-0 font-semibold mb-5'>
                  {t('关于我们')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://docs.newapi.pro/wiki/project-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('关于项目')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/support/community-interaction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('联系我们')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/wiki/features-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('功能特性')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='!text-semi-color-text-0 font-semibold mb-5'>
                  {t('文档')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://docs.newapi.pro/getting-started/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('快速开始')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/installation/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('安装指南')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/api/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    {t('API 文档')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='!text-semi-color-text-0 font-semibold mb-5'>
                  {t('相关项目')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://github.com/songquanpeng/one-api'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    One API
                  </a>
                  <a
                    href='https://github.com/novicezk/midjourney-proxy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    Midjourney-Proxy
                  </a>
                  <a
                    href='https://github.com/Calcium-Ion/neko-api-key-tool'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    neko-api-key-tool
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='!text-semi-color-text-0 font-semibold mb-5'>
                  {t('友情链接')}
                </p>
                <div className='flex flex-col gap-4'>
                  <a
                    href='https://github.com/Calcium-Ion/new-api-horizon'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    new-api-horizon
                  </a>
                  <a
                    href='https://github.com/coaidev/coai'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    CoAI
                  </a>
                  <a
                    href='https://www.gpt-load.com/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='!text-semi-color-text-1'
                  >
                    GPT-Load
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col lg:flex-row items-start justify-between w-full max-w-[1216px] gap-12'>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center gap-2'>
              <img src={logo} alt={systemName} className='w-7 h-7' />
              <span className='text-xl font-bold tracking-wide !text-semi-color-text-0'>
                {wordmarkMatch ? (
                  <>
                    <span style={{ color: 'var(--ph-blue)' }}>
                      {wordmarkMatch[1]}
                    </span>
                    <span>{wordmarkMatch[2]}</span>
                  </>
                ) : (
                  systemName
                )}
              </span>
            </div>
            <Typography.Text className='text-sm !text-semi-color-text-1'>
              © {currentYear} {systemName}. {t('版权所有')}
            </Typography.Text>
            <div className='flex items-center gap-4'>
              {contactIcons.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-8 h-8 rounded-full bg-[#9AA4B2] hover:bg-[#7C8694] text-[#ffffff] flex items-center justify-center transition-colors'
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-24'>
            {linkColumns.map((column) => (
              <div key={column.title} className='text-left'>
                <p className='!text-semi-color-text-0 font-semibold mb-5'>
                  {column.title}
                </p>
                <div className='flex flex-col gap-3.5'>
                  {column.links.map((link) =>
                    link.to ? (
                      <Link
                        key={link.label}
                        to={link.to}
                        className='text-sm !text-semi-color-text-1 hover:!text-semi-color-text-0'
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={link.label}
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm !text-semi-color-text-1 hover:!text-semi-color-text-0'
                      >
                        {link.label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    ),
    [logo, systemName, t, currentYear, isDemoSiteMode],
  );

  useEffect(() => {
    loadFooter();
  }, []);

  return (
    <div className='w-full'>
      {footer ? (
        <footer className='relative h-auto py-4 px-6 md:px-24 w-full flex items-center justify-center overflow-hidden'>
          <div className='flex flex-col md:flex-row items-center justify-between w-full max-w-[1110px] gap-4'>
            <div
              className='custom-footer na-cb6feafeb3990c78 text-sm !text-semi-color-text-1'
              dangerouslySetInnerHTML={{ __html: footer }}
            ></div>
            <div className='text-sm flex-shrink-0'>
              <span className='!text-semi-color-text-1'>
                {t('设计与开发由')}{' '}
              </span>
              <span className='!text-semi-color-primary font-medium'>
                Cosmic AI
              </span>
            </div>
          </div>
        </footer>
      ) : (
        customFooter
      )}
    </div>
  );
};

export default FooterBar;
