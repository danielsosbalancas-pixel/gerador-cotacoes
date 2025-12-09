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
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        
        if (!response.ok) {
            throw new Error('CNPJ não encontrado');
        }
        
        const empresa = await response.json();
        
        // Preencher dados
        document.getElementById('razaoSocial').textContent = empresa.razao_social;
        document.getElementById('telefoneEmpresa').textContent = empresa.ddd_telefone_1 || '(11) 5677-5807';
        
        // Mostrar seção
        document.getElementById('dadosEmpresa').classList.remove('hidden');
        
        alert(`Empresa encontrada: ${empresa.razao_social}`);
        
    } catch (error) {
        alert('Erro ao consultar CNPJ: ' + error.message);
        // Preencher com dados padrão
        document.getElementById('dadosEmpresa').classList.remove('hidden');
    }
}

// 2. Carregar Catálogo (Google Sheets ou JSON local)
async function carregarCatalogoGoogleSheets() {
    const sheetId = 'SUA_PLANILHA_ID'; // Pegue do link
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    
    const response = await fetch(url);
    const text = await response.text();
    // Processar o CSV
}

// 3. Adicionar Produto à Tabela
function carregarProduto() {
    const select = document.getElementById('produtoSelect');
    const produtoData = select.options[select.selectedIndex].dataset.produto;
    
    if (!produtoData) return;
    
    const produto = JSON.parse(produtoData);
    const tabela = document.getElementById('itensCorpo');
    
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${produto.codigo}</td>
        <td>${produto.descricao}</td>
        <td><input type="number" value="1" min="1" onchange="atualizarTotal(this)"></td>
        <td>R$ ${produto.preco.toFixed(2)}</td>
        <td class="item-total">R$ ${produto.preco.toFixed(2)}</td>
        <td><button onclick="removerItem(this)" class="btn" style="background:#e74c3c;">❌</button></td>
    `;
    
    tabela.appendChild(novaLinha);
    calcularTotal();
}

// 4. Cálculos
function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.item-total').forEach(celula => {
        const valor = parseFloat(celula.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
        total += isNaN(valor) ? 0 : valor;
    });
    
    document.getElementById('totalGeral').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function atualizarTotal(input) {
    const linha = input.closest('tr');
    const precoUnitario = parseFloat(linha.cells[3].textContent.replace('R$ ', '').replace(',', '.'));
    const quantidade = parseInt(input.value) || 1;
    const total = precoUnitario * quantidade;
    
    linha.cells[4].textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    calcularTotal();
}

function removerItem(botao) {
    botao.closest('tr').remove();
    calcularTotal();
}

// 5. Gerar PDF
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Conteúdo básico do PDF
    doc.setFontSize(20);
    doc.text('COTAÇÃO - LABORATÓRIOS GRASCON', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
    doc.text(`CNPJ: ${document.getElementById('cnpj').value || 'Não informado'}`, 20, 50);
    
    // Tabela de itens
    let yPos = 80;
    doc.text('ITENS DA COTAÇÃO:', 20, yPos);
    yPos += 10;
    
    // Adicione mais conteúdo conforme necessário
    
    // Salvar PDF
    doc.save(`cotacao-grascon-${Date.now()}.pdf`);
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
