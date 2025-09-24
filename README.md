# Briefing de Logo - Formulário Interativo

Uma aplicação web moderna e clean para briefing de criação de logo que funciona como um formulário step-by-step (uma pergunta por vez).

## 🚀 Funcionalidades

### ✨ Interface Step-by-Step
- Uma pergunta por tela com transições suaves
- Botões "Próximo" e "Voltar" intuitivos
- Barra de progresso visual mostrando quantos passos faltam
- Design responsivo para desktop, tablet e mobile

### 📋 Perguntas do Briefing
**Dados Básicos:**
- Nome completo
- Email (com validação)
- Empresa/Marca
- Telefone (com máscara automática)

**Briefing do Logo:**
- Nome da empresa/marca
- Descrição da atividade da empresa
- Público-alvo
- Valores da empresa
- Preferências de cores
- Cores a evitar
- Estilo (minimalista, elaborado, meio termo)
- Tipo de logo (texto, símbolo, ou ambos)
- Referências e inspirações
- Onde será mais usado
- Observações adicionais

### 🎨 Design e Estilo
- **Paleta de cores clean:** Tons claros de cinza com acentos em vermelho
- **Tipografia moderna:** Fonte Inter do Google Fonts
- **Cards com sombra sutil** e cantos arredondados
- **Animações suaves** entre transições
- **Hover effects** nos botões e elementos interativos

### 💾 Funcionalidades Avançadas
- **Auto-save:** Progresso salvo automaticamente no localStorage
- **Validação em tempo real:** Campos obrigatórios e formatos específicos
- **Navegação por teclado:** Atalhos Ctrl+← e Ctrl+→, Enter para próximo
- **Resumo final:** Visualização de todas as respostas antes do envio
- **Integração com Google Forms:** Envio automático dos dados
- **Estados de loading e sucesso** com feedback visual

## 🛠️ Como Usar

### 1. Executar Localmente
```bash
# Opção 1: Servidor Python
python3 -m http.server 8000

# Opção 2: Servidor Node.js (se instalado)
npx serve .

# Opção 3: Extensão Live Server no VS Code
```

### 2. Acessar a Aplicação
Abra o navegador e acesse:
```
http://localhost:8000
```

### 3. Configurar Google Forms (Importante!)
Para que o envio funcione corretamente, você precisa:

1. **Criar um Google Form** com os campos correspondentes
2. **Obter os IDs dos campos** (entry.xxxxx)
3. **Atualizar o script.js** na seção `googleFormFields`:

```javascript
const googleFormFields = {
    'nomeCompleto': 'entry.123456789',     // Substitua pelos IDs reais
    'email': 'entry.987654321',
    'empresa': 'entry.456789123',
    // ... outros campos
};
```

**Como obter os IDs dos campos:**
1. Abra seu Google Form
2. Clique em "Visualizar formulário"
3. Abra as ferramentas do desenvolvedor (F12)
4. Inspecione cada campo e encontre o atributo `name="entry.xxxxx"`

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- **Desktop:** Layout completo com sidebar de progresso
- **Tablet:** Layout adaptado com elementos otimizados
- **Mobile:** Interface touch-friendly com navegação simplificada

## ♿ Acessibilidade

- **Navegação por teclado** completa
- **Foco visual** em todos os elementos interativos
- **Contraste alto** para melhor legibilidade
- **Suporte a motion reduced** para usuários sensíveis a animações
- **Labels apropriados** para leitores de tela

## 🔧 Personalização

### Cores
Edite o arquivo `styles.css` para alterar a paleta:
```css
:root {
    --primary-color: #dc3545;
    --background-color: #f8f9fa;
    --text-color: #343a40;
    --secondary-color: #6c757d;
}
```

### Perguntas
Para adicionar/remover perguntas:
1. Edite o HTML em `index.html`
2. Atualize o `fieldMapping` em `script.js`
3. Ajuste o `totalSteps` no JavaScript

### Estilo
Modifique `styles.css` para:
- Alterar fontes
- Ajustar espaçamentos
- Personalizar animações
- Modificar layout responsivo

## 📋 Estrutura de Arquivos

```
briefing-logo/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md           # Este arquivo
```

## 🚀 Deployment

### GitHub Pages
1. Faça upload dos arquivos para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch main
4. Acesse via `https://seuusuario.github.io/briefing-logo`

### Netlify
1. Arraste a pasta para o Netlify Deploy
2. Ou conecte com repositório GitHub
3. Deploy automático

### Vercel
```bash
npx vercel
```

## 🔄 Navegação por Teclado

- **Enter:** Próximo passo
- **Ctrl + →:** Próximo passo
- **Ctrl + ←:** Passo anterior
- **Tab:** Navegar entre elementos
- **Espaço:** Selecionar checkboxes/radio buttons

## 📊 Dados Coletados

O formulário coleta e organiza:
- Informações de contato
- Briefing detalhado do logo
- Preferências visuais
- Contexto de uso
- Observações específicas

Todos os dados são enviados automaticamente para o Google Form configurado e podem ser exportados para planilhas.

## 🐛 Troubleshooting

**Envio não funciona:**
- Verifique se os IDs do Google Form estão corretos
- Confirme se o formulário está público
- Teste em modo incógnito

**Layout quebrado:**
- Verifique se todos os arquivos CSS estão carregando
- Teste em diferentes navegadores
- Limpe o cache do navegador

**Progresso não salva:**
- Verifique se localStorage está habilitado
- Teste em modo normal (não incógnito)
- Verifique console para erros JavaScript

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Teste em modo incógnito
3. Confirme se todos os arquivos estão presentes
4. Valide a configuração do Google Forms

---

**Desenvolvido com ❤️ para uma melhor experiência de briefing de logos.**