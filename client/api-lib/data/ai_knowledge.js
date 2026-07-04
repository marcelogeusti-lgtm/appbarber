// Base de conhecimento do chat de suporte (módulo .js: o .vercelignore descarta *.json)
module.exports = {
  "system_info": {
    "name": "AppBarber Cloud",
    "role": "Sistema de Gestão para Barbearias e Salões",
    "tone": "Profissional, amigável, direto e prestativo"
  },
  "modules": {
    "agenda": {
      "title": "Gestão de Agenda",
      "context": "Visualização de horários, criação de agendamentos e controle de status.",
      "flows": [
        {
          "intent": "Como marcar um horário?",
          "steps": [
            "Acesse o menu 'Agenda' no painel lateral.",
            "Clique em um horário vago na grade do profissional desejado.",
            "Selecione o cliente (ou cadastre um novo na hora).",
            "Escolha o serviço e confirme os detalhes.",
            "Clique em 'Salvar Agendamento'."
          ]
        },
        {
          "intent": "Como cancelar um agendamento?",
          "steps": [
            "Localize o agendamento na grade da Agenda.",
            "Clique sobre ele para abrir os detalhes.",
            "Clique no botão 'Cancelar' ou mude o status para 'Cancelado'.",
            "Confirme a ação."
          ]
        }
      ]
    },
    "clientes": {
      "title": "Cadastro de Clientes",
      "context": "Gerenciamento de banco de dados de clientes, histórico e fidelidade.",
      "flows": [
        {
          "intent": "Como cadastrar um cliente?",
          "steps": [
            "Vá até o menu 'Clientes' no painel lateral.",
            "Clique no botão 'Novo Cliente' no canto superior.",
            "Preencha o Nome e o Telefone (obrigatórios para marketing/WhatsApp).",
            "Clique em 'Salvar'."
          ]
        },
        {
          "intent": "Como ver o histórico de um cliente?",
          "steps": [
            "Acesse o menu 'Clientes'.",
            "Pesquise pelo nome do cliente e clique nele.",
            "Navegue pela aba 'Histórico' para ver serviços passados e compras."
          ]
        }
      ]
    },
    "financeiro": {
      "title": "Financeiro e Comandas",
      "context": "Controle de faturamento, fechamento de caixa e emissão de notas.",
      "flows": [
        {
          "intent": "Como fechar uma comanda/venda?",
          "steps": [
            "Acesse 'Comandas' ou clique em um agendamento finalizado na agenda.",
            "Verifique os serviços e produtos adicionados.",
            "Selecione a forma de pagamento (Dinheiro, Cartão, PIX).",
            "Clique em 'Finalizar Venda' ou 'Concluir'."
          ]
        },
        {
          "intent": "Onde vejo meu faturamento de hoje?",
          "steps": [
            "No 'Dashboard' inicial, o primeiro card mostra o 'Faturamento Hoje'.",
            "Para detalhes, acesse o menu 'Financeiro' > 'Fluxo de Caixa'."
          ]
        }
      ]
    },
    "servicos": {
      "title": "Configuração de Serviços",
      "context": "Catálogo de cortes, barbas e tratamentos oferecidos.",
      "flows": [
        {
          "intent": "Como adicionar um novo corte ou serviço?",
          "steps": [
            "Vá em 'Ajustes' ou 'Serviços' no menu lateral.",
            "Clique em 'Adicionar Serviço'.",
            "Defina o Nome, Preço e a Duração estimada.",
            "Clique em 'Salvar'."
          ]
        }
      ]
    },
    "links": {
      "title": "Link de Agendamento Online",
      "context": "Link para clientes agendarem sozinhos via Instagram/WhatsApp.",
      "flows": [
        {
          "intent": "Onde pego meu link de agendamento?",
          "steps": [
            "No 'Dashboard' inicial, localize a aba 'Seu Link de Agendamento'.",
            "Clique no botão 'Copiar' para salvar o link.",
            "Cole este link na bio do seu Instagram."
          ]
        }
      ]
    }
  },
  "fallbacks": {
    "unknown": "Desculpe, ainda não aprendi sobre esse assunto específico. Gostaria que eu te conectasse com um consultor humano para te ajudar agora?",
    "error": "Tive um pequeno problema ao processar sua dúvida. Pode tentar perguntar de outra forma ou falar com nosso suporte?"
  }
};
