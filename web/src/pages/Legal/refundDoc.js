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

// 退款政策正文（来自设计稿帧 551:9112 / 383:1132），{name} 渲染时替换为系统名称。
export const refundDoc = {
  zh: {
    title: '退款政策',
    blocks: [
      {
        t: 'p',
        text: '本退款政策适用于{name}平台（以下简称“平台”）所有充值及服务相关的退款申请，旨在明确退款规则，规范申请流程，保护平台及用户的合法权益。本政策为平台服务协议的补充条款。',
      },
      { t: 'h', text: '1. 一般退款规则' },
      {
        t: 'p',
        text: '通过官方平台渠道进行的所有充值操作，一旦金额到账，均不可退款。包括但不限于误充值、充值金额过多或用户不再需要平台服务。',
      },
      {
        t: 'p',
        text: '充值金额仅可用于抵扣平台内AI服务相关的PTC（平台代币积分）消费，不得提现、转账、赠予他人账户或兑换现金。',
      },
      {
        t: 'p',
        text: '平台赠送的免费PTC或通过促销活动获得的PTC不享受任何形式的退款或补偿。',
      },
      { t: 'h', text: '2. 异常退款情况' },
      {
        t: 'p',
        text: '仅当因平台技术问题导致AI服务使用过程中出现异常PTC消费时，方可申请退款。包括但不限于：',
      },
      {
        t: 'ul',
        items: [
          'AI服务出现卡顿、崩溃或响应中断，导致用户未获得有效服务结果但PTC已扣除；',
          '平台系统故障导致重复或过度扣除PTC，且非用户操作失误；',
          '平台技术审核确认的其他异常PTC消费情况。',
        ],
      },
      { t: 'h', text: '3. 退款申请资格' },
      {
        t: 'ul',
        items: [
          '申请人须为实名认证账户持有人，提供与账户信息一致的身份证明及充值凭证；',
          '退款申请须在异常PTC消费发生后7个工作日内提交，逾期不予受理；',
          '需提供清晰有效的异常消费证据，包括但不限于服务操作日志、PTC消费明细截图及故障页面截图；',
          '账户无违规记录（如欺诈计费、恶意利用权益或未经授权使用API），平台有权拒绝违规账户的所有退款申请。',
        ],
      },
      { t: 'h', text: '4. 申请及处理流程' },
      { t: 'h3', text: '提交' },
      {
        t: 'p',
        text: '用户须通过官方客服渠道（如平台内在线客服、官方企业微信或指定邮箱）提交退款申请，说明申请金额、异常消费时间及问题描述，并附相关证据；',
      },
      { t: 'h3', text: '平台审核' },
      {
        t: 'p',
        text: '平台将在3个工作日内进行技术审核及信息核查，并通过用户提供的联系方式反馈结果；',
      },
      { t: 'h3', text: '退款处理' },
      {
        t: 'p',
        text: '审核通过后，平台将按异常PTC消费金额等值退款至用户原支付账户，到账时间视支付渠道及银行处理规则，一般为1-7个工作日；',
      },
      { t: 'h3', text: '拒绝' },
      {
        t: 'p',
        text: '若申请材料不全、非平台技术原因或申请逾期，平台将拒绝申请并说明具体原因。用户可在原事件发生7个工作日内补充材料重新申请。',
      },
      { t: 'h', text: '5. 其他事项' },
      {
        t: 'ul',
        items: [
          '平台仅退还符合规定异常消费的实际PTC金额，不承担因服务故障产生的间接损失（如业务损失或时间成本）；',
          '如用户恶意申请退款或伪造证据，平台有权拒绝退款，并视情节严重程度限制、冻结或终止账户，严重者将追究法律责任；',
          '本政策最终解释权归{name}平台所有，平台可根据业务需要调整政策，调整后政策自官网公布之日起生效。',
        ],
      },
    ],
  },
  en: {
    title: 'Refund Policy',
    blocks: [
      {
        t: 'p',
        text: 'This Refund Policy applies to all top-ups and service-related refund applications for users of the {name} platform (hereinafter referred to as "the Platform"). It aims to clarify refund rules, standardize the application process, and protect the legitimate rights of both the Platform and its users. This policy serves as a supplementary clause to the Platform Service Agreement.',
      },
      { t: 'h', text: '1. General Refund Rules' },
      {
        t: 'p',
        text: "All top-up operations conducted through official platform channels are non-refundable once the amount has been credited. This includes, but is not limited to, accidental top-ups, excessive top-up amounts, or the user no longer requiring the Platform's services.",
      },
      {
        t: 'p',
        text: 'Top-up amounts can only be used to offset PTC (Platform Token Credits) consumption related to AI services within the Platform. They cannot be withdrawn, transferred, gifted to other accounts, or exchanged for cash.',
      },
      {
        t: 'p',
        text: 'Free PTC gifted by the Platform or PTC obtained through promotional activities are not eligible for any form of refund or compensation.',
      },
      { t: 'h', text: '2. Exceptional Refund Circumstances' },
      {
        t: 'p',
        text: 'Refunds may only be requested if abnormal PTC consumption occurs due to Platform technical issues during the use of AI services. These scenarios include, but are not limited to:',
      },
      {
        t: 'ul',
        items: [
          'AI services experiencing freezing, crashing, or response interruptions, resulting in the user failing to receive effective service results while PTC has already been deducted;',
          'Platform system glitches leading to duplicate or excessive PTC deductions not caused by user error;',
          "Other instances of abnormal PTC consumption confirmed by the Platform's technical audit.",
        ],
      },
      { t: 'h', text: '3. Eligibility for Refund Applications' },
      {
        t: 'ul',
        items: [
          'The applicant must be the real-name authenticated account holder and provide identification and top-up vouchers consistent with the account information;',
          'Refund applications must be submitted within 7 working days of the abnormal PTC consumption. Late applications will not be accepted;',
          'Clear and valid evidence of abnormal consumption must be provided, including but not limited to service operation logs, PTC consumption detail screenshots, and fault page screenshots;',
          'The account must have no record of violations (e.g., fraudulent billing, malicious exploitation of benefits, or unauthorized API use). The Platform reserves the right to refuse all refund applications if the account is in violation.',
        ],
      },
      { t: 'h', text: '4. Application and Processing Flow' },
      { t: 'h3', text: 'Submission' },
      {
        t: 'p',
        text: 'Users must submit a refund application through official customer service channels (e.g., in-platform online chat, official Enterprise WeChat, or designated email). Please specify the requested refund amount, time of abnormal consumption, and problem description, accompanied by relevant supporting evidence;',
      },
      { t: 'h3', text: 'Platform Audit' },
      {
        t: 'p',
        text: 'Upon receiving the application, the Platform will conduct a technical audit and information review within 3 working days. The result will be communicated via the user’s provided contact information;',
      },
      { t: 'h3', text: 'Refund Processing' },
      {
        t: 'p',
        text: 'If approved, the Platform will refund the equivalent amount of the abnormal PTC consumption to the user’s original payment account. The arrival time depends on the processing rules of the payment channel and bank, generally taking 1-7 working days;',
      },
      { t: 'h3', text: 'Rejection' },
      {
        t: 'p',
        text: 'If the application materials are incomplete, the issue was not caused by Platform technical errors, or the application is overdue, the Platform will reject the request and provide specific reasons. Users may re-apply with additional materials (within 7 working days of the original event).',
      },
      { t: 'h', text: '5. Miscellaneous' },
      {
        t: 'ul',
        items: [
          'The Platform only refunds the actual PTC amount consumed abnormally under the specified circumstances. It does not bear any liability for indirect losses (e.g., business losses or time costs incurred due to service failures);',
          'If a user engages in malicious refund applications or falsifies evidence, the Platform reserves the right to refuse the refund and may restrict, freeze, or terminate the account depending on the severity. Legal action may be pursued in serious cases;',
          'The Platform ({name}) reserves the final right of interpretation for this policy. The Platform may adjust the policy based on business needs; adjusted policies will take effect upon being posted on the official website.',
        ],
      },
    ],
  },
};
