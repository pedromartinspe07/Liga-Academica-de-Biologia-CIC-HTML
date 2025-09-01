// js/chart.js - Versão compatível com GitHub Pages

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
    const primaryColor = getCssVariable('--primary-color') || '#004d40';
    const accentGreen = getCssVariable('--accent-color-green') || '#81c784';
    const accentBrown = getCssVariable('--accent-color-brown') || '#a1887f';
    const accentRed = '#D45D5D';
    
    console.log('Cores carregadas:', { primaryColor, accentGreen, accentBrown, accentRed });

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

    // Função para gerar CSV
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

    // ===========================================
    // Gráfico 1: Biofiltração de Efluentes por Macroalgas
    // ===========================================

    const biofiltrationChartElement = document.getElementById('biofiltrationChart');
    console.log('Elemento do gráfico 1 encontrado:', biofiltrationChartElement);
    
    if (biofiltrationChartElement) {
        try {
            function getDatasetsGrafico1(tipo) {
                const datasets = [];
                if (tipo === 'ambos' || tipo === 'nitrato') {
                    datasets.push({
                        label: 'Remoção de Nitrato (%)',
                        data: dadosGrafico1.nitrato,
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(0, 77, 64, 0.2)',
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
                        borderColor: accentGreen,
                        backgroundColor: 'rgba(129, 199, 132, 0.2)',
                        tension: 0.4,
                        pointStyle: 'rectRot',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    });
                }
                return datasets;
            }

            let biofiltrationChart;
            biofiltrationChart = new Chart(biofiltrationChartElement, {
                type: 'line',
                data: {
                    labels: dadosGrafico1.labels,
                    datasets: getDatasetsGrafico1('ambos')
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
                            font: { size: 18, family: 'Montserrat' }
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
                                font: { size: 14, family: 'Open Sans' }
                            },
                            beginAtZero: true,
                            suggestedMax: 100
                        }
                    }
                }
            });

            // Filtro de variáveis
            const selectGrafico1 = document.getElementById('grafico1-variavel');
            if (selectGrafico1) {
                selectGrafico1.addEventListener('change', (e) => {
                    const tipo = e.target.value;
                    biofiltrationChart.data.datasets = getDatasetsGrafico1(tipo);
                    biofiltrationChart.update();
                });
            }

            // Botão de download CSV
            const btnDownload1 = document.getElementById('download-grafico1');
            if (btnDownload1) {
                btnDownload1.addEventListener('click', () => {
                    const headers = ['Espécie', 'Remoção de Nitrato (%)', 'Remoção de Fosfato (%)'];
                    const rows = dadosGrafico1.labels.map((especie, i) => [especie, dadosGrafico1.nitrato[i], dadosGrafico1.fosfato[i]]);
                    exportarCSV(headers, rows, 'biofiltracao_macroalgas.csv');
                });
            }

        } catch (error) {
            console.error('Erro ao criar o gráfico 1:', error);
        }
    } else {
        console.error('Elemento biofiltrationChart não encontrado');
    }

    // ===========================================
    // Gráfico 2: Qualidade da Água (Bioindicadores)
    // ===========================================

    const waterQualityChartElement = document.getElementById('waterQualityChart');
    console.log('Elemento do gráfico 2 encontrado:', waterQualityChartElement);
    
    if (waterQualityChartElement) {
        try {
            const waterQualityChart = new Chart(waterQualityChartElement, {
                type: 'bar',
                data: {
                    labels: dadosGrafico2.labels,
                    datasets: [{
                        label: 'Índice de Saúde do Ecossistema',
                        data: dadosGrafico2.saude,
                        backgroundColor: [accentRed, accentBrown, accentGreen],
                        borderColor: [accentRed, accentBrown, accentGreen],
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
                            font: { size: 18, family: 'Montserrat' }
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
                                font: { size: 14, family: 'Open Sans' }
                            },
                            suggestedMax: 100
                        }
                    }
                }
            });

            // Botão de download CSV para gráfico 2
            const btnDownload2 = document.getElementById('download-grafico2');
            if (btnDownload2) {
                btnDownload2.addEventListener('click', () => {
                    const headers = ['Ponto de Coleta', 'Índice de Saúde do Ecossistema'];
                    const rows = dadosGrafico2.labels.map((label, i) => [label, dadosGrafico2.saude[i]]);
                    exportarCSV(headers, rows, 'qualidade_agua_suape.csv');
                });
            }

        } catch (error) {
            console.error('Erro ao criar o gráfico 2:', error);
        }
    } else {
        console.error('Elemento waterQualityChart não encontrado');
    }
});
