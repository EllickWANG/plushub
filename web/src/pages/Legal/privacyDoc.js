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

// 隐私政策正文（来自设计稿帧 564:3281 / 365:621），{name} 渲染时替换为系统名称。
// 注意：设计稿源文本到「3. 我们如何共享和披露您的个人数据」第一条即止，后续章节设计稿未提供。
export const privacyDoc = {
  zh: {
    title: '隐私政策',
    blocks: [
      { t: 'p', text: '最后更新：2025年4月15日' },
      {
        t: 'p',
        text: '{name}（“我们”）尊重您的隐私，并致力于通过遵守本隐私政策来保护您的隐私。我们制定本隐私政策，旨在告知您我们关于个人数据收集、使用和披露的政策，以及您对该信息所拥有的选择权。本隐私政策中使用但未定义的专有名词，其含义以我们的服务条款中定义为准。本隐私政策适用于通过任何书面、电子或口头通信收集的所有个人数据，具体包括您：',
      },
      {
        t: 'ul',
        items: [
          '访问位于{name}的网站及所有链接至本隐私政策的相关网页和网站（“网站”）；',
          '在第三方网站和服务上的应用程序中互动，若这些应用程序包含指向本隐私政策的链接；',
          '使用我们的服务。',
        ],
      },
      {
        t: 'p',
        text: '在使用我们的网站和服务之前，请仔细阅读我们的服务条款和本隐私政策。通过使用本网站或服务，您即同意按照本隐私政策及我们的服务条款收集和使用您的个人数据。如果您对本隐私政策或服务条款的任何部分感到不适，您不应使用或访问我们的网站或服务。',
      },
      {
        t: 'p',
        text: '我们可能随时修改本隐私政策，且无需事先通知，修改内容可能适用于我们持有的您的任何个人数据以及修改后收集的新个人数据。如有更改，修订后的隐私政策将发布在我们的网站上；页面顶部会注明最后修订日期。若我们对用户（“用户”）个人数据的收集、使用或披露方式或影响用户权利的重大变更，我们将通过电子邮件提前通知用户。用户有责任确保我们拥有其最新、有效且可送达的电子邮件地址。您继续使用或重新访问网站或服务，即表示您接受并同意这些更改。您应不时查看本页面，以了解任何变更，因为这些变更对您具有约束力。',
      },
      {
        t: 'p',
        text: '我们还可能提供额外的“即时”披露或关于我们服务数据收集、使用和共享实践的补充信息。这些通知可能补充或澄清我们的隐私做法，或为您提供关于我们如何处理您的个人数据的额外选择。',
      },
      { t: 'h', text: '1. 个人数据的收集' },
      {
        t: 'p',
        text: '当您使用我们的网站和服务时，我们会收集个人数据。个人数据是指与您相关、能识别您身份或可用于识别您的任何信息，包括但不限于：您的姓名、邮寄地址、电子邮件地址和电话号码。您输入到服务中的任何文本或数据（不包括您发送给服务的提示，提示受服务条款第5节约束）（“输入”）中包含的个人数据也将被我们收集。我们不控制且不对大型语言模型（LLMs）如何处理您的输入或输出负责，包括其在模型训练中的使用。要了解您的输入如何被AI模型使用，请查阅相关提供商的条款。',
      },
      {
        t: 'p',
        text: '我们可能收集的个人数据类型包括但不限于：您主动提供的个人数据、自动收集的关于您使用我们网站或服务的信息，以及来自第三方（包括我们的业务合作伙伴）的信息。',
      },
      { t: 'h3', text: '您自愿提供的个人数据' },
      { t: 'p', text: '我们从您处收集的个人数据可能包括：' },
      {
        t: 'ul',
        items: [
          '通过填写我们网站或服务上的表格提供的信息，包括注册和创建账户时、使用服务时以及通过服务发送输入时提供的信息。我们也可能在您报告网站或服务问题时向您索取信息。',
          '您与我们的通信记录和副本（包括电子邮件地址），如果您联系我们。',
          '您可能被邀请完成的内部调查问卷的回答。',
          '您通过我们网站进行的交易详情及积分购买的履行情况。',
          '您在网站上的搜索查询。',
        ],
      },
      { t: 'h3', text: '自动收集的个人数据' },
      {
        t: 'p',
        text: '当您浏览和使用我们的网站或服务时，我们可能使用自动数据收集技术收集关于您的设备、浏览行为和模式的某些信息，包括：',
      },
      {
        t: 'ul',
        items: [
          '您访问我们网站的详细信息，包括但不限于流量数据、位置信息、日志文件，以了解服务性能，浏览历史、搜索、您点击的链接、浏览的页面及其他通信数据和您访问和使用的网站资源。',
          '关于您的计算机和互联网连接的信息，包括IP地址、操作系统和浏览器类型、时区设置及其他唯一的个人或在线标识符。',
          '关于您偏好的信息，以通过使用Cookie提升您对网站的使用体验。有关Cookie的更多信息，请参见“Cookie及其他跟踪技术”。',
        ],
      },
      { t: 'h3', text: 'Cookie及其他跟踪技术' },
      {
        t: 'p',
        text: '我们可能使用Cookie、嵌入脚本及其他类似的跟踪技术（“跟踪技术”）在您与网站互动时自动收集额外的个人数据，并个性化您的网站体验。这些技术帮助我们识别您，定制或个性化您的体验，向您推销额外的产品或服务，并分析服务的使用情况，以使其更安全、更有用。',
      },
      { t: 'h3', text: 'Cookie' },
      {
        t: 'p',
        text: 'Cookie是网站或其提供者通过您的网页浏览器传输到您设备硬盘上的小型网页文件，使网站或提供者的系统能够识别您的浏览器并记住某些信息。我们使用第一方和第三方Cookie，目的包括：使网站正常运行，改进网站和服务，简化登录（如记住您的用户ID），识别您返回网站时的身份，跟踪您与网站的互动，增强您对网站和服务的体验，记住您已提供的信息，收集您在第三方网站或其他在线服务上的活动信息，以便提供符合您兴趣的内容；并在您使用网站时提供安全的浏览体验。Cookie在您设备上的存留时间取决于其是“持久性”还是“会话”Cookie。会话Cookie仅在您浏览期间存在，浏览结束即删除。持久性Cookie则会一直保留，直到过期或被删除。',
      },
      { t: 'p', text: '我们网站使用的Cookie类型包括：' },
      {
        t: 'ul',
        items: [
          '严格必要的Cookie。这些Cookie是必需的，因为它们使您能够使用我们的网站。例如，严格必要的Cookie允许您访问网站的安全区域。没有这些Cookie，网站的某些功能无法提供。这类Cookie不用于营销目的，且不可禁用。',
          '功能性或偏好Cookie。我们使用功能性Cookie记住您的选择，以便为您提供增强功能和个性化内容。例如，这些Cookie可用于记住您的姓名或网站偏好。我们不使用功能性Cookie进行在线营销。虽然这些Cookie可以禁用，但可能导致网站功能受限。',
          '性能或分析Cookie。这些Cookie收集您如何使用网站的被动信息，包括您访问的网页和点击的链接。我们利用这些信息改进和优化网站和服务。我们不使用这些Cookie进行在线营销。您可以选择禁用这些Cookie。',
        ],
      },
      { t: 'h3', text: '更改您的Cookie设置' },
      {
        t: 'p',
        text: '您的浏览器可能允许您拒绝部分或全部浏览器Cookie。您也可以从浏览器中删除Cookie。您可以使用当前浏览网站的浏览器启用、禁用或删除Cookie。请注意，如果您禁用Cookie，可能无法访问网站的安全区域，且网站的其他部分可能无法正常工作。',
      },
      { t: 'h3', text: '分析及其他跟踪技术' },
      {
        t: 'p',
        text: '我们可能使用第三方服务提供商（下文定义）监控和分析网站使用情况。目前，我们使用Google Analytics。Google Analytics是Google LLC（“Google”）提供的网络分析服务，用于跟踪和报告网站流量。有关Google隐私实践的更多信息，请访问Google隐私与条款网页：https://policies.google.com/privacy?hl=zh-cn',
      },
      {
        t: 'p',
        text: 'Google Analytics退出浏览器插件允许访客阻止Google Analytics收集和使用其数据，下载地址：https://tools.google.com/dlpage/gaoptout',
      },
      {
        t: 'p',
        text: '我们还可能使用跟踪技术收集“点击流”数据，如为您提供互联网接入服务的域名、您的设备类型、用于连接互联网的IP地址、浏览器类型和版本、操作系统和平台、在网站上的平均停留时间、浏览的网页、搜索的内容、访问时间及其他相关统计数据，并为您访问网站所用设备或其他凭证分配唯一标识符，目的相同。收集点击流数据时，我们使用PostHog，一款网络和产品分析平台，可能还利用会话回放功能。',
      },
      {
        t: 'p',
        text: '我们网站的页面和电子邮件可能包含称为网页信标的小型电子文件（也称为透明GIF、像素标签和单像素GIF）及会话回放工具，允许我们跟踪购买和交易事件、与网站的互动、统计访问页面或打开邮件的用户数量及其他相关网站统计（例如记录某些网站内容的受欢迎程度，验证系统和服务器完整性）及监控用户行为。',
      },
      { t: 'h', text: '2. 我们如何使用您的个人数据' },
      {
        t: 'p',
        text: '我们仅按本隐私政策所述或在处理前向您披露的方式使用您的个人数据。我们可能使用您的个人数据的目的包括：',
      },
      {
        t: 'ul',
        items: [
          '提供服务。',
          '就您注册使用的网站或服务功能或功能的管理与您联系。',
          '向您发送有关账户的通知。',
          '通知您网站、政策、条款或通过网站提供的任何产品或服务的变更。',
          '向您发送营销和促销电子邮件。',
          '回应您的问题或其他请求。',
          '允许您参与网站和服务的互动功能。',
          '根据您的访问和使用情况，定制您在网站或服务上的体验。',
          '保存您的用户账户、注册和个人资料数据或其他个人数据（以免您每次访问或使用时重复输入）。',
          '跟踪您对网站和服务的回访和使用情况。',
          '汇总并报告与网站、服务及用户活动相关的统计信息。',
          '确定用户最喜欢的功能和服务，帮助我们运营、增强和改进网站。',
          '确保您在使用网站时的安全，需处理您的个人数据以防范垃圾邮件、恶意软件、恶意活动或安全风险。',
          '改进和执行我们的安全措施。',
          '维护法律和监管合规性。',
          '执行服务条款及其他政策的合规性。',
          '调查和解决争议。',
          '调查和防止欺诈、滥用及违反服务条款和其他政策、非法或犯罪活动、未经授权访问或使用个人数据或我们的系统和网络。',
          '保护您、他人及我们的业务。',
          '为您提供服务或其他相关产品和/或服务所需的任何其他目的，或在您提供个人数据前已披露给您的目的。',
        ],
      },
      { t: 'h3', text: '汇总和去标识信息' },
      {
        t: 'p',
        text: '我们可能以汇总或去标识的形式处理个人数据，以分析服务效果、研究用户行为，并与企业合作伙伴共享，包括以下方式：',
      },
      {
        t: 'ul',
        items: [
          '处理反馈时，将输入和输出与您的用户ID分离。',
          '创建分析报告并在网站上分享，如通过排行榜页面。我们将输入和输出与您的用户ID分离，并为每个输入分配主题类别。',
          '改进用户体验。我们可能分析和汇总一般用户行为和使用数据。此信息不识别个人用户。但为调试目的，我们可能重新识别存储的输入与您的用户ID。',
          '与企业合作伙伴共享。经您同意，我们可能以汇总、去标识形式披露输入，且这些输入与您的用户ID分离，作为与企业合作伙伴合同关系的一部分。',
        ],
      },
      { t: 'h', text: '3. 我们如何共享和披露您的个人数据' },
      { t: 'p', text: '我们可能在以下情况下共享或披露您的个人数据：' },
      {
        t: 'ul',
        items: [
          '网站服务提供商。我们可能雇佣其他公司和个人协助我们的网站和服务（“服务提供商”），代表我们提供服务，执行与服务相关的服务或协助我们分析服务的使用情况。',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    blocks: [
      { t: 'p', text: 'Last Updated: Apr 15, 2025' },
      {
        t: 'p',
        text: '{name} (“we”, “us” or “our”) respects your privacy and we are committed to protecting it through our compliance with this Privacy Policy. We have created this Privacy Policy to inform you of our policies regarding the collection, use and disclosure of personal data and the choices you have associated with that information. Capitalized terms used but not defined in this Privacy Policy have the meaning given to them in our Terms of Service. This Privacy Policy applies to all personal data collected through any written, electronic, or oral communications, as you:',
      },
      {
        t: 'ul',
        items: [
          'Access the website located at {name} and all corresponding webpages and websites that link to this Privacy Policy (the “Site”);',
          'Interact with applications on third party websites and services, if those applications include links to this Privacy Policy;',
          'Utilize our Service.',
        ],
      },
      {
        t: 'p',
        text: 'Before using our Site and Service, please carefully read our Terms of Service and this Privacy Policy. By using this Site or Service, you consent to the collection and use of your personal data in accordance with this Privacy Policy and our Terms of Service. If you do not feel comfortable with any part of this Privacy Policy or our Terms of Service, you should not use or access our Site or Service.',
      },
      {
        t: 'p',
        text: 'We may modify this Privacy Policy at any time, without prior notice, and changes may apply to any personal data we hold about you, as well as any new personal data collected after the Privacy Policy is modified. If we make changes, a revised Privacy Policy will be posted to our Site; the date of the last revision is included at the top of the page. We will provide individuals who create an account (“Users”) with advanced notice by email if we make any material changes to how we collect, use or disclose Users’ personal data or that impact Users’ rights under this Privacy Policy. Users are responsible for ensuring we have an up-to-date active and deliverable email address to reach them. Your continued use or revisitation of the Site or the Service following the posting or notice of a revised Privacy Policy means that you accept and agree to the changes. You are expected to check this page from time to time so you are aware of any changes, as they are binding on you.',
      },
      {
        t: 'p',
        text: 'We also may provide additional "just-in-time" disclosures or additional information about the data collection, use and sharing practices of our Service. Such notices may supplement or clarify our privacy practices or may provide you with additional choices about how we process your personal data.',
      },
      { t: 'h', text: '1. Collection of Personal Data' },
      {
        t: 'p',
        text: 'We collect personal data when you use our Site and our Service. Personal data is any information that relates to you, identifies you personally or could be used to identify you including, but not limited to: your name, mailing address, email address, and telephone number. Any text or data (excluding prompts you send to the Service, which are governed by section five of the Terms of Service) you input into the Service (“Inputs”) that include personal data will also be collected by us. We do not control, and are not responsible for, LLMs’ handling of your Inputs or Outputs, including for use in their model training. To understand how your Inputs are used by AI models, check the terms of the providers.',
      },
      {
        t: 'p',
        text: 'The types of personal data that we may collect include, but are not limited to: the personal data you provide to us, personal data collected automatically about your use of our Site or Service, and information from third parties, including our business partners.',
      },
      { t: 'h3', text: 'Personal Data You Voluntarily Provide to Us' },
      { t: 'p', text: 'The personal data we collect from you may include:' },
      {
        t: 'ul',
        items: [
          'Information that you provide by filling in forms on our Site or Service. This includes information provided at the time of or after registering and creating an account, using our Service, and sending Inputs through the Service. We may also ask you for information when you report a problem with our Site or Service.',
          'Records and copies of your correspondence (including email addresses), if you contact us.',
          'Your responses to surveys that we might ask you to complete for internal purposes.',
          'Details of transactions you carry out through our Site and of the fulfillment of Credits purchases.',
          'Your search queries on the Site.',
        ],
      },
      { t: 'h3', text: 'Personal Data Collected Automatically' },
      {
        t: 'p',
        text: 'As you navigate through and interact with our Site or Service, we may use automatic data collection technologies to collect certain information about your device, browsing actions and patterns, including:',
      },
      {
        t: 'ul',
        items: [
          'Details of your visits to our Site, including, but not limited to, traffic data, location data, log files to understand how our Service is performing, browser history, search, information about links you click, pages you view, and other communication data and the resources that you access and use on the Site.',
          'Information about your computer and internet connection, including your IP address, operating system and browser type, time zone setting, and other unique personal or online identifiers.',
          'Information about your preferences to make your use of the Site more productive, via the use of Cookies. For more information on Cookies, please see Cookies and Other Tracking Technology.',
        ],
      },
      { t: 'h3', text: 'Cookies and Other Tracking Technology' },
      {
        t: 'p',
        text: 'We may use cookies, embedded scripts, and other similar tracking technologies (“Tracking Technologies”) to collect additional personal data automatically as you interact with the Site and to personalize your experience with our Site. These technologies help us recognize you, customize or personalize your experience, market additional products or services to you, and analyze the use of our Service to make them safer and more useful to you.',
      },
      { t: 'h3', text: 'Cookies' },
      {
        t: 'p',
        text: 'Cookies are small web files that a site or its provider transfers to your device’s hard drive through your web browser that enables the site’s or provider’s system to recognize your browser and remember certain information. We use first-party and third-party cookies for the following purposes: to make our Site function properly, to improve our Site and Services, to make login to our Site or Service easier (such as by remembering your User ID), to recognize you when you return to our Site, to track your interaction with the Site, to enhance your experience with the Site and Service, to remember information you have already provided, to collect information about your activities over time and across third party websites or other online services in order to deliver content tailored to your interests; and to provide a secure browsing experience during your use of our Site. The length of time a cookie will stay on your browsing device depends on whether it is a "persistent" or "session" cookie. Session cookies will only stay on your device until you stop browsing. Persistent cookies stay on your browsing device until they expire or are deleted (i.e. after you have finished browsing).',
      },
      { t: 'p', text: 'The following types of cookies are used on our Site:' },
      {
        t: 'ul',
        items: [
          'Strictly Necessary Cookies. These cookies are essential because they enable you to use our Site. For example, strictly necessary cookies allow you to access secure areas on our Site. Without these cookies, some elements of our Site cannot be provided. These cookies do not gather information about you for marketing purposes. This category of cookies is essential for our Site to work and they cannot be disabled.',
          'Functional or Preference Cookies. We use functional cookies to remember your choices so we can tailor our Site to provide you with enhanced features and personalized content. For example, these cookies can be used to remember your name or preferences on our Site. We do not use functional cookies to target you with online marketing. While these cookies can be disabled, this may result in less functionality during your use of our Site.',
          'Performance or Analytic Cookies. These cookies collect passive information about how you use our Site, including webpages you visit and links you click. We use the information collected by such cookies to improve and optimize our Site and Services. We do not use these cookies to target you with online marketing. You may choose to disable these cookies.',
        ],
      },
      { t: 'h3', text: 'Changing Your Cookie Settings' },
      {
        t: 'p',
        text: 'Your browser may provide you with the option to refuse some or all browser cookies. You may also be able to remove cookies from your browser. You can use the browser with which you are viewing the Site to enable, disable or delete cookies. Please note, if you set your browser to disable cookies, you may not be able to access secure areas of the Site. Also, if you disable cookies other parts of the Site may not work properly.',
      },
      { t: 'h3', text: 'Analytics and Other Tracking Technologies' },
      {
        t: 'p',
        text: 'We may use third-party Service Providers (defined below) to monitor and analyze the use of our Site. Presently, we use Google Analytics. Google Analytics is a web analytics service offered by Google LLC (“Google”) that tracks and reports Site traffic. For more information on the privacy practices of Google, please visit the Google Privacy & Terms web page: https://policies.google.com/privacy?hl=en',
      },
      {
        t: 'p',
        text: 'Google Analytics Opt-out Browser Add-on provides visitors with the ability to prevent their data from being collected and used by Google Analytics, available at: https://tools.google.com/dlpage/gaoptout',
      },
      {
        t: 'p',
        text: 'We may also use Tracking Technologies to collect "clickstream" data, such as the domain name of the service providing you with Internet access, your device type, IP address used to connect your device to the Internet, your browser type and version, operating system and platform, the average time spent on our Site, webpages viewed, content searched for, access times and other relevant statistics, and assign unique identifiers to the device or other credentials you use to access the Site for the same purposes. In collecting clickstream data, we use PostHog, a web and products analytics platform that may also utilize session replay features.',
      },
      {
        t: 'p',
        text: 'Pages of our Site and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags and single-pixel gifs), and session replay tools that permit us, for example, to track purchase and transaction events, interaction with our Site, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of certain website content and verifying system and server integrity) and monitoring user behavior.',
      },
      { t: 'h', text: '2. How We Use Your Personal Data' },
      {
        t: 'p',
        text: 'We will only use your personal data as described in this Privacy Policy or as disclosed to you prior to such processing taking place. The purposes for which we may use your personal data include:',
      },
      {
        t: 'ul',
        items: [
          'Providing the Service.',
          'Contacting you regarding the administration of any features or functions of the Site or Service you have registered to use.',
          'Providing you with notices about your account.',
          'Notifying you about changes to our Site, our policies, terms or any products or Service we offer or provide through it.',
          'Sending you marketing and promotional emails.',
          'Responding to your questions or other requests.',
          'Allowing you to participate in the interactive features of the Site and Service.',
          'Tailoring your experience on the Site or Service and/or otherwise customizing what you see when you visit and use the Site or Service.',
          'Saving your user account, registration and profile data or other personal data (so you do not have to re-enter it each time you visit or use the Site or Service).',
          'Tracking your return visits to and use of the Site and Service.',
          'Accumulating and reporting aggregate, statistical information in connection with the Site and the Service and user activity.',
          'Determining which features and services users like best to help us operate, enhance and improve our Site.',
          'Keeping you secure and safe while using our Site, which requires us to process your personal data to combat spam, malware, malicious activities or security risks.',
          'Improving and enforcing our security measures.',
          'Maintaining legal and regulatory compliance.',
          'Enforcing compliance with our Terms of Service and other policies.',
          'Investigating and resolving disputes.',
          'Investigating and preventing fraud, abuse, and violations of our Terms of Service and other policies, unlawful or criminal activity, unauthorized access to or use of personal data or our systems and networks.',
          'Protecting you, others and our business.',
          'For any other purpose disclosed to you prior to you providing us your personal data or which are reasonably necessary to provide the Service or other related products and/or services requested.',
        ],
      },
      { t: 'h3', text: 'Aggregated and De-identified Information' },
      {
        t: 'p',
        text: 'We may process personal data in an aggregated or de-identified form to analyze the effectiveness of our Services, study user behavior, and to share with corporate partners, including in the following ways:',
      },
      {
        t: 'ul',
        items: [
          'To process Feedback. In doing so, we disassociate Inputs and Outputs from your user ID.',
          'To create analytics reports to share on our Site, such as through our Rankings page. We disassociate Inputs and Outputs from your user ID and assign a topic category to each Input.',
          'To improve the user experience. We may analyze and aggregate general user behavior and usage data. This information does not identify individual users. However, for purposes of de-bugging, we may re-identify your user ID with any stored Inputs.',
          'With corporate partners. With your consent, we may disclose Inputs in aggregated, de-identified form, where those Inputs are disassociated from your user ID, in connection with a contractual relationship with corporate partners.',
        ],
      },
      { t: 'h', text: '3. How We Share and Disclose Your Personal Data' },
      {
        t: 'p',
        text: 'We may share or disclose your personal data in the following circumstances:',
      },
      {
        t: 'ul',
        items: [
          'Website Service Providers. We may employ other companies and individuals to facilitate our Site and Service (“Service Providers”), provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used.',
        ],
      },
    ],
  },
};
