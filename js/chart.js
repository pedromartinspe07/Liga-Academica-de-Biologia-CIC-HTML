// js/chart.js

console.log('Chart.js script carregado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando Chart.js...');
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado. Verifique a referência do CDN.');
        return;
    }
    
    console.log('Chart.js disponível, inicializando gráficos...');
    
    function getCssVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }

    const primaryColor = getCssVariable('--primary-color') || '#004d40';
    const accentGreen = getCssVariable('--accent-color-green') || '#81c784';
    const accentBrown = getCssVariable('--accent-color-brown') || '#a1887f';
    const accentRed = '#D45D5D';
    const secondaryColor = getCssVariable('--secondary-color') || '#37474F';
    
    console.log('Cores carregadas:', { primaryColor, accentGreen, accentBrown, accentRed, secondaryColor });

    // Dados Simulados para os Gráficos
    const dados3Ano = {
        labels: ['Cais', 'Estuário Interno', 'Manguezal'],
        indicadores: [
            { label: 'Oxigênio Dissolvido (mg/L)', data: [4.5, 3.2, 6.8], color: primaryColor },
            { label: 'pH', data: [7.8, 7.1, 7.5], color: accentGreen },
            { label: 'Coliformes Fecais (NMP/100mL)', data: [1200, 2500, 450], color: accentRed }
        ]
    };

    const dados2AnoA = {
        labels: ['2000-2005', '2005-2010', '2010-2015', '2015-2020'],
        registros: [2, 5, 12, 25]
    };
    
    const dados2AnoB = {
        labels: ['Cobertura de Saneamento Básico (%)', 'Incidência de Doenças Hídricas (casos/1000 hab)'],
        pre_saneamento: [15, 80],
        pos_saneamento: [75, 12]
    };
    
    const dados1Ano = {
        labels: ['Tratamento Convencional', 'S. Latifolia', 'U. Lactuca'],
        remocao: [25, 65, 85]
    };

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
    // Gráfico 1: 3º Ano - Bioindicadores da Qualidade da Água
    // ===========================================

    const chart3AnoElement = document.getElementById('chart3Ano');
    if (chart3AnoElement) {
        try {
            new Chart(chart3AnoElement, {
                type: 'bar',
                data: {
                    labels: dados3Ano.labels,
                    datasets: dados3Ano.indicadores.map(indicador => ({
                        label: indicador.label,
                        data: indicador.data,
                        backgroundColor: indicador.color,
                        borderColor: 'white',
                        borderWidth: 1
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Bioindicadores da Qualidade da Água em Suape',
                            font: { size: 18, family: 'Montserrat' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Valores por Localização',
                                font: { size: 14, family: 'Open Sans' }
                            }
                        }
                    }
                }
            });
            const btnDownload3Ano = document.getElementById('download-chart3Ano');
            if (btnDownload3Ano) {
                btnDownload3Ano.addEventListener('click', () => {
                    const headers = ['Local', 'Oxigênio Dissolvido (mg/L)', 'pH', 'Coliformes Fecais (NMP/100mL)'];
                    const rows = dados3Ano.labels.map((label, i) => [
                        label,
                        dados3Ano.indicadores[0].data[i],
                        dados3Ano.indicadores[1].data[i],
                        dados3Ano.indicadores[2].data[i]
                    ]);
                    exportarCSV(headers, rows, 'bioindicadores_suape.csv');
                });
            }
        } catch (error) {
            console.error('Erro ao criar o gráfico do 3º ano:', error);
        }
    }

    // ===========================================
    // Gráfico 2: 2º Ano A - Ocorrência de Tubarões
    // ===========================================
    
    const chart2AnoAElement = document.getElementById('chart2AnoA');
    if (chart2AnoAElement) {
        try {
            new Chart(chart2AnoAElement, {
                type: 'line',
                data: {
                    labels: dados2AnoA.labels,
                    datasets: [{
                        label: 'Número de Registros de Tubarões',
                        data: dados2AnoA.registros,
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(0, 77, 64, 0.2)',
                        tension: 0.4,
                        pointStyle: 'circle',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Incidência de Tubarões em Anos Recentes',
                            font: { size: 18, family: 'Montserrat' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Número de Registros',
                                font: { size: 14, family: 'Open Sans' }
                            }
                        }
                    }
                }
            });
            const btnDownload2AnoA = document.getElementById('download-chart2AnoA');
            if (btnDownload2AnoA) {
                btnDownload2AnoA.addEventListener('click', () => {
                    const headers = ['Período', 'Número de Registros de Tubarões'];
                    const rows = dados2AnoA.labels.map((label, i) => [label, dados2AnoA.registros[i]]);
                    exportarCSV(headers, rows, 'ocorrencia_tubaroes_suape.csv');
                });
            }
        } catch (error) {
            console.error('Erro ao criar o gráfico do 2º ano A:', error);
        }
    }

    // ===========================================
    // Gráfico 3: 2º Ano B - Impacto do Saneamento Básico
    // ===========================================
    
    const chart2AnoBElement = document.getElementById('chart2AnoB');
    if (chart2AnoBElement) {
        try {
            new Chart(chart2AnoBElement, {
                type: 'bar',
                data: {
                    labels: dados2AnoB.labels,
                    datasets: [{
                        label: 'Antes do Saneamento',
                        data: dados2AnoB.pre_saneamento,
                        backgroundColor: accentBrown,
                    }, {
                        label: 'Após o Saneamento',
                        data: dados2AnoB.pos_saneamento,
                        backgroundColor: accentGreen,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Impacto do Saneamento em Tatuoquinha',
                            font: { size: 18, family: 'Montserrat' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Percentual / Casos por 1000 hab',
                                font: { size: 14, family: 'Open Sans' }
                            }
                        }
                    }
                }
            });
            const btnDownload2AnoB = document.getElementById('download-chart2AnoB');
            if (btnDownload2AnoB) {
                btnDownload2AnoB.addEventListener('click', () => {
                    const headers = ['Indicador', 'Antes do Saneamento', 'Após o Saneamento'];
                    const rows = dados2AnoB.labels.map((label, i) => [label, dados2AnoB.pre_saneamento[i], dados2AnoB.pos_saneamento[i]]);
                    exportarCSV(headers, rows, 'saneamento_tatuoquinha.csv');
                });
            }
        } catch (error) {
            console.error('Erro ao criar o gráfico do 2º ano B:', error);
        }
    }
    
    // ===========================================
    // Gráfico 4: 1º Ano - Biofiltração com Macroalgas
    // ===========================================

    const chart1AnoElement = document.getElementById('chart1Ano');
    if (chart1AnoElement) {
        try {
            new Chart(chart1AnoElement, {
                type: 'bar',
                data: {
                    labels: dados1Ano.labels,
                    datasets: [{
                        label: 'Eficiência de Remoção de Nitratos (%)',
                        data: dados1Ano.remocao,
                        backgroundColor: [secondaryColor, accentGreen, primaryColor],
                        borderColor: 'white',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Eficiência de Biofiltração de Efluentes',
                            font: { size: 18, family: 'Montserrat' }
                        },
                        legend: { display: false },
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
                            max: 100,
                            title: {
                                display: true,
                                text: 'Eficiência de Remoção (%)',
                                font: { size: 14, family: 'Open Sans' }
                            }
                        }
                    }
                }
            });
            const btnDownload1Ano = document.getElementById('download-chart1Ano');
            if (btnDownload1Ano) {
                btnDownload1Ano.addEventListener('click', () => {
                    const headers = ['Método', 'Eficiência de Remoção de Nitratos (%)'];
                    const rows = dados1Ano.labels.map((label, i) => [label, dados1Ano.remocao[i]]);
                    exportarCSV(headers, rows, 'biofiltracao_macroalgas.csv');
                });
            }
        } catch (error) {
            console.error('Erro ao criar o gráfico do 1º ano:', error);
        }
    }
});