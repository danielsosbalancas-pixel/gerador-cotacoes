// ============================================
// SISTEMA DE COTAÇÃO SOS BALANÇAS
// VERSÃO SIMPLIFICADA E FUNCIONAL
// ============================================

// CATÁLOGO DE PRODUTOS
const produtos = [
    {
        codigo: '2521',
        descricao: 'BALANÇA MARCA RAMUZA - MODELO DP50P TIPO PADEIRO - AÇO CARBONO - COM COLUNA',
        preco: 990.00,
        especificacoes: 'Capacidade: 50kg | Divisão: 10g | Plataforma Aço Carbono 33x28cm'
    },
    {
        codigo: '6758',
        descricao: 'BALANÇA MARCA UPX - MODELO BLUE UL - COM BATERIA',
        preco: 1590.00,
        especificacoes: 'Capacidade: 150kg | Divisão: 20g/50g | Plataforma Aço Inox 45x60cm'
    }
];

// ============================================
// 1. CARREGAR CATÁLOGO (FUNÇÃO PRINCIPAL)
// ============================================

function carregarCatalogo() {
    console.log('🔧 Função carregarCatalogo() chamada');
    
    // Encontrar o elemento select
    const select = document.getElementById('produtoSelect');
    console.log('Elemento select:', select);
    
    if (!select) {
        alert('❌ ERRO: Elemento #produtoSelect não encontrado!');
        return;
    }
    
    // Limpar opções existentes (mantendo apenas a primeira)
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    
    // Adicionar cada produto
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.codigo;
        option.textContent = `${produto.codigo} - R$ ${produto.preco.toFixed(2)}`;
        option.title = produto.descricao; // Tooltip com descrição completa
        option.dataset.produto = JSON.stringify(produto);
        select.appendChild(option);
    });
    
    console.log(`✅ ${produtos.length} produtos carregados`);
    
    // Mostrar mensagem de sucesso
    const mensagem = document.createElement('div');
    mensagem.style.cssText = 'background: #2ecc71; color: white; padding: 10px; margin-top: 10px; border-radius: 5px;';
    mensagem.textContent = `✅ ${produtos.length} produtos carregados no catálogo`;
    
    // Remover mensagem anterior se existir
    const msgAnterior = document.querySelector('.msg-catalogo');
    if (msgAnterior) msgAnterior.remove();
    
    mensagem.className = 'msg-catalogo';
    select.parentNode.appendChild(mensagem);
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
