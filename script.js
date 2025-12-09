// URL do seu site no GitHub Pages
const SITE_URL = window.location.origin;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('siteUrl').textContent = SITE_URL;
    carregarCatalogo();
});

// 1. Consultar CNPJ (API gratuita BrasilAPI)
async function consultarCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    let cnpj = cnpjInput.value.replace(/\D/g, '');
    
    if (cnpj.length !== 14) {
        alert('CNPJ inválido! Digite 14 números.');
        return;
    }
    
    try {
        // Mostrar carregamento
        const consultarBtn = document.querySelector('button[onclick="consultarCNPJ()"]');
        consultarBtn.innerHTML = '⏳ Consultando...';
        consultarBtn.disabled = true;
        
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        
        if (!response.ok) {
            throw new Error('CNPJ não encontrado na base de dados');
        }
        
        const empresa = await response.json();
        
        // ✅ CORREÇÃO AQUI: Preencher os campos CORRETOS
        document.getElementById('razaoSocialInput').value = empresa.razao_social || '';
        document.getElementById('cnpjInput').value = empresa.cnpj || cnpj;
        
        // Montar endereço completo
        const endereco = [
            empresa.logradouro,
            empresa.numero,
            empresa.complemento,
            empresa.bairro,
            empresa.municipio,
            empresa.uf
        ].filter(Boolean).join(', ');
        
        document.getElementById('endereco').value = endereco;
        
        // Preencher telefone se existir
        if (empresa.ddd_telefone_1) {
            document.getElementById('telefone').value = `(${empresa.ddd_telefone_1.substring(0,2)}) ${empresa.ddd_telefone_1.substring(2)}`;
        }
        
        // Restaurar botão
        consultarBtn.innerHTML = '🔍 Consultar CNPJ';
        consultarBtn.disabled = false;
        
        // Mensagem de sucesso
        alert(`✅ Empresa encontrada!\n${empresa.razao_social}\n${empresa.cnpj}`);
        
    } catch (error) {
        console.error('Erro na consulta:', error);
        
        // Restaurar botão
        const consultarBtn = document.querySelector('button[onclick="consultarCNPJ()"]');
        consultarBtn.innerHTML = '🔍 Consultar CNPJ';
        consultarBtn.disabled = false;
        
        // Opção para preencher manualmente
        const confirmar = confirm(
            '⚠️ Não foi possível consultar automaticamente.\n' +
            'Deseja preencher o CNPJ digitado no campo correspondente?'
        );
        
        if (confirmar) {
            document.getElementById('cnpjInput').value = cnpjInput.value;
        }
    }
}

// Formatar CNPJ automaticamente
document.getElementById('cnpj').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 14) value = value.substring(0, 14);
    
    if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
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
    } else if (value.length > 0) {
        value = value.replace(/^(\d{2})/, '($1)');
    }
    
    e.target.value = value;
});

// 2. Carregar Catálogo (Google Sheets ou JSON local)
// CATÁLOGO DE PRODUTOS SOS BALANÇAS - COM IMAGENS
const catalogo = [
    {
        codigo: '2521',
        descricao: 'BALANÇA MARCA RAMUZA - MODELO DP50P TIPO PADEIRO - AÇO CARBONO - COM COLUNA',
        imagem: 'https://via.placeholder.com/150x150/3498db/ffffff?text=BALANÇA+2521',
        preco: 990.00,
        especificacoes: 'Capacidade: 50kg | Divisão: 10g | Plataforma Aço Carbono 33x28cm | Com Certificado de Calibração'
    },
    {
        codigo: '6758',
        descricao: 'BALANÇA MARCA UPX - MODELO BLUE UL - COM BATERIA',
        imagem: 'https://via.placeholder.com/150x150/2ecc71/ffffff?text=BALANÇA+6758',
        preco: 1590.00,
        especificacoes: 'Capacidade: 150kg | Divisão: 20g (0-60kg) / 50g (61-150kg) | Plataforma Aço Inox 45x60cm | Com Bateria'
    },
    {
        codigo: '7890',
        descricao: 'BALANÇA DIGITAL PRECISÃO 30KG',
        imagem: 'https://via.placeholder.com/150x150/e74c3c/ffffff?text=BALANÇA+7890',
        preco: 750.00,
        especificacoes: 'Capacidade: 30kg | Divisão: 1g | Display LCD | Bateria Recarregável'
    }
];

// FUNÇÃO PRINCIPAL PARA CARREGAR CATÁLOGO
function carregarCatalogo() {
    console.log('🚀 Iniciando carregamento do catálogo...');
    
    try {
        const select = document.getElementById('produtoSelect');
        
        if (!select) {
            console.error('❌ ERRO: Elemento #produtoSelect não encontrado!');
            alert('Erro: Elemento de seleção de produtos não encontrado.');
            return;
        }
        
        console.log('✅ Elemento select encontrado:', select);
        
        // Limpa todas as opções exceto a primeira
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adiciona cada produto do catálogo
        catalogo.forEach((produto, index) => {
            const option = document.createElement('option');
            option.value = produto.codigo;
            option.textContent = `[${produto.codigo}] ${produto.descricao.substring(0, 50)}${produto.descricao.length > 50 ? '...' : ''}`;
            option.dataset.produto = JSON.stringify(produto);
            select.appendChild(option);
            
            console.log(`✅ Produto ${index + 1} adicionado: ${produto.codigo}`);
        });
        
        console.log(`🎉 Catálogo carregado com sucesso! ${catalogo.length} produtos disponíveis.`);
        
        // Mostrar mensagem para usuário
        const mensagem = document.createElement('div');
        mensagem.className = 'success-message';
        mensagem.innerHTML = `✅ Catálogo carregado: ${catalogo.length} produtos disponíveis`;
        mensagem.style.cssText = 'background:#2ecc71;color:white;padding:10px;border-radius:5px;margin-top:10px;';
        
        // Remove mensagem anterior se existir
        const msgAnterior = document.querySelector('.success-message');
        if (msgAnterior) msgAnterior.remove();
        
        // Insere após o botão
        const botao = document.querySelector('button[onclick="carregarCatalogo()"]');
        if (botao) {
            botao.parentNode.appendChild(mensagem);
        }
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO ao carregar catálogo:', error);
        alert(`Erro ao carregar catálogo: ${error.message}\nVerifique o console (F12) para mais detalhes.`);
    }
}

// FUNÇÃO PARA ADICIONAR PRODUTO À COTAÇÃO
function carregarProduto() {
    console.log('📦 Adicionando produto à cotação...');
    
    try {
        const select = document.getElementById('produtoSelect');
        const selectedOption = select.options[select.selectedIndex];
        
        if (!selectedOption.value) {
            console.log('⚠️ Nenhum produto selecionado');
            return;
        }
        
        const produto = JSON.parse(selectedOption.dataset.produto);
        console.log('✅ Produto selecionado:', produto.codigo);
        
        const tabela = document.getElementById('itensCorpo');
        
        if (!tabela) {
            console.error('❌ ERRO: Tabela de itens não encontrada!');
            return;
        }
        
        // Verifica se produto já está na tabela
        const produtosExistentes = Array.from(tabela.querySelectorAll('tr')).map(tr => 
            tr.querySelector('td:first-child')?.textContent
        );
        
        if (produtosExistentes.includes(produto.codigo)) {
            alert('Este produto já foi adicionado à cotação!');
            return;
        }
        
        // Cria nova linha na tabela
        const novaLinha = document.createElement('tr');
        novaLinha.className = 'item-cotacao';
        novaLinha.innerHTML = `
            <td>${produto.codigo}</td>
            <td>
                <strong>${produto.descricao}</strong><br>
                <small style="color:#7f8c8d;">${produto.especificacoes}</small>
            </td>
            <td>
                <input type="number" value="1" min="1" max="100" 
                       onchange="atualizarTotal(this)" 
                       style="width: 60px; padding: 5px;">
            </td>
            <td class="preco-unitario">R$ ${produto.preco.toFixed(2)}</td>
            <td class="item-total">R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button onclick="removerItem(this)" class="btn" 
                        style="background:#e74c3c; color:white; padding:5px 10px;">
                    🗑️ Remover
                </button>
            </td>
        `;
        
        tabela.appendChild(novaLinha);
        console.log('✅ Produto adicionado à tabela');
        
// FUNÇÃO PARA CALCULAR TOTAL DA COTAÇÃO
function calcularTotal() {
    console.log('🧮 Calculando total...');
    
    try {
        let total = 0;
        const itensTotais = document.querySelectorAll('.item-total');
        
        itensTotais.forEach(celula => {
            const texto = celula.textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            const valor = parseFloat(texto);
            
            if (!isNaN(valor)) {
                total += valor;
            }
        });
        
        const totalElement = document.getElementById('totalGeral');
        if (totalElement) {
            totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
            console.log('✅ Total calculado:', total);
        }
        
    } catch (error) {
        console.error('❌ Erro ao calcular total:', error);
    }
}

// ATUALIZAR TOTAL QUANDO QUANTIDADE MUDAR
function atualizarTotal(input) {
    const linha = input.closest('tr');
    const precoTexto = linha.querySelector('.preco-unitario').textContent;
    const preco = parseFloat(precoTexto.replace('R$ ', '').replace(',', '.'));
    const quantidade = parseInt(input.value) || 1;
    const total = preco * quantidade;
    
    linha.querySelector('.item-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    calcularTotal();
}

// REMOVER ITEM DA COTAÇÃO
function removerItem(botao) {
    if (confirm('Tem certeza que deseja remover este item da cotação?')) {
        const linha = botao.closest('tr');
        linha.remove();
        calcularTotal();
        console.log('🗑️ Item removido da cotação');
    }
}

// CARREGAR CATÁLOGO QUANDO PÁGINA ABRIR
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada, iniciando sistema...');
    
    // Mostrar URL do site
    const siteUrl = window.location.origin;
    const urlElement = document.getElementById('siteUrl');
    if (urlElement) {
        urlElement.textContent = siteUrl;
    }
    
    // Carregar catálogo automaticamente após 1 segundo
    setTimeout(() => {
        console.log('⏰ Carregando catálogo automaticamente...');
        carregarCatalogo();
    }, 1000);
    
    // Adicionar evento para tecla Enter no campo CNPJ
    document.getElementById('cnpj').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            consultarCNPJ();
        }
    });
});

// 5. Gerar PDF
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0); // Verde
    doc.text('⚖️ SOS BALANÇAS', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Soluções em Pesagem e Instrumentação', 105, 27, { align: 'center' });
    
    // Dados da Empresa Cliente
    doc.setFontSize(14);
    doc.text('DADOS DO CLIENTE', 20, 45);
    doc.setFontSize(11);
    doc.text(`Razão Social: ${document.getElementById('razaoSocialInput').value || 'Não informado'}`, 20, 55);
    doc.text(`CNPJ: ${document.getElementById('cnpjInput').value || 'Não informado'}`, 20, 62);
    doc.text(`Endereço: ${document.getElementById('endereco').value || 'Não informado'}`, 20, 69);
    doc.text(`Contato: ${document.getElementById('contato').value || 'Não informado'}`, 20, 76);
    doc.text(`Telefone: ${document.getElementById('telefone').value || 'Não informado'}`, 20, 83);
    doc.text(`E-mail: ${document.getElementById('email').value || 'Não informado'}`, 20, 90);
    
    // Linha divisória
    doc.line(20, 95, 190, 95);
    
    // Título dos Itens
    doc.setFontSize(14);
    doc.text('ITENS DA COTAÇÃO', 20, 105);
    
    // Cabeçalho da tabela
    doc.setFillColor(44, 62, 80); // Azul escuro
    doc.rect(20, 110, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Código', 25, 116);
    doc.text('Descrição', 50, 116);
    doc.text('Qtd', 130, 116);
    doc.text('Valor Unit.', 145, 116);
    doc.text('Total', 170, 116);
    
    // ... continue com o restante da função
    
    // Adicione as condições comerciais com frete
    doc.text(`Frete: ${document.getElementById('frete').value}`, 20, yPos);
    yPos += 7;
    doc.text(`Garantia: ${document.getElementById('garantia').value}`, 20, yPos);
    yPos += 7;
    doc.text(`Validade: ${document.getElementById('validade').value}`, 20, yPos);
    
    // Salvar PDF
    doc.save(`cotacao-sos-balanças-${Date.now()}.pdf`);
}

// 6. Limpar Tudo
function limparCotacao() {
    if (confirm('Tem certeza que deseja limpar toda a cotação?')) {
        document.getElementById('itensCorpo').innerHTML = '';
        document.getElementById('cnpj').value = '';
        document.getElementById('dadosEmpresa').classList.add('hidden');
        calcularTotal();
    }
}

// Salvar catálogo no localStorage (opcional)
function salvarCatalogoLocal(catalogo) {
    localStorage.setItem('catalogoGrascon', JSON.stringify(catalogo));
}
