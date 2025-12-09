// ============================================
// SISTEMA DE COTAÇÃO SOS BALANÇAS
// VERSÃO SIMPLIFICADA E FUNCIONAL
// ============================================

// CATÁLOGO DE PRODUTOS COM IMAGENS
const produtos = [
    {
        codigo: '2521',
        descricao: 'BALANÇA MARCA RAMUZA - MODELO DP50P TIPO PADEIRO - AÇO CARBONO - COM COLUNA',
        imagem: 'https://github.com/danielsosbalancas-pixel/gerador-cotacoes/blob/gerador-cotacoes/imagens/Captura%20de%20Tela%202025-12-07%20às%2008.31.38.png',
        preco: 990.00,
        especificacoes: 'Capacidade: 50kg | Divisão: 10g | Plataforma Aço Carbono 33x28cm'
    },
    {
        codigo: '6758',
        descricao: 'BALANÇA MARCA UPX - MODELO BLUE UL - COM BATERIA',
        imagem: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop&grayscale',
        preco: 1590.00,
        especificacoes: 'Capacidade: 150kg | Divisão: 20g/50g | Plataforma Aço Inox 45x60cm'
    },
    {
        codigo: '7890',
        descricao: 'BALANÇA DIGITAL PRECISÃO 30KG',
        imagem: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop',
        preco: 750.00,
        especificacoes: 'Capacidade: 30kg | Divisão: 1g | Display LCD | Bateria Recarregável'
    }
];

// ============================================
// 1. CARREGAR CATÁLOGO (FUNÇÃO PRINCIPAL)
// ============================================

function carregarCatalogo() {
    console.log('🔧 Função carregarCatalogo() chamada');
    
    const select = document.getElementById('produtoSelect');
    
    if (!select) {
        alert('❌ ERRO: Elemento #produtoSelect não encontrado!');
        return;
    }
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    
    // Adicionar cada produto com mini preview
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.codigo;
        
        // Criar conteúdo com ícone de imagem
        option.innerHTML = `
            <div style="display: flex; align-items: center; padding: 5px 0;">
                <img src="${produto.imagem}" 
                     style="width: 30px; height: 30px; border-radius: 4px; margin-right: 10px; object-fit: cover; border: 1px solid #ddd;">
                <div>
                    <strong>${produto.codigo}</strong> - R$ ${produto.preco.toFixed(2)}
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">
                        ${produto.descricao.substring(0, 40)}...
                    </div>
                </div>
            </div>
        `;
        
        option.dataset.produto = JSON.stringify(produto);
        select.appendChild(option);
    });
    
    console.log(`✅ ${produtos.length} produtos carregados`);
}

// ============================================
// 2. ADICIONAR PRODUTO À COTAÇÃO
// ============================================

function carregarProduto() {
    console.log('📦 Adicionando produto...');
    
    const select = document.getElementById('produtoSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        console.log('Nenhum produto selecionado');
        return;
    }
    
    // Obter dados do produto
    const produto = JSON.parse(selectedOption.dataset.produto);
    console.log('Produto selecionado:', produto.codigo);
    
    // Encontrar a tabela
    const tabela = document.getElementById('itensCorpo');
    
    if (!tabela) {
        alert('Erro: Tabela não encontrada');
        return;
    }
    
    // Verificar se produto já foi adicionado
    const linhas = tabela.getElementsByTagName('tr');
    for (let linha of linhas) {
        const codigoCell = linha.cells[0];
        if (codigoCell && codigoCell.textContent === produto.codigo) {
            alert('⚠️ Este produto já foi adicionado à cotação!');
            return;
        }
    }
    
    // Criar nova linha na tabela
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${produto.codigo}</td>
        <td>
            <strong>${produto.descricao}</strong><br>
            <small style="color:#666">${produto.especificacoes}</small>
        </td>
        <td>
            <input type="number" value="1" min="1" 
                   style="width: 60px; padding: 5px;"
                   onchange="atualizarValorTotal(this)">
        </td>
        <td class="preco-unitario">R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td class="item-total">R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td>
            <button onclick="removerLinha(this)" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                🗑️
            </button>
        </td>
    `;
    
    tabela.appendChild(novaLinha);
    calcularTotalGeral();
    
    // Resetar seleção
    select.selectedIndex = 0;
    
    console.log('✅ Produto adicionado com sucesso');
}

function carregarProduto() {
    console.log('📦 Adicionando produto...');
    
    const select = document.getElementById('produtoSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        console.log('Nenhum produto selecionado');
        return;
    }
    
    const produto = JSON.parse(selectedOption.dataset.produto);
    console.log('Produto selecionado:', produto.codigo);
    
    const tabela = document.getElementById('itensCorpo');
    
    if (!tabela) {
        alert('Erro: Tabela não encontrada');
        return;
    }
    
    // Verificar se produto já foi adicionado
    const linhas = tabela.getElementsByTagName('tr');
    for (let linha of linhas) {
        const codigoCell = linha.cells[0];
        if (codigoCell && codigoCell.textContent === produto.codigo) {
            alert('⚠️ Este produto já foi adicionado à cotação!');
            return;
        }
    }
    
    // Criar nova linha na tabela COM IMAGEM
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td style="vertical-align: middle;">
            <div style="display: flex; align-items: center;">
                <img src="${produto.imagem}" 
                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">
                <strong>${produto.codigo}</strong>
            </div>
        </td>
        <td style="vertical-align: middle;">
            <strong>${produto.descricao}</strong><br>
            <small style="color:#666">${produto.especificacoes}</small>
        </td>
        <td style="vertical-align: middle;">
            <input type="number" value="1" min="1" 
                   style="width: 60px; padding: 5px;"
                   onchange="atualizarValorTotal(this)">
        </td>
        <td class="preco-unitario" style="vertical-align: middle;">
            R$ ${produto.preco.toFixed(2).replace('.', ',')}
        </td>
        <td class="item-total" style="vertical-align: middle;">
            R$ ${produto.preco.toFixed(2).replace('.', ',')}
        </td>
        <td style="vertical-align: middle;">
            <button onclick="removerLinha(this)" 
                    style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                🗑️
            </button>
        </td>
    `;
    
    tabela.appendChild(novaLinha);
    calcularTotalGeral();
    
    // Resetar seleção
    select.selectedIndex = 0;
    
    console.log('✅ Produto adicionado com sucesso');
}

// ============================================
// 3. FUNÇÕES DE CÁLCULO
// ============================================

function atualizarValorTotal(inputElement) {
    const linha = inputElement.closest('tr');
    const quantidade = parseInt(inputElement.value) || 1;
    const precoTexto = linha.querySelector('.preco-unitario').textContent;
    const preco = parseFloat(precoTexto.replace('R$ ', '').replace(',', '.'));
    const total = preco * quantidade;
    
    linha.querySelector('.item-total').textContent = 
        `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    calcularTotalGeral();
}

function calcularTotalGeral() {
    let totalGeral = 0;
    const totais = document.querySelectorAll('.item-total');
    
    totais.forEach(celula => {
        const texto = celula.textContent.replace('R$ ', '').replace(',', '.');
        const valor = parseFloat(texto);
        if (!isNaN(valor)) {
            totalGeral += valor;
        }
    });
    
    const totalElement = document.getElementById('totalGeral');
    if (totalElement) {
        totalElement.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    }
}

function removerLinha(botao) {
    if (confirm('Remover este item da cotação?')) {
        const linha = botao.closest('tr');
        linha.remove();
        calcularTotalGeral();
    }
}

// ============================================
// 4. CONSULTA CNPJ (SIMPLIFICADA)
// ============================================

async function consultarCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    let cnpj = cnpjInput.value.replace(/\D/g, '');
    
    if (cnpj.length !== 14) {
        alert('CNPJ inválido! Digite 14 números.');
        return;
    }
    
    try {
        const botao = document.querySelector('button[onclick="consultarCNPJ()"]');
        botao.innerHTML = '⏳ Consultando...';
        botao.disabled = true;
        
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const empresa = await response.json();
        
        // Preencher campos
        document.getElementById('razaoSocialInput').value = empresa.razao_social || '';
        document.getElementById('cnpjInput').value = empresa.cnpj || cnpj;
        
        const endereco = [
            empresa.logradouro,
            empresa.numero,
            empresa.bairro,
            empresa.municipio,
            empresa.uf
        ].filter(Boolean).join(', ');
        
        document.getElementById('endereco').value = endereco;
        
        if (empresa.ddd_telefone_1) {
            document.getElementById('telefone').value = 
                `(${empresa.ddd_telefone_1.substring(0,2)}) ${empresa.ddd_telefone_1.substring(2)}`;
        }
        
        botao.innerHTML = '🔍 Consultar CNPJ';
        botao.disabled = false;
        
        alert(`✅ Dados encontrados para:\n${empresa.razao_social}`);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('⚠️ Não foi possível consultar. Preencha os dados manualmente.');
        
        const botao = document.querySelector('button[onclick="consultarCNPJ()"]');
        botao.innerHTML = '🔍 Consultar CNPJ';
        botao.disabled = false;
    }
}

// ============================================
// 5. INICIALIZAÇÃO DO SISTEMA
// ============================================

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema SOS Balanças iniciando...');
    
    // Carregar catálogo automaticamente após 1 segundo
    setTimeout(function() {
        console.log('⏰ Carregando catálogo automaticamente...');
        carregarCatalogo();
    }, 1000);
    
    // Configurar formatação automática do CNPJ
    document.getElementById('cnpj').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        e.target.value = value;
    });
    
    // Permitir Enter para consultar CNPJ
    document.getElementById('cnpj').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            consultarCNPJ();
        }
    });
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// ============================================
// 6. GERAR PDF (VERSÃO SIMPLIFICADA)
// ============================================

function gerarPDF() {
    alert('📄 Gerando PDF... (funcionalidade será implementada)');
    
    // Para teste, vamos apenas mostrar os dados no console
    console.log('=== DADOS DA COTAÇÃO ===');
    console.log('Cliente:', document.getElementById('razaoSocialInput').value);
    console.log('CNPJ:', document.getElementById('cnpjInput').value);
    console.log('Total:', document.getElementById('totalGeral').textContent);
    
    // Em breve implementaremos jsPDF
}
