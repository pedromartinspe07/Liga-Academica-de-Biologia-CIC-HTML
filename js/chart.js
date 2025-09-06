// js/chart.js - Versão aprimorada e compatível com o tema do site
console.log('Chart.js script carregado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando Chart.js...');
    
    // Verifica se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado. Verifique se o CDN está funcionando.');
        return;
    }
    
    console.log('Chart.js disponível, inicializando gráficos...');
    
    // Função para obter cores das variáveis CSS
    function getCssVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }

    // Cores obtidas do seu arquivo style.css
    const primaryColor = getCssVariable('--primary-color') || '#0165b6';
    const accentBlue = getCssVariable('--accent-color-blue') || '#50a4ca';
    const accentBrown = getCssVariable('--accent-color-brown') || '#a1887f';
    const accentRed = '#D45D5D'; // Mantido para contraste visual

    console.log('Cores carregadas:', { primaryColor, accentBlue, accentBrown, accentRed });

    // Dados originais dos gráficos
    const dadosGrafico1 = {
        labels: ['Espécie A', 'Espécie B', 'Espécie C'],
        nitrato: [85, 92, 78],
        fosfato: [75, 88, 80]
    };

    const dadosGrafico2 = {
        labels: ['Ponto de Coleta 1 (Próximo)', 'Ponto de Coleta 2 (Intermediário)', 'Ponto de Coleta 3 (Distante)'],
        saude: [30, 65, 90]
    };

    /**
     * @function exportarCSV
     * Gera e baixa um arquivo CSV a partir dos dados fornecidos.
     */
    function exportarCSV(headers, rows, nomeArquivo) {
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * @function initBiofiltrationChart
     * Inicializa o primeiro gráfico de linha.
     */
    function initBiofiltrationChart() {
        const chartElement = document.getElementById('biofiltrationChart');
        if (!chartElement) {
            console.error('Elemento do gráfico de biofiltração não encontrado.');
            return;
        }

        function getDatasets(tipo) {
            const datasets = [];
            if (tipo === 'ambos' || tipo === 'nitrato') {
                datasets.push({
                    label: 'Remoção de Nitrato (%)',
                    data: dadosGrafico1.nitrato,
                    borderColor: primaryColor,
                    backgroundColor: 'rgba(1, 101, 182, 0.2)',
                    tension: 0.4,
                    pointStyle: 'circle',
                    pointRadius: 6,
                    pointHoverRadius: 8
                });
            }
            if (tipo === 'ambos' || tipo === 'fosfato') {
                datasets.push({
                    label: 'Remoção de Fosfato (%)',
                    data: dadosGrafico1.fosfato,
                    borderColor: accentBlue,
                    backgroundColor: 'rgba(80, 164, 202, 0.2)',
                    tension: 0.4,
                    pointStyle: 'rectRot',
                    pointRadius: 6,
                    pointHoverRadius: 8
                });
            }
            return datasets;
        }

        const biofiltrationChart = new Chart(chartElement, {
            type: 'line',
            data: {
                labels: dadosGrafico1.labels,
                datasets: getDatasets('ambos')
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Eficiência de Remoção de Poluentes por Macroalgas',
                        font: { size: 18, family: 'Merriweather' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `${context.parsed.y}%`;
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Eficiência de Remoção (%)',
                            font: { size: 14, family: 'Poppins' }
                        },
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }
            }
        });

        // Event listener para o filtro
        const selectElement = document.getElementById('grafico1-variavel');
        if (selectElement) {
            selectElement.addEventListener('change', (e) => {
                const tipo = e.target.value;
                biofiltrationChart.data.datasets = getDatasets(tipo);
                biofiltrationChart.update();
            });
        }
        
        // Event listener para o download
        const downloadBtn = document.getElementById('download-grafico1');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const headers = ['Espécie', 'Remoção de Nitrato (%)', 'Remoção de Fosfato (%)'];
                const rows = dadosGrafico1.labels.map((especie, i) => [especie, dadosGrafico1.nitrato[i], dadosGrafico1.fosfato[i]]);
                exportarCSV(headers, rows, 'biofiltracao_macroalgas.csv');
            });
        }
    }

    /**
     * @function initWaterQualityChart
     * Inicializa o segundo gráfico de barras.
     */
    function initWaterQualityChart() {
        const chartElement = document.getElementById('waterQualityChart');
        if (!chartElement) {
            console.error('Elemento do gráfico de qualidade da água não encontrado.');
            return;
        }

        const waterQualityChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: dadosGrafico2.labels,
                datasets: [{
                    label: 'Índice de Saúde do Ecossistema',
                    data: dadosGrafico2.saude,
                    backgroundColor: [accentRed, accentBrown, accentBlue],
                    borderColor: [accentRed, accentBrown, accentBlue],
                    borderWidth: 1,
                    barPercentage: 0.6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Índice de Saúde do Ecossistema Costeiro por Ponto de Coleta',
                        font: { size: 18, family: 'Merriweather' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Índice de Saúde (0-100)',
                            font: { size: 14, family: 'Poppins' }
                        },
                        suggestedMax: 100
                    }
                }
            }
        });

        // Event listener para o download
        const downloadBtn = document.getElementById('download-grafico2');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const headers = ['Ponto de Coleta', 'Índice de Saúde do Ecossistema'];
                const rows = dadosGrafico2.labels.map((label, i) => [label, dadosGrafico2.saude[i]]);
                exportarCSV(headers, rows, 'qualidade_agua_suape.csv');
            });
        }
    }

    // Inicializa os gráficos
    try {
        initBiofiltrationChart();
        initWaterQualityChart();
    } catch (error) {
        console.error('Um erro ocorreu durante a inicialização dos gráficos:', error);
    }
});