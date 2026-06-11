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

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getSystemName } from '../../helpers';

// 法律文档页（隐私政策/退款政策等），布局按设计稿：返回主页 + 大标题 + 正文。
// doc 结构：{ zh: { title, blocks }, en: { title, blocks } }
// block 类型：h（章节标题）/ h3（小节标题）/ p（段落）/ ul（{ items }）
const LegalDocPage = ({ doc }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const { title, blocks } = doc[lang];
  const systemName = getSystemName();
  const fill = (s) => s.split('{name}').join(systemName);

  return (
    <div className='bg-[#ffffff] dark:bg-[#18181b] min-h-screen'>
      {/* pt 需让出 64px 的 fixed header */}
      <div className='max-w-[1264px] mx-auto px-6 pt-[104px] pb-14'>
        <Link
          to='/'
          className='inline-flex items-center gap-1.5 text-sm !text-[#6B7280] dark:!text-[#a1a1aa] hover:!text-[#1C7AFF] transition-colors'
        >
          <ArrowLeft size={16} />
          {t('返回主页')}
        </Link>
        <h1 className='text-3xl md:text-[40px] font-semibold text-[#1F2329] dark:text-[#ffffff] mt-6'>
          {title}
        </h1>
        <div className='mt-8 max-w-[960px]'>
          {blocks.map((block, index) => {
            if (block.t === 'h') {
              return (
                <h2
                  key={index}
                  className='text-lg md:text-xl font-semibold text-[#1F2329] dark:text-[#ffffff] mt-10 mb-4'
                >
                  {fill(block.text)}
                </h2>
              );
            }
            if (block.t === 'h3') {
              return (
                <h3
                  key={index}
                  className='text-base font-semibold text-[#1F2329] dark:text-[#ffffff] mt-6 mb-3'
                >
                  {fill(block.text)}
                </h3>
              );
            }
            if (block.t === 'ul') {
              return (
                <ul
                  key={index}
                  className='list-disc pl-6 space-y-2 mb-4 text-sm md:text-[15px] leading-7 text-[#4B5563] dark:text-[#a1a1aa]'
                >
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{fill(item)}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={index}
                className='text-sm md:text-[15px] leading-7 text-[#4B5563] dark:text-[#a1a1aa] mb-4'
              >
                {fill(block.text)}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LegalDocPage;
