// Estado da aplicação
let currentStep = 0;
const totalSteps = 20;
let formData = {};

// Elementos DOM
const progressText = document.getElementById('progressText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Mapeamento dos campos
const fieldMapping = {
    0: null, // Tela de boas-vindas
    // SEÇÃO 1: DADOS PESSOAIS
    1: 'nomeCompleto',
    2: 'email',
    3: 'telefone',
    // SEÇÃO 2: INFORMAÇÕES DA MARCA
    4: 'empresa',
    5: 'tagLine',
    6: 'redesSociais',
    7: 'empresaFaz',
    8: 'diferencial',
    9: 'missaoMarca',
    // SEÇÃO 3: PÚBLICO-ALVO
    10: 'idadePublico',
    11: 'classeSocial',
    12: 'personalidadeMarca',
    13: 'infoadicionaisClientes',
    // SEÇÃO 4: DESIGN E PREFERÊNCIAS VISUAIS
    14: 'usoLogo',
    15: 'estilo',
    16: 'coresPreferencia',
    17: 'coresEvitar',
    18: 'referencias',
    19: 'observacoes'
};

// Labels para o resumo
const fieldLabels = {
    nomeCompleto: 'Nome completo',
    email: 'Email',
    empresa: 'Empresa/Marca',
    telefone: 'Telefone',
    empresaFaz: 'O que a empresa faz',
    idadePublico: 'Idade do público-alvo',
    personalidadeMarca: 'Personalidade da marca',
    coresPreferencia: 'Cores de preferência',
    coresEvitar: 'Cores a evitar',
    estilo: 'Estilo do logo',
    outrosEstiloDescricao: 'Descrição do estilo',
    tagLine: 'Tag Line da empresa',
    redesSociais: 'Redes sociais',
    diferencial: 'Diferencial do negócio',
    missaoMarca: 'Missão da marca',
    classeSocial: 'Classe social do público',
    infoadicionaisClientes: 'Informações adicionais sobre clientes',
    referencias: 'Referências/Inspirações',
    usoLogo: 'Onde será usado',
    observacoes: 'Observações adicionais'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateProgress();
    updateNavigation();
    addRequiredHints();
    
    // Adicionar máscara ao telefone
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });
    
    // Auto-save quando o usuário digita
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveProgress, 500));
        input.addEventListener('change', saveProgress);
    });
    
    // Adicionar event listeners para navegação por teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currentStep < totalSteps - 1) {
                nextStep();
            } else if (currentStep === totalSteps - 1) {
                generateSummary();
                nextStep();
            }
        }
        
        if (e.key === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            nextStep();
        }
        
        if (e.key === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            previousStep();
        }
    });
    
    // Event listener para mostrar/ocultar campo "Outros" e moodboard
    const outrosRadio = document.getElementById('outros');
    const outrosField = document.getElementById('outrosEstiloField');
    const moodboardShowcase = document.getElementById('moodboardShowcase');
    const showcaseTitle = document.getElementById('showcaseTitle');
    const showcaseDescription = document.getElementById('showcaseDescription');
    
    if (outrosRadio && outrosField && moodboardShowcase) {
        // Adicionar listeners para todos os radios do estilo
        const estiloRadios = document.querySelectorAll('input[name="estilo"]');
        estiloRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                // Mostrar/ocultar campo "Outros"
                if (this.value === 'outros') {
                    outrosField.style.display = 'block';
                    moodboardShowcase.style.display = 'none';
                } else {
                    outrosField.style.display = 'none';
                    // Limpar o campo quando não é "outros"
                    const outrosTextarea = document.getElementById('outrosEstiloDescricao');
                    if (outrosTextarea) {
                        outrosTextarea.value = '';
                    }
                    
                    // Mostrar moodboard correspondente
                    showMoodboard(this.value);
                }
            });
        });
    }
    
    // Função para mostrar o moodboard correspondente
    function showMoodboard(estilo) {
        const moodboardShowcase = document.getElementById('moodboardShowcase');
        const showcaseTitle = document.getElementById('showcaseTitle');
        const showcaseDescription = document.getElementById('showcaseDescription');
        
        // Ocultar todos os moodboards
        document.getElementById('minimalista-showcase').style.display = 'none';
        document.getElementById('elaborado-showcase').style.display = 'none';
        document.getElementById('medio-showcase').style.display = 'none';
        
        // Configurações para cada estilo
        const estiloConfig = {
            'minimalista': {
                title: 'Estilo Minimalista',
                description: 'Logos simples, clean e diretos ao ponto',
                showcaseId: 'minimalista-showcase'
            },
            'elaborado': {
                title: 'Estilo Elaborado',
                description: 'Logos detalhados e complexos com múltiplos elementos',
                showcaseId: 'elaborado-showcase'
            },
            'medio': {
                title: 'Estilo Meio Termo',
                description: 'Logos equilibrados entre simplicidade e detalhamento',
                showcaseId: 'medio-showcase'
            }
        };
        
        if (estiloConfig[estilo]) {
            const config = estiloConfig[estilo];
            showcaseTitle.textContent = config.title;
            showcaseDescription.textContent = config.description;
            document.getElementById(config.showcaseId).style.display = 'grid';
            moodboardShowcase.style.display = 'block';
        }
    }
    
    // Expor função globalmente para uso em outras partes do código
    window.showMoodboard = showMoodboard;
});

// Adiciona indicativos discretos de campos obrigatórios abaixo dos campos/grupos
function addRequiredHints() {
    // Remover qualquer marcador visual antigo (asterisco)
    document.querySelectorAll('span.required').forEach(el => el.remove());
    
    // Para inputs/textarea com atributo required
    document.querySelectorAll('input[required], textarea[required]').forEach(field => {
        const parent = field.closest('.input-group');
        if (!parent) return;
        if (!parent.querySelector('.required-hint')) {
            const hint = document.createElement('div');
            hint.className = 'required-hint';
            hint.textContent = 'Obrigatório';
            parent.appendChild(hint);
        }
    });
    
    // Hints para grupos obrigatórios (radios e checkboxes)
    const requiredRadioSteps = [10, 11, 12, 15];
    requiredRadioSteps.forEach(step => {
        const stepEl = document.querySelector(`.step[data-step="${step}"] .step-content`);
        if (!stepEl) return;
        const group = stepEl.querySelector('.radio-group, .radio-group-simple');
        if (group && !group.querySelector('.required-hint')) {
            const hint = document.createElement('div');
            hint.className = 'required-hint';
            hint.textContent = 'Obrigatório';
            group.appendChild(hint);
        }
    });
    
    // Hints para checkboxes obrigatórios (uso do logo - step 14)
    const checkboxStep = document.querySelector('.step[data-step="14"] .checkbox-group');
    if (checkboxStep && !checkboxStep.querySelector('.required-hint')) {
        const hint = document.createElement('div');
        hint.className = 'required-hint';
        hint.textContent = 'Obrigatório';
        checkboxStep.appendChild(hint);
    }
}

// Função para próximo passo
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    saveCurrentStep();
    
    if (currentStep < totalSteps - 1) {
        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        
        // Transição especial do welcome para step 1
        if (currentStep === 0) {
            // Animação especial de fade out para o welcome
            currentStepEl.classList.add('welcome-fade-out');
            
            setTimeout(() => {
                currentStepEl.classList.remove('active', 'welcome-fade-out');
                currentStep++;
                
                const nextStepEl = document.querySelector(`[data-step="${currentStep}"]`);
                nextStepEl.classList.add('form-fade-in');
                nextStepEl.classList.add('active');
                
                setTimeout(() => {
                    nextStepEl.classList.remove('form-fade-in');
                    // Adicionar classe para animações dos elementos internos
                    if (currentStep === 1) {
                        nextStepEl.classList.add('step-1-entrance');
                    }
                }, 50);
                
                updateProgress();
                updateNavigation();
                
                // Focar no primeiro input da nova etapa
                const firstInput = nextStepEl.querySelector('input, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 600); // Tempo maior para transição do welcome
        } else {
            // Animação normal para outros steps
            currentStepEl.classList.add('slide-out-left');
            
            setTimeout(() => {
                currentStepEl.classList.remove('active', 'slide-out-left');
                currentStep++;
                
                const nextStepEl = document.querySelector(`[data-step="${currentStep}"]`);
                nextStepEl.classList.add('slide-in-right');
                nextStepEl.classList.add('active');
                
                setTimeout(() => {
                    nextStepEl.classList.remove('slide-in-right');
                }, 50);
                
                updateProgress();
                updateNavigation();
                
                // Focar no primeiro input da nova etapa
                const firstInput = nextStepEl.querySelector('input, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 200);
        }
    } else if (currentStep === totalSteps - 1) {
        // Gerar resumo e ir para a última etapa
        generateSummary();
        
        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        currentStepEl.classList.add('slide-out-left');
        
        setTimeout(() => {
            currentStepEl.classList.remove('active', 'slide-out-left');
            currentStep++;
            
            const nextStepEl = document.querySelector(`[data-step="${currentStep}"]`);
            nextStepEl.classList.add('slide-in-right');
            nextStepEl.classList.add('active');
            
            setTimeout(() => {
                nextStepEl.classList.remove('slide-in-right');
            }, 50);
            
            updateProgress();
            updateNavigation();
        }, 200);
    }
}

// Função para passo anterior
function previousStep() {
    if (currentStep > 0) {
        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        currentStepEl.classList.add('slide-out-right');
        
        setTimeout(() => {
            currentStepEl.classList.remove('active', 'slide-out-right');
            currentStep--;
            
            const prevStepEl = document.querySelector(`[data-step="${currentStep}"]`);
            prevStepEl.classList.add('slide-in-left');
            prevStepEl.classList.add('active');
            
            setTimeout(() => {
                prevStepEl.classList.remove('slide-in-left');
            }, 50);
            
            updateProgress();
            updateNavigation();
            
            // Focar no primeiro input da etapa anterior
            const firstInput = prevStepEl.querySelector('input, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 200);
    }
}

// Validação do passo atual
function validateCurrentStep() {
    // Tela de boas-vindas não precisa validação
    if (currentStep === 0) {
        return true;
    }
    
    const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
    
    if (currentStep <= 19) {
        const fieldName = fieldMapping[currentStep];
        
        if (fieldName === 'idadePublico' || fieldName === 'personalidadeMarca' || fieldName === 'estilo' || fieldName === 'classeSocial') {
            // Validar radio buttons
            const radioButtons = currentStepEl.querySelectorAll('input[type="radio"]');
            const isChecked = Array.from(radioButtons).some(radio => radio.checked);
            
            if (!isChecked && (currentStep === 10 || currentStep === 11 || currentStep === 12 || currentStep === 15)) {
                showValidationError('Por favor, selecione uma opção.');
                return false;
            }
        } else if (fieldName === 'usoLogo') {
            // Validar checkboxes
            const checkboxes = currentStepEl.querySelectorAll('input[type="checkbox"]');
            const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            
            if (!isChecked && currentStep === 14) {
                showValidationError('Por favor, selecione ao menos uma opção.');
                return false;
            }
        } else {
            // Validar campos de texto obrigatórios
            const field = document.getElementById(fieldName);
            
            if (field && field.hasAttribute('required')) {
                const value = field.value.trim();
                
                if (!value) {
                    showValidationError('Este campo é obrigatório.');
                    field.focus();
                    return false;
                }
                
                // Validação específica de email
                if (fieldName === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        showValidationError('Por favor, insira um email válido.');
                        field.focus();
                        return false;
                    }
                }
                
                // Validação específica de telefone
                if (fieldName === 'telefone') {
                    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
                    if (!phoneRegex.test(value)) {
                        showValidationError('Por favor, insira um telefone válido no formato (00) 00000-0000.');
                        field.focus();
                        return false;
                    }
                }
            }
        }
    }
    
    return true;
}

// Mostrar erro de validação
function showValidationError(message) {
    // Remove erro anterior se existir
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        color: #dc3545;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        padding: 12px 16px;
        margin-top: 16px;
        font-size: 0.9rem;
        animation: fadeIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    const currentStepEl = document.querySelector(`[data-step="${currentStep}"] .step-content`);
    currentStepEl.appendChild(errorDiv);
    
    // Remove o erro após 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Salvar dados do passo atual
function saveCurrentStep() {
    // Pular tela de boas-vindas
    if (currentStep === 0) {
        return;
    }
    
    if (currentStep <= 19) {
        const fieldName = fieldMapping[currentStep];
        
        if (fieldName === 'idadePublico' || fieldName === 'personalidadeMarca' || fieldName === 'estilo' || fieldName === 'classeSocial') {
            // Salvar radio button
            const selectedRadio = document.querySelector(`input[name="${fieldName}"]:checked`);
            if (selectedRadio) {
                formData[fieldName] = selectedRadio.value;
                
                // Se for "outros" no estilo, salvar também a descrição
                if (fieldName === 'estilo' && selectedRadio.value === 'outros') {
                    const outrosDescricao = document.getElementById('outrosEstiloDescricao');
                    if (outrosDescricao) {
                        formData['outrosEstiloDescricao'] = outrosDescricao.value.trim();
                    }
                } else if (fieldName === 'estilo') {
                    // Limpar descrição se não for "outros"
                    delete formData['outrosEstiloDescricao'];
                }
            }
        } else if (fieldName === 'usoLogo') {
            // Salvar checkboxes
            const selectedCheckboxes = document.querySelectorAll('input[name="usoLogo"]:checked');
            formData[fieldName] = Array.from(selectedCheckboxes).map(cb => cb.value);
        } else {
            // Salvar campo de texto
            const field = document.getElementById(fieldName);
            if (field) {
                formData[fieldName] = field.value.trim();
            }
        }
    }
    
    saveProgress();
}

// Atualizar barra de progresso
function updateProgress() {
    if (currentStep === 0 || currentStep === totalSteps) {
        progressText.textContent = '';
    } else {
        progressText.textContent = `Passo ${currentStep} de ${totalSteps - 1}`;
    }
}

// Atualizar navegação
function updateNavigation() {
    prevBtn.style.display = currentStep > 0 ? 'block' : 'none';
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        // Ocultar sidebar no modo de revisão final
        document.body.classList.add('summary-mode');
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        // Garantir que o modo de revisão esteja desativado fora do último passo
        document.body.classList.remove('summary-mode');
    }
    
    // Esconder botão padrão no step 0 e mostrar botão customizado
    if (currentStep === 0) {
        nextBtn.style.display = 'none';
        // Adicionar classe para esconder sidebar no welcome
        document.body.classList.add('welcome-mode');
    } else {
        nextBtn.textContent = 'Próximo';
        nextBtn.style.display = 'block';
        // Remover classe welcome-mode
        document.body.classList.remove('welcome-mode');
    }
}

// Gerar resumo
function generateSummary() {
    const summaryEl = document.getElementById('summary');
    let summaryHTML = '';
    
    Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== '') {
            const label = fieldLabels[key] || key;
            let value = formData[key];
            
            // Formatação especial para arrays (checkboxes)
            if (Array.isArray(value)) {
                value = value.join(', ');
            }
            
            // Formatação especial para campos específicos
            if (key === 'idadePublico') {
                const ageLabels = {
                    '0-12': '0 a 12 anos',
                    '13-17': '13 a 17 anos',
                    '18-24': '18 a 24 anos',
                    '25-34': '25 a 34 anos',
                    '35-44': '35 a 44 anos',
                    '45-54': '45 a 54 anos',
                    '55+': '55+ anos'
                };
                value = ageLabels[value] || value;
            }
            
            if (key === 'personalidadeMarca') {
                const personalityLabels = {
                    'jovem-divertida-energica': 'Jovem, Divertida, Energética',
                    'confiavel-solida-tradicional': 'Confiável, Sólida, Tradicional',
                    'sofisticada-elegante-exclusiva': 'Sofisticada, Elegante, Exclusiva',
                    'inovadora-tecnologica-moderna': 'Inovadora, Tecnológica, Moderna',
                    'calorosa-amigavel-acessivel': 'Calorosa, Amigável, Acessível',
                    'aventureira-corajosa-ousada': 'Aventureira, Corajosa, Ousada'
                };
                value = personalityLabels[value] || value;
            }
            
            if (key === 'estilo') {
                const styleLabels = {
                    'minimalista': 'Minimalista',
                    'elaborado': 'Elaborado',
                    'medio': 'Meio termo',
                    'outros': 'Outros'
                };
                value = styleLabels[value] || value;
            }
            
            if (key === 'classeSocial') {
                const classLabels = {
                    'classe-a': 'Classe A (Alta renda)',
                    'classe-b': 'Classe B (Média-alta renda)',
                    'classe-c': 'Classe C (Média renda)',
                    'classe-d': 'Classe D (Média-baixa renda)',
                    'classe-e': 'Classe E (Baixa renda)'
                };
                value = classLabels[value] || value;
            }
            
            summaryHTML += `
                <div class="summary-item">
                    <span class="summary-label">${label}:</span>
                    <div class="summary-value">${value}</div>
                </div>
            `;
        }
    });
    
    summaryEl.innerHTML = summaryHTML;
}

// Enviar formulário
async function submitForm() {
    const loadingEl = document.getElementById('loading');
    const successEl = document.getElementById('success');
    const summaryEl = document.getElementById('summary');
    
    // Mostrar loading
    summaryEl.style.display = 'none';
    loadingEl.style.display = 'block';
    submitBtn.disabled = true;
    
    // Ocultar título e descrição da revisão final
    const stepContent = document.querySelector('[data-step="20"] .step-content');
    const title = stepContent.querySelector('h2');
    const description = stepContent.querySelector('p');
    if (title) title.style.display = 'none';
    if (description) description.style.display = 'none';
    
    // Aplicar modo welcome durante loading
    const nav = document.querySelector('.navigation');
    if (nav) nav.style.display = 'none';
    document.body.classList.add('welcome-mode');
    
    try {
        // Preparar dados para envio ao Google Form
        const formDataToSend = new FormData();
        
        // Mapeamento dos campos para o Google Form (esses IDs precisam ser ajustados conforme o form real)
        const googleFormFields = {
            'nomeCompleto': 'entry.2104594537',
            'email': 'entry.1166833311',
            'telefone': 'entry.1911742208',
            'empresa': 'entry.114066224',
            'tagLine': 'entry.248100964',
            'redesSociais': 'entry.858950515',
            'empresaFaz': 'entry.1880218059',
            'diferencial': 'entry.130396930',
            'missaoMarca': 'entry.1549429799',
            'idadePublico': 'entry.1968232378',
            'classeSocial': 'entry.542862014',
            'personalidadeMarca': 'entry.1402600420',
            'infoadicionaisClientes': 'entry.222482106',
            'usoLogo': 'entry.179576154',
            'estilo': 'entry.561140542',
            'coresPreferencia': 'entry.1746167561',
            'coresEvitar': 'entry.1546138105',
            'referencias': 'entry.815959380',
            'observacoes': 'entry.155460107'
        };
        
        // Preencher dados do formulário
        Object.keys(formData).forEach(key => {
            const googleFieldId = googleFormFields[key];
            if (googleFieldId && formData[key]) {
                let value = formData[key];
                if (Array.isArray(value)) {
                    value = value.join(', ');
                }
                formDataToSend.append(googleFieldId, value);
            }
        });
        
        // Simular envio para o Google Forms (substitua pela URL real do seu formulário)
        const response = await fetch('https://docs.google.com/forms/d/e/1FAIpQLScIDdQTXjxGhq368hiDne04Ng8jMpzAscfES27ABi6AiJmFow/formResponse', {
            method: 'POST',
            body: formDataToSend,
            mode: 'no-cors' // Necessário para Google Forms
        });
        
        // Como usamos no-cors, sempre consideramos sucesso
        setTimeout(() => {
            loadingEl.style.display = 'none';
            successEl.style.display = 'block';
            
            // Limpar dados salvos
            localStorage.removeItem('briefing-logo-progress');
            localStorage.removeItem('briefing-logo-step');
            
            // Aplicar modo welcome para layout limpo
            const nav = document.querySelector('.navigation');
            if (nav) nav.style.display = 'none';
            document.body.classList.add('welcome-mode');
            
            // Opcional: Gerar PDF do resumo
            // generatePDF();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        
        // Em caso de erro, mostrar mensagem de sucesso mesmo assim
        // pois o Google Forms em no-cors mode sempre dá erro
        setTimeout(() => {
            loadingEl.style.display = 'none';
            successEl.style.display = 'block';
            
            // Limpar dados salvos
            localStorage.removeItem('briefing-logo-progress');
            localStorage.removeItem('briefing-logo-step');
            const nav = document.querySelector('.navigation');
            if (nav) nav.style.display = 'none';
            document.body.classList.add('welcome-mode');
        }, 2000);
    }
}

// Salvar progresso no localStorage
function saveProgress() {
    localStorage.setItem('briefing-logo-progress', JSON.stringify(formData));
    localStorage.setItem('briefing-logo-step', currentStep.toString());
}

// Carregar progresso do localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('briefing-logo-progress');
    const savedStep = localStorage.getItem('briefing-logo-step');
    
    if (savedProgress) {
        formData = JSON.parse(savedProgress);
        
        // Preencher campos com dados salvos
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            
            if (key === 'idadePublico' || key === 'personalidadeMarca' || key === 'estilo' || key === 'classeSocial') {
                // Restaurar radio buttons
                const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    
                    // Se for "outros" no estilo, mostrar o campo
                    if (key === 'estilo' && value === 'outros') {
                        const outrosField = document.getElementById('outrosEstiloField');
                        if (outrosField) {
                            outrosField.style.display = 'block';
                        }
                    } else if (key === 'estilo' && value !== 'outros') {
                        // Mostrar moodboard se não for "outros"
                        if (window.showMoodboard) {
                            window.showMoodboard(value);
                        }
                    }
                }
            } else if (key === 'usoLogo' && Array.isArray(value)) {
                // Restaurar checkboxes
                value.forEach(val => {
                    const checkbox = document.querySelector(`input[name="usoLogo"][value="${val}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            } else {
                // Restaurar campos de texto
                const field = document.getElementById(key);
                if (field) {
                    field.value = value;
                }
            }
        });
    }
    
    if (savedStep) {
        const step = parseInt(savedStep);
        if (step > 1 && step <= totalSteps) {
            // Ir para o passo salvo
            document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
            currentStep = step;
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            
            if (currentStep === totalSteps) {
                generateSummary();
            }
        }
    }
}

// Função debounce para otimizar auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para gerar PDF (opcional - requer biblioteca externa)
function generatePDF() {
    // Esta função pode ser implementada usando bibliotecas como jsPDF
    // Por enquanto, apenas log dos dados
    console.log('Dados do briefing:', formData);
}

// Ações da tela de sucesso
function restartBriefing() {
    window.location.reload();
}

function downloadSummary() {
    const summaryEl = document.getElementById('summary');
    if (!summaryEl) return;
    const blob = new Blob([`<html><head><meta charset="utf-8"><title>Resumo do Briefing</title></head><body>${summaryEl.innerHTML}</body></html>`], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'briefing-resumo.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Adicionar estilos para animações de transição via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .slide-out-right {
        transform: translateX(30px) !important;
        opacity: 0 !important;
    }
    
    .slide-in-left {
        transform: translateX(-30px) !important;
        opacity: 0 !important;
    }
`;
document.head.appendChild(style);