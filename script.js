// ============================================
// SISTEMA DE COTAÇÃO SOS BALANÇAS
// MODELO IDÊNTICO AO WORD GRASCON
// ============================================

// CATÁLOGO DE PRODUTOS COM IMAGENS (você pode adicionar mais)
const CATALOGO = [
    {
        codigo: '2521',
        descricao: 'BALANÇA MARCA RAMUZA -- MODELO DP50P TIPO PADEIRO -- AÇO CARBONO - COM COLUNA',
        imagem: 'https://via.placeholder.com/200x200/0066CC/FFFFFF?text=Balança+2521',
        especificacoes: [
            'Capacidade: 50kg',
            'Divisão: 10g',
            'Plataforma Aço Carbono 33x28cm',
            'Com Certificado de Calibração Rastreável À RBC'
        ],
        preco: 990.00
    },
    {
        codigo: '6758',
        descricao: 'BALANÇA MARCA UPX - MODELO BLUE UL -- COM BATERIA',
        imagem: 'https://via.placeholder.com/200x150/2E7D32/FFFFFF?text=Balança+6758',
        especificacoes: [
            'Capacidade: 150kg',
            'Divisão: 20g de 0 a 60kg / 50g de 61 a 150kg',
            'Plataforma Aço Inox 45x60cm',
            'Com Certificado de Calibração Rastreável À RBC'
        ],
        preco: 1590.00
    }
];

// VARIÁVEIS GLOBAIS
let cotacaoItens = [];
let totalGeral = 0;

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema SOS Balanças iniciado');
    
    // Carregar catálogo
    carregarCatalogo();
    
    // Configurar formatação automática
    configurarFormatacao();
    
    // Inicializar preview
    atualizarPreview();
});

// ============================================
// 1. FUNÇÕES DO CATÁLOGO
// ============================================

function carregarCatalogo() {
    const select = document.getElementById('produtoSelect');
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    
    CATALOGO.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.codigo;
        option.textContent = `[${produto.codigo}] ${produto.descricao.substring(0, 50)}...`;
        option.dataset.produto = JSON.stringify(produto);
        select.appendChild(option);
    });
    
    mostrarMensagem(`✅ ${CATALOGO.length} produtos carregados`, 'success');
}

function previewProduto() {
    const select = document.getElementById('produtoSelect');
    const previewDiv = document.getElementById('produtoPreview');
    
    if (select.value) {
        const produto = JSON.parse(select.options[select.selectedIndex].dataset.produto);
        
        document.getElementById('previewImagem').src = produto.imagem;
        document.getElementById('previewNome').textContent = produto.descricao;
        document.getElementById('previewEspecificacoes').textContent = produto.especificacoes.join(' | ');
        document.getElementById('previewPreco').textContent = `R$ ${produto.preco.toFixed(2)}`;
        
        previewDiv.classList.remove('hidden');
    } else {
        previewDiv.classList.add('hidden');
    }
}

function adicionarProduto() {
    const select = document.getElementById('produtoSelect');
    if (!select.value) {
        alert('Selecione um produto primeiro!');
        return;
    }
    
    const produto = JSON.parse(select.options[select.selectedIndex].dataset.produto);
    
    // Verificar se já existe
    if (cotacaoItens.some(item => item.codigo === produto.codigo)) {
        alert('Este produto já está na cotação!');
        return;
    }
    
    // Adicionar ao array
    cotacaoItens.push({
        ...produto,
        quantidade: 1,
        total: produto.preco
    });
    
    // Atualizar interface
    atualizarItensInterface();
    calcularTotal();
    atualizarPreview();
    
    // Resetar seleção
    select.selectedIndex = 0;
    document.getElementById('produtoPreview').classList.add('hidden');
    
    mostrarMensagem(`✅ ${produto.descricao.substring(0, 30)}... adicionado`, 'success');
}

function atualizarItensInterface() {
    const container = document.getElementById('itensContainer');
    container.innerHTML = '';
    
    cotacaoItens.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-cotacao';
        itemDiv.innerHTML = `
            <img src="${item.imagem}" class="item-imagem" alt="${item.codigo}">
            <div class="item-info">
                <div class="item-codigo">Código: ${item.codigo}</div>
                <div class="item-descricao">${item.descricao}</div>
                <div class="item-especificacoes">
                    <small>${item.especificacoes.join(' | ')}</small>
                </div>
            </div>
            <div class="item-controles">
                <div>
                    <label>Qtd:</label>
                    <input type="number" class="item-quantidade" 
                           value="${item.quantidade}" min="1"
                           onchange="atualizarQuantidade(${index}, this.value)">
                </div>
                <div class="item-total">R$ ${item.total.toFixed(2)}</div>
                <button onclick="removerItem(${index})" class="btn btn-danger btn-sm">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

function atualizarQuantidade(index, novaQuantidade) {
    const qtd = parseInt(novaQuantidade) || 1;
    cotacaoItens[index].quantidade = qtd;
    cotacaoItens[index].total = cotacaoItens[index].preco * qtd;
    
    atualizarItensInterface();
    calcularTotal();
    atualizarPreview();
}

function removerItem(index) {
    if (confirm('Remover este item da cotação?')) {
        cotacaoItens.splice(index, 1);
        atualizarItensInterface();
        calcularTotal();
        atualizarPreview();
    }
}

function calcularTotal() {
    totalGeral = cotacaoItens.reduce((total, item) => total + item.total, 0);
    document.getElementById('totalGeral').textContent = `R$ ${totalGeral.toFixed(2)}`;
}

// ============================================
// 2. CONSULTA CNPJ
// ============================================

async function consultarCNPJ() {
    const cnpjInput = document.getElementById('cnpjConsulta');
    let cnpj = cnpjInput.value.replace(/\D/g, '');
    
    if (cnpj.length !== 14) {
        alert('CNPJ inválido! Digite 14 números.');
        return;
    }
    
    try {
        // Formatar CNPJ para exibição
        const cnpjFormatado = cnpj.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, 
            '$1.$2.$3/$4-$5'
        );
        
        // Mostrar carregamento
        const botao = document.querySelector('button[onclick="consultarCNPJ()"]');
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="bi bi-hourglass-split"></i> Consultando...';
        botao.disabled = true;
        
        // Consultar API
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        
        if (!response.ok) {
            throw new Error('CNPJ não encontrado');
        }
        
        const empresa = await response.json();
        
        // Preencher campos
        document.getElementById('razaoSocial').value = empresa.razao_social || '';
        document.getElementById('cnpj').value = empresa.cnpj || cnpjFormatado;
        document.getElementById('contato').value = '';
        document.getElementById('telefone').value = empresa.ddd_telefone_1 || '';
        document.getElementById('email').value = '';
        document.getElementById('endereco').value = 
            `${empresa.logradouro || ''} ${empresa.numero || ''}, ${empresa.bairro || ''} - ${empresa.municipio || ''}/${empresa.uf || ''}`;
        
        // Restaurar botão
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
        
        mostrarMensagem(`✅ Dados da empresa carregados: ${empresa.razao_social}`, 'success');
        atualizarPreview();
        
    } catch (error) {
        console.error('Erro na consulta:', error);
        
        const botao = document.querySelector('button[onclick="consultarCNPJ()"]');
        botao.innerHTML = '<i class="bi bi-search"></i> Consultar';
        botao.disabled = false;
        
        mostrarMensagem('⚠️ CNPJ não encontrado. Preencha os dados manualmente.', 'warning');
        
        // Preencher apenas o CNPJ formatado
        const cnpjFormatado = cnpj.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, 
            '$1.$2.$3/$4-$5'
        );
        document.getElementById('cnpj').value = cnpjFormatado;
    }
}

// ============================================
// 3. GERAR COTAÇÃO NO MODELO WORD
// ============================================

function atualizarPreview() {
    const previewDiv = document.getElementById('cotacaoPreview');
    
    if (!previewDiv) return;
    
    // Coletar dados do formulário
    const dados = {
        empresa: document.getElementById('razaoSocial').value || 'NÃO INFORMADO',
        cnpj: document.getElementById('cnpj').value || 'NÃO INFORMADO',
        contato: document.getElementById('contato').value || 'NÃO INFORMADO',
        email: document.getElementById('email').value || 'NÃO INFORMADO',
        telefone: document.getElementById('telefone').value || 'NÃO INFORMADO',
        endereco: document.getElementById('endereco').value || 'NÃO INFORMADO',
        itens: cotacaoItens,
        total: totalGeral,
        pagamento: document.getElementById('pagamento').value,
        prazo: document.getElementById('prazo').value,
        frete: document.getElementById('frete').value,
        garantia: document.getElementById('garantia').value,
        disponibilidade: document.getElementById('disponibilidade').value,
        validade: document.getElementById('validade').value,
        data: new Date().toLocaleDateString('pt-BR'),
        numeroCotacao: 'COT-' + Date.now().toString().substring(8)
    };
    
    // Gerar HTML do preview
    previewDiv.innerHTML = gerarTemplateCotacao(dados);
}

function gerarTemplateCotacao(dados) {
    return `
        <div class="cotacao-template">
            <!-- Cabeçalho -->
            <div class="cabecalho-cotacao">
                <h1>SOS BALANÇAS</h1>
                <p class="cnpj">CNPJ: 34.721.020/0001-73</p>
                <p> E-mail: contato@sosbalanca.com.br | Telefone: (11) 2082-0328</p>
            </div>
            
            <!-- Dados do Cliente -->
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; background: #f0f0f0; width: 30%;"><strong>Empresa:</strong></td>
                    <td style="padding: 8px;">${dados.empresa}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>CNPJ:</strong></td>
                    <td style="padding: 8px;">${dados.cnpj}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>Contato:</strong></td>
                    <td style="padding: 8px;">${dados.contato}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>E-mail:</strong></td>
                    <td style="padding: 8px;">${dados.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>Telefone:</strong></td>
                    <td style="padding: 8px;">${dados.telefone}</td>
                </tr>
            </table>
            
            <!-- Itens da Cotação -->
            ${dados.itens.map((item, index) => `
                <div style="margin-bottom: 25px; page-break-inside: avoid;">
                    <h3 style="color: #0066cc; margin-bottom: 10px;">Item ${(index + 1).toString().padStart(2, '0')}</h3>
                    <table class="tabela-word">
                        <tr>
                            <th class="col-descricao">Descrição</th>
                            <th class="col-imagem">Imagem do Produto</th>
                            <th class="col-valores">Valores</th>
                        </tr>
                        <tr>
                            <td style="vertical-align: top;">
                                <strong>${item.descricao}</strong><br><br>
                                <strong>CÓDIGO: ${item.codigo}</strong><br>
                                ${item.especificacoes.map(spec => `• ${spec}<br>`).join('')}
                                <br>
                                <em>Obs.: Concedemos Certificado de Calibração Rastreável À RBC - (Serviço realizado em nossas Dependências)</em>
                            </td>
                            <td style="text-align: center; vertical-align: middle;">
                                <img src="${item.imagem}" class="imagem-produto" alt="${item.codigo}">
                            </td>
                            <td style="vertical-align: middle; text-align: right;">
                                <table style="width: 100%;">
                                    <tr>
                                        <td><strong>VALOR UNITÁRIO:</strong></td>
                                        <td style="text-align: right;">R$ ${item.preco.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>QUANTIDADE:</strong></td>
                                        <td style="text-align: right;">${item.quantidade.toString().padStart(2, '0')}</td>
                                    </tr>
                                    <tr style="border-top: 2px solid #000;">
                                        <td><strong>VALOR TOTAL:</strong></td>
                                        <td style="text-align: right; font-weight: bold;">R$ ${item.total.toFixed(2)}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            `).join('')}
            
            <!-- Total Geral -->
            <div style="text-align: right; margin: 30px 0; padding: 15px; background: #f8f9fa; border-radius: 4px;">
                <h2 style="color: #2c3e50;">TOTAL DA COTAÇÃO: R$ ${dados.total.toFixed(2)}</h2>
            </div>
            
            <!-- Condições Comerciais -->
            <div class="condicoes-comerciais">
                <h3>CONDIÇÕES COMERCIAIS:</h3>
                <div class="condicoes-grid">
                    <div class="condicao-item">
                        <strong>Forma de Pagamento:</strong> ${dados.pagamento}
                    </div>
                    <div class="condicao-item">
                        <strong>Prazo:</strong> ${dados.prazo}; ou à vista com 3% de desconto
                    </div>
                    <div class="condicao-item">
                        <strong>Disponibilidade:</strong> ${dados.disponibilidade}
                    </div>
                    <div class="condicao-item">
                        <strong>Frete:</strong> ${dados.frete}
                    </div>
                    <div class="condicao-item">
                        <strong>Garantia:</strong> ${dados.garantia}
                    </div>
                    <div class="condicao-item">
                        <strong>Validade da Proposta:</strong> ${dados.validade}
                    </div>
                </div>
            </div>
            
            <!-- Rodapé -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                <p>Cotação gerada em: ${dados.data} | Número: ${dados.numeroCotacao}</p>
                <p>SOS Balanças - Sistema de Cotações Automáticas</p>
            </div>
        </div>
    `;
}

// ============================================
// 4. GERAR PDF
// ============================================

async function gerarCotacao() {
    if (cotacaoItens.length === 0) {
        alert('Adicione pelo menos um produto à cotação!');
        return;
    }
    
    if (!document.getElementById('razaoSocial').value) {
        alert('Preencha os dados do cliente!');
        return;
    }
    
    try {
        mostrarMensagem('⏳ Gerando PDF...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Capturar o conteúdo do preview
        const element = document.getElementById('cotacaoPreview');
        
        // Usar html2canvas para capturar
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        // Salvar PDF
        const nomeArquivo = `Cotacao_Grascon_${Date.now()}.pdf`;
        doc.save(nomeArquivo);
        
        mostrarMensagem(`✅ PDF gerado: ${nomeArquivo}`, 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        mostrarMensagem('❌ Erro ao gerar PDF. Tente novamente.', 'error');
        
        // Fallback: Abrir em nova janela para impressão
        const previewContent = document.getElementById('cotacaoPreview').innerHTML;
        const newWindow = window.open();
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cotação SOS Balanças</title>
                <style>
                    body { font-family: Calibri, Arial; margin: 20px; }
                    @media print {
                        @page { margin: 20mm; }
                    }
                </style>
            </head>
            <body>
                ${previewContent}
                <script>
                    window.onload = function() {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);
    }
}

// ============================================
// 5. FUNÇÕES AUXILIARES
// ============================================

function configurarFormatacao() {
    // Formatar CNPJ automaticamente
    document.getElementById('cnpjConsulta').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
        }
        
        e.target.value = value;
    });
    
    // Formatar telefone
    document.getElementById('telefone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{4})/, '($1) $2');
        }
        
        e.target.value = value;
    });
    
    // Atualizar preview quando campos mudarem
    const campos = ['razaoSocial', 'cnpj', 'contato', 'email', 'telefone', 'endereco', 
                   'pagamento', 'prazo', 'frete', 'garantia', 'disponibilidade', 'validade'];
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', atualizarPreview);
            campo.addEventListener('change', atualizarPreview);
        }
    });
}

function mostrarMensagem(texto, tipo = 'info') {
    // Remover mensagem anterior
    const mensagemAnterior = document.querySelector('.alert-message');
    if (mensagemAnterior) mensagemAnterior.remove();
    
    // Criar nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `alert-message alert-${tipo}`;
    mensagem.textContent = texto;
    mensagem.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Cores por tipo
    const cores = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    mensagem.style.background = cores[tipo] || '#3498db';
    
    document.body.appendChild(mensagem);
    
    // Remover após 5 segundos
    setTimeout(() => {
        mensagem.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (mensagem.parentNode) {
                mensagem.parentNode.removeChild(mensagem);
            }
        }, 300);
    }, 5000);
}

function limparTudo() {
    if (confirm('Tem certeza que deseja limpar toda a cotação?')) {
        // Limpar campos do cliente
        document.getElementById('razaoSocial').value = '';
        document.getElementById('cnpj').value = '';
        document.getElementById('contato').value = '';
        document.getElementById('email').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('cnpjConsulta').value = '';
        
        // Limpar itens
        cotacaoItens = [];
        totalGeral = 0;
        
        // Resetar condições padrão
        document.getElementById('pagamento').selectedIndex = 0;
        document.getElementById('prazo').value = '28/35ddl';
        document.getElementById('frete').value = 'CIF para São Paulo - Capital';
        document.getElementById('garantia').value = '01 ano';
        document.getElementById('disponibilidade').value = 'Em estoque';
        document.getElementById('validade').value = '30 dias';
        
        // Atualizar interface
        atualizarItensInterface();
        calcularTotal();
        atualizarPreview();
        
        mostrarMensagem('✅ Cotação limpa com sucesso!', 'success');
    }
}

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
