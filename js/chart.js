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

    // Dados originais dos gráficos, adaptados para os novos temas
    const dadosGrafico1 = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        fitoplancton: [2000, 2500, 3200, 3500, 4100, 4500],
        nitratos: [50, 65, 80, 85, 95, 110]
    };

    const dadosGrafico2 = {
        labels: ['S. filiforme', 'U. lactuca', 'O. secunda', 'L. obtusa'],
        remocao: [75, 92, 88, 80]
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
    // Gráfico 1: Bioindicadores da Qualidade da Água
    // ===========================================

    const airPollutionChartElement = document.getElementById('airPollutionChart');
    console.log('Elemento do gráfico 1 encontrado:', airPollutionChartElement);
    
    if (airPollutionChartElement) {
        try {
            function getDatasetsGrafico1(tipo) {
                const datasets = [];
                if (tipo === 'ambos' || tipo === 'nitratos') {
                    datasets.push({
                        label: 'Nitratos (µmol/L)',
                        data: dadosGrafico1.nitratos,
                        borderColor: accentRed,
                        backgroundColor: 'rgba(212, 93, 93, 0.2)',
                        yAxisID: 'y',
                        tension: 0.4,
                        pointStyle: 'circle',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    });
                }
                if (tipo === 'ambos' || tipo === 'fitoplancton') {
                    datasets.push({
                        label: 'Densidade de Fitoplâncton (cels/mL)',
                        data: dadosGrafico1.fitoplancton,
                        borderColor: primaryColor,
                        backgroundColor: primaryColor,
                        yAxisID: 'y1',
                        tension: 0.4,
                        pointStyle: 'rectRot',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    });
                }
                return datasets;
            }

            let pollutionChart;
            pollutionChart = new Chart(airPollutionChartElement, {
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
                            text: 'Qualidade da Água: Nitratos vs. Fitoplâncton',
                            font: { size: 18, family: 'Montserrat' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.dataset.label.includes('Nitratos')) {
                                        label += `${context.parsed.y} µmol/L`;
                                    } else {
                                        label += `${context.parsed.y} cels/mL`;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Nitratos (µmol/L)',
                                font: { size: 14, family: 'Open Sans' }
                            },
                            beginAtZero: true
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false,
                            },
                            title: {
                                display: true,
                                text: 'Densidade de Fitoplâncton (cels/mL)',
                                font: { size: 14, family: 'Open Sans' }
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

            // Filtro de variáveis
            const selectGrafico1 = document.getElementById('grafico1-variavel');
            if (selectGrafico1) {
                selectGrafico1.addEventListener('change', (e) => {
                    const tipo = e.target.value;
                    pollutionChart.data.datasets = getDatasetsGrafico1(tipo);
                    pollutionChart.update();
                });
            }

            // Botão de download CSV
            const btnDownload1 = document.getElementById('download-grafico1');
            if (btnDownload1) {
                btnDownload1.addEventListener('click', () => {
                    const headers = ['Mês'];
                    const rows = dadosGrafico1.labels.map((mes, i) => [mes]);
                    if (selectGrafico1.value === 'ambos' || selectGrafico1.value === 'fitoplancton') {
                        headers.push('Densidade de Fitoplâncton (cels/mL)');
                        rows.forEach((row, i) => row.push(dadosGrafico1.fitoplancton[i]));
                    }
                    if (selectGrafico1.value === 'ambos' || selectGrafico1.value === 'nitratos') {
                        headers.push('Nitratos (µmol/L)');
                        rows.forEach((row, i) => row.push(dadosGrafico1.nitratos[i]));
                    }
                    exportarCSV(headers, rows, 'grafico1_bioindicadores.csv');
                });
            }

        } catch (error) {
            console.error('Erro ao criar o gráfico 1:', error);
        }
    } else {
        console.error('Elemento airPollutionChart não encontrado');
    }

    // ===========================================
    // Gráfico 2: Eficiência da Biofiltração de Efluentes por Macroalgas
    // ===========================================

    const mangroveChartElement = document.getElementById('mangroveChart');
    console.log('Elemento do gráfico 2 encontrado:', mangroveChartElement);
    
    if (mangroveChartElement) {
        try {
            const mangroveChart = new Chart(mangroveChartElement, {
                type: 'bar',
                data: {
                    labels: dadosGrafico2.labels,
                    datasets: [{
                        label: 'Eficiência de Remoção de Poluentes',
                        data: dadosGrafico2.remocao,
                        backgroundColor: [accentGreen, primaryColor, accentBrown, accentRed],
                        borderColor: [accentGreen, primaryColor, accentBrown, accentRed],
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
                            text: 'Eficiência de Macroalgas na Remediação de Efluentes',
                            font: { size: 18, family: 'Montserrat' }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Eficiência de Remoção (%)',
                                font: { size: 14, family: 'Open Sans' }
                            },
                            max: 100
                        }
                    }
                }
            });

            // Botão de download CSV para gráfico 2
            const btnDownload2 = document.getElementById('download-grafico2');
            if (btnDownload2) {
                btnDownload2.addEventListener('click', () => {
                    const headers = ['Espécie de Macroalga', 'Eficiência de Remoção (%)'];
                    const rows = dadosGrafico2.labels.map((label, i) => [label, dadosGrafico2.remocao[i]]);
                    exportarCSV(headers, rows, 'grafico2_biofiltracao.csv');
                });
            }

        } catch (error) {
            console.error('Erro ao criar o gráfico 2:', error);
        }
    } else {
        console.error('Elemento mangroveChart não encontrado');
    }
});