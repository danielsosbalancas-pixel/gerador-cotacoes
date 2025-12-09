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
        
        // Preencher campos automaticamente
        document.getElementById('razaoSocialInput').value = empresa.razao_social || '';
        document.getElementById('cnpjInput').value = empresa.cnpj || cnpj;
        document.getElementById('endereco').value = 
            `${empresa.logradouro || ''} ${empresa.numero || ''}, ${empresa.bairro || ''} - ${empresa.municipio || ''}/${empresa.uf || ''}`.trim();
        
        alert(`✅ Empresa encontrada: ${empresa.razao_social}`);
        
    } catch (error) {
        alert('⚠️ CNPJ não encontrado na base. Preencha os dados manualmente.');
        // Deixa os campos em branco para preenchimento manual
        document.getElementById('cnpjInput').value = cnpjInput.value;
    }
}

// 2. Carregar Catálogo (Google Sheets ou JSON local)
async function carregarCatalogoGoogleSheets() {
    const sheetId = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzTURqk6e4HHCA5ThyNkHyi-8bZppYU4DZ8HlkVaCMn2EnnuGcQlmm7xkyR_uPW4gXznCAwMnRWY3s/pubhtml'; // Pegue do link
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
