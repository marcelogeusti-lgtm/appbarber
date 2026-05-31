const fs = require('fs');
const path = 'client/contexts/LanguageContext.js';
let content = fs.readFileSync(path, 'utf8');

const newTranslations = {
  pt: {
    terms: {
      title: 'Termos de Serviço',
      subtitle: 'Padrão SaaS Profissional • Atualizado em 19 de Abril de 2026',
      intro: 'Bem-vindo ao <strong className="text-white">NEXT</strong>. Estes Termos de Uso regem o acesso e a utilização da nossa plataforma de gestão por parte de estabelecimentos de beleza e barbearias. Ao utilizar o sistema, você confirma sua aceitação integral destes termos operados pela <strong className="text-white font-bold ml-1">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.',
      disclaimer_title: 'Dúvidas Jurídicas?',
      disclaimer_desc: 'Se você tiver dúvidas sobre estes termos, entre em contato com nossa equipe de compliance.',
      clause1_title: '1. Definições e Objeto',
      clause1_content: 'O sistema NEXT é uma plataforma de Software como Serviço (SaaS) que oferece ferramentas de gestão para estabelecimentos de beleza. Ao contratar o NEXT, o Estabelecimento adquire uma licença de uso limitada, não exclusiva e revogável, não ocorrendo qualquer transferência de propriedade intelectual do software ou seus códigos-fonte.',
      clause2_title: '2. Propriedade Intelectual',
      clause2_content: 'Todos os direitos de propriedade intelectual sobre o sistema NEXT, incluindo marcas, logotipos, designs, algoritmos e artes, pertencem exclusivamente à StarApp Sistemas LTDA ME. É terminantemente proibida qualquer tentativa de engenharia reversa, descompilação ou cópia de funcionalidades sem autorização prévia por escrito.',
      clause3_title: '3. Acordo de Processamento de Dados (DPA)',
      clause3_content: 'Em conformidade com a LGPD (Lei 13.709/2018):\\na) O **Estabelecimento** atuará como **Controlador** dos dados de seus clientes finais.\\nb) O **NEXT** atuará como **Operador**, processando os dados apenas para as finalidades de execução do serviço contratado.\\nc) O NEXT implementa medidas técnicas de segurança, mas a responsabilidade pela coleta lícita e consentimento dos clientes finais é inteiramente do Estabelecimento.',
      clause4_title: '4. Pagamentos e Recorrência',
      clause4_content: 'Os planos são operados em regime de pré-pagamento. A falta de quitação na data de vencimento resultará na suspensão imediata dos serviços após 48 horas de atraso. O cancelamento pode ser solicitado a qualquer momento pelo painel, porém não haverá reembolso de valores já pagos para o período corrente, dado que a licença já foi disponibilizada.',
      clause5_title: '5. Responsabilidade por Conteúdo',
      clause5_content: 'O Estabelecimento é o único responsável pelas informações, fotos e portfólio cadastrados em sua página no NEXT. O NEXT reserva-se o direito de remover qualquer conteúdo que infrinja direitos autorais de terceiros, contenha material impróprio ou viole as leis vigentes em território nacional.',
      clause6_title: '6. SLA e Disponibilidade',
      clause6_content: 'O NEXT busca manter uma disponibilidade (uptime) superior a 99,5%. Interrupções agendadas para manutenção serão comunicadas previamente. O NEXT não se responsabiliza por falhas decorrentes de instabilidades na internet do usuário, problemas em gateways de pagamento de terceiros ou serviços de nuvem externos.',
      clause7_title: '7. Suporte Técnico',
      clause7_content: 'O suporte é oferecido via chat online e e-mail em horário comercial brasileiro. O tempo médio de resposta para o primeiro contato é de 10 minutos para questões críticas. Sugestões de melhorias são registradas e priorizadas de acordo com o roadmap técnico da plataforma, sem garantia de implementação imediata.',
      clause8_title: '8. Rescisão e Portabilidade',
      clause8_content: 'Caso o contrato seja encerrado, o Estabelecimento tem o direito de solicitar a exportação de seus dados de clientes e histórico de agendamentos em formato padrão (CSV/JSON). Após 60 dias do encerramento definitivo da conta, o NEXT poderá excluir permanentemente os dados do banco de dados, exceto aqueles exigidos por lei.'
    },
    privacy: {
      title: 'Política de Privacidade',
      subtitle: 'Transparência e Segurança de Dados',
      intro: 'A sua privacidade é nossa prioridade no <strong className="text-white">NEXT</strong>. Coletamos, armazenamos e processamos seus dados e os dados dos seus clientes com os mais altos padrões de criptografia.',
      section1_title: 'Coleta de Dados',
      section1_content: 'Coletamos informações essenciais para a operação do sistema, como nome, e-mail, telefone e histórico de agendamentos.',
      section2_title: 'Uso das Informações',
      section2_content: 'As informações são utilizadas exclusivamente para viabilizar agendamentos, enviar notificações via WhatsApp e gerar relatórios financeiros para o estabelecimento.',
      section3_title: 'Compartilhamento',
      section3_content: 'O NEXT não vende ou compartilha dados com terceiros para fins de marketing. O compartilhamento ocorre apenas com provedores de infraestrutura (como gateways de pagamento e servidores cloud) necessários para a operação.',
      section4_title: 'Seus Direitos',
      section4_content: 'Você e seus clientes possuem o direito de solicitar acesso, correção ou exclusão dos dados pessoais armazenados na plataforma a qualquer momento.'
    },
    about: {
      title: 'Sobre Nós',
      subtitle: 'O Motor de Crescimento das Barbearias',
      mission_title: 'Nossa Missão',
      mission_content: 'Acabar de uma vez por todas com as cadeiras vazias. Nós desenvolvemos o NEXT porque acreditamos que barbearias não deveriam perder tempo com anotações de papel, clientes que faltam sem avisar ou fechamentos de caixa complicados.',
      vision_title: 'Visão de Império',
      vision_content: 'Cada detalhe foi pensado para transformar uma barbearia simples em um verdadeiro império. De agendamentos automáticos a links de checkout profissionais, entregamos a melhor experiência para você e para o seu cliente final.',
      contact_title: 'Fale Conosco',
      contact_content: 'Estamos prontos para ouvir você. Entre em contato através do nosso suporte oficial ou via e-mail corporativo.'
    }
  },
  en: {
    terms: {
      title: 'Terms of Service',
      subtitle: 'Professional SaaS Standard • Updated April 19, 2026',
      intro: 'Welcome to <strong className="text-white">NEXT</strong>. These Terms of Use govern the access and use of our management platform by beauty salons and barbershops. By using the system, you confirm your full acceptance of these terms operated by <strong className="text-white font-bold ml-1">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.',
      disclaimer_title: 'Legal Questions?',
      disclaimer_desc: 'If you have questions about these terms, please contact our compliance team.',
      clause1_title: '1. Definitions and Purpose',
      clause1_content: 'The NEXT system is a Software as a Service (SaaS) platform offering management tools for beauty establishments. By contracting NEXT, the Establishment acquires a limited, non-exclusive, and revocable license to use it, without any transfer of intellectual property of the software or its source codes.',
      clause2_title: '2. Intellectual Property',
      clause2_content: 'All intellectual property rights regarding the NEXT system, including brands, logos, designs, algorithms, and artwork, belong exclusively to StarApp Sistemas LTDA ME. Any attempt at reverse engineering, decompilation, or copying of features without prior written authorization is strictly prohibited.',
      clause3_title: '3. Data Processing Agreement (DPA)',
      clause3_content: 'In compliance with data protection laws:\\na) The **Establishment** will act as the **Controller** of their final customers data.\\nb) **NEXT** will act as the **Processor**, processing data only for the purposes of executing the contracted service.\\nc) NEXT implements technical security measures, but the responsibility for lawful collection and consent of final customers lies entirely with the Establishment.',
      clause4_title: '4. Payments and Billing',
      clause4_content: 'Plans operate on a prepaid basis. Failure to pay on the due date will result in immediate suspension of services after a 48-hour delay. Cancellation can be requested at any time via the dashboard; however, there will be no refunds for amounts already paid for the current period, given that the license was already made available.',
      clause5_title: '5. Content Responsibility',
      clause5_content: 'The Establishment is solely responsible for the information, photos, and portfolio registered on their page within NEXT. NEXT reserves the right to remove any content that infringes third-party copyrights, contains inappropriate material, or violates applicable local laws.',
      clause6_title: '6. SLA and Availability',
      clause6_content: 'NEXT aims to maintain an uptime greater than 99.5%. Scheduled interruptions for maintenance will be communicated in advance. NEXT is not responsible for failures resulting from user internet instability, third-party payment gateway issues, or external cloud services.',
      clause7_title: '7. Technical Support',
      clause7_content: 'Support is offered via online chat and email during standard business hours. The average response time for the first contact is 10 minutes for critical issues. Improvement suggestions are recorded and prioritized according to the platforms technical roadmap, with no guarantee of immediate implementation.',
      clause8_title: '8. Termination and Data Portability',
      clause8_content: 'If the contract is terminated, the Establishment has the right to request the export of their customer data and appointment history in a standard format (CSV/JSON). 60 days after the final closure of the account, NEXT may permanently delete the data from the database, except those required by law.'
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Transparency and Data Security',
      intro: 'Your privacy is our priority at <strong className="text-white">NEXT</strong>. We collect, store, and process your data and your customers data with the highest encryption standards.',
      section1_title: 'Data Collection',
      section1_content: 'We collect essential information for system operation, such as name, email, phone number, and appointment history.',
      section2_title: 'Use of Information',
      section2_content: 'Information is used exclusively to facilitate appointments, send WhatsApp notifications, and generate financial reports for the establishment.',
      section3_title: 'Data Sharing',
      section3_content: 'NEXT does not sell or share data with third parties for marketing purposes. Sharing only occurs with infrastructure providers (such as payment gateways and cloud servers) necessary for operation.',
      section4_title: 'Your Rights',
      section4_content: 'You and your customers have the right to request access, correction, or deletion of personal data stored on the platform at any time.'
    },
    about: {
      title: 'About Us',
      subtitle: 'The Growth Engine for Barbershops',
      mission_title: 'Our Mission',
      mission_content: 'To end empty chairs once and for all. We developed NEXT because we believe barbershops shouldn\'t waste time with paper notes, no-show clients, or complicated cash register closings.',
      vision_title: 'Vision of Empire',
      vision_content: 'Every detail was designed to transform a simple barbershop into a true empire. From automatic scheduling to professional checkout links, we deliver the best experience for you and your end client.',
      contact_title: 'Contact Us',
      contact_content: 'We are ready to listen to you. Get in touch through our official support or via corporate email.'
    }
  },
  es: {
    terms: {
      title: 'Términos de Servicio',
      subtitle: 'Estándar Profesional SaaS • Actualizado el 19 de Abril de 2026',
      intro: 'Bienvenido a <strong className="text-white">NEXT</strong>. Estos Términos de Uso rigen el acceso y la utilización de nuestra plataforma de gestión por parte de establecimientos de belleza y barberías. Al utilizar el sistema, usted confirma su aceptación íntegra de estos términos operados por <strong className="text-white font-bold ml-1">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.',
      disclaimer_title: '¿Dudas Legales?',
      disclaimer_desc: 'Si tiene preguntas sobre estos términos, comuníquese con nuestro equipo de cumplimiento.',
      clause1_title: '1. Definiciones y Objeto',
      clause1_content: 'El sistema NEXT es una plataforma de Software como Servicio (SaaS) que ofrece herramientas de gestión para establecimientos de belleza. Al contratar NEXT, el Establecimiento adquiere una licencia de uso limitada, no exclusiva y revocable, sin que se produzca ninguna transferencia de propiedad intelectual del software o sus códigos fuente.',
      clause2_title: '2. Propiedad Intelectual',
      clause2_content: 'Todos los derechos de propiedad intelectual sobre el sistema NEXT, incluyendo marcas, logotipos, diseños, algoritmos y artes, pertenecen exclusivamente a StarApp Sistemas LTDA ME. Queda terminantemente prohibida cualquier tentativa de ingeniería inversa, descompilación o copia de funcionalidades sin autorización previa por escrito.',
      clause3_title: '3. Acuerdo de Procesamiento de Datos (DPA)',
      clause3_content: 'En cumplimiento con las leyes de protección de datos:\\na) El **Establecimiento** actuará como **Controlador** de los datos de sus clientes finales.\\nb) **NEXT** actuará como **Operador**, procesando los datos solo para los fines de ejecución del servicio contratado.\\nc) NEXT implementa medidas técnicas de seguridad, pero la responsabilidad por la recopilación lícita y el consentimiento de los clientes finales recae enteramente en el Establecimiento.',
      clause4_title: '4. Pagos y Facturación',
      clause4_content: 'Los planes operan en régimen de prepago. La falta de pago en la fecha de vencimiento resultará en la suspensión inmediata de los servicios después de 48 horas de retraso. La cancelación se puede solicitar en cualquier momento a través del panel; sin embargo, no habrá reembolsos por los montos ya pagados correspondientes al período actual.',
      clause5_title: '5. Responsabilidad de Contenido',
      clause5_content: 'El Establecimiento es el único responsable de la información, fotos y portafolio registrados en su página dentro de NEXT. NEXT se reserva el derecho de eliminar cualquier contenido que infrinja los derechos de autor de terceros, contenga material inapropiado o viole las leyes vigentes.',
      clause6_title: '6. SLA y Disponibilidad',
      clause6_content: 'NEXT busca mantener una disponibilidad (uptime) superior al 99.5%. Las interrupciones programadas para mantenimiento serán comunicadas con antelación. NEXT no se responsabiliza por fallas derivadas de inestabilidades en el internet del usuario, problemas en pasarelas de pago de terceros o servicios en la nube externos.',
      clause7_title: '7. Soporte Técnico',
      clause7_content: 'El soporte se ofrece a través de chat en línea y correo electrónico en horario comercial. El tiempo promedio de respuesta para el primer contacto es de 10 minutos para problemas críticos. Las sugerencias de mejora se registran y priorizan según la hoja de ruta técnica de la plataforma, sin garantía de implementación inmediata.',
      clause8_title: '8. Rescisión y Portabilidad',
      clause8_content: 'En caso de finalizar el contrato, el Establecimiento tiene derecho a solicitar la exportación de los datos de sus clientes y el historial de citas en un formato estándar (CSV/JSON). Pasados 60 días del cierre definitivo de la cuenta, NEXT podrá eliminar permanentemente los datos de la base de datos, excepto aquellos requeridos por ley.'
    },
    privacy: {
      title: 'Política de Privacidad',
      subtitle: 'Transparencia y Seguridad de Datos',
      intro: 'Su privacidad es nuestra prioridad en <strong className="text-white">NEXT</strong>. Recopilamos, almacenamos y procesamos sus datos y los de sus clientes con los más altos estándares de cifrado.',
      section1_title: 'Recopilación de Datos',
      section1_content: 'Recopilamos información esencial para la operación del sistema, como nombre, correo electrónico, teléfono e historial de citas.',
      section2_title: 'Uso de la Información',
      section2_content: 'La información se utiliza exclusivamente para facilitar las citas, enviar notificaciones por WhatsApp y generar informes financieros para el establecimiento.',
      section3_title: 'Compartición de Datos',
      section3_content: 'NEXT no vende ni comparte datos con terceros con fines de marketing. La compartición solo ocurre con proveedores de infraestructura (como pasarelas de pago y servidores en la nube) necesarios para la operación.',
      section4_title: 'Tus Derechos',
      section4_content: 'Usted y sus clientes tienen derecho a solicitar el acceso, la corrección o la eliminación de los datos personales almacenados en la plataforma en cualquier momento.'
    },
    about: {
      title: 'Sobre Nosotros',
      subtitle: 'El Motor de Crecimiento para Barberías',
      mission_title: 'Nuestra Misión',
      mission_content: 'Terminar de una vez por todas con las sillas vacías. Desarrollamos NEXT porque creemos que las barberías no deberían perder tiempo con notas en papel, clientes que no asisten o cierres de caja complicados.',
      vision_title: 'Visión de Imperio',
      vision_content: 'Cada detalle fue diseñado para transformar una barbería simple en un verdadero imperio. Desde citas automáticas hasta enlaces de pago profesionales, ofrecemos la mejor experiencia para usted y su cliente final.',
      contact_title: 'Contáctanos',
      contact_content: 'Estamos listos para escucharte. Ponte en contacto a través de nuestro soporte oficial o mediante correo electrónico corporativo.'
    }
  }
};

['pt', 'en', 'es'].forEach(lang => {
  const marker = lang + ': {';
  const blockStart = content.indexOf(marker);
  
  // Find the end of this language block
  let blockEnd = -1;
  if (lang === 'pt') blockEnd = content.indexOf('en: {', blockStart);
  else if (lang === 'en') blockEnd = content.indexOf('es: {', blockStart);
  else blockEnd = content.lastIndexOf('};');
  
  if (blockEnd === -1) blockEnd = content.length;
  
  // Find the last closing brace before blockEnd belonging to this language block
  const insertPos = content.lastIndexOf('}', blockEnd);
  
  if (insertPos > -1) {
    const insertString = ',\\n' +
    '    "terms": ' + JSON.stringify(newTranslations[lang].terms, null, 4) + ',\\n' +
    '    "privacy": ' + JSON.stringify(newTranslations[lang].privacy, null, 4) + ',\\n' +
    '    "about": ' + JSON.stringify(newTranslations[lang].about, null, 4) + '\\n  ';
    content = content.slice(0, insertPos) + insertString + content.slice(insertPos);
  }
});

fs.writeFileSync(path, content, 'utf8');
console.log('Translations successfully injected.');
