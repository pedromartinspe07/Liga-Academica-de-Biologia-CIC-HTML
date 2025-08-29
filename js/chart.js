// js/chart.js

console.log('Chart.js script carregado');

// ====================================================================
// Utilitários
// ====================================================================

/**
 * Obtém o valor de uma variável CSS.
 * @param {string} variable O nome da variável CSS (ex: '--primary-color').
 * @returns {string} O valor da variável.
 */
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Retorna um objeto de cores Chart.js baseado no tema atual.
 * @param {boolean} isDarkMode Indica se o tema escuro está ativado.
 * @returns {object} Um objeto com as cores para os gráficos.
 */
function getChartColors(isDarkMode) {
    if (isDarkMode) {
        return {
            primary: getCssVariable('--text-color') || '#e0e0e0',
            secondary: getCssVariable('--tertiary-color') || '#607d8b',
            accentGreen: getCssVariable('--accent-color-light-blue') || '#90caf9',
            accentBrown: '#d4a373',
            accentRed: '#ef5350'
        };
    } else {
        return {
            primary: getCssVariable('--primary-color') || '#004d40',
            secondary: getCssVariable('--secondary-color') || '#37474F',
            accentGreen: getCssVariable('--accent-color-green') || '#81c784',
            accentBrown: getCssVariable('--accent-color-brown') || '#a1887f',
            accentRed: '#D45D5D'
        };
    }
}

/**
 * Cria e configura um gráfico usando Chart.js.
 * @param {string} canvasId O ID do elemento canvas.
 * @param {object} chartData Os dados do gráfico.
 * @param {string} chartType O tipo de gráfico ('bar', 'line', 'pie', etc.).
 * @param {object} chartOptions As opções de configuração do gráfico.
 * @returns {Chart|null} O objeto do gráfico criado ou null se houver um erro.
 */
function createChart(canvasId, chartData, chartType, chartOptions) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`Elemento com ID '${canvasId}' não encontrado. Gráfico não será criado.`);
        return null;
    }
    try {
        return new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    } catch (error) {
        console.error(`Erro ao criar o gráfico para '${canvasId}':`, error);
        return null;
    }
}

/**
 * Exporta dados de uma tabela para um arquivo CSV.
 * @param {string[]} headers Os cabeçalhos da tabela.
 * @param {any[][]} rows As linhas de dados.
 * @param {string} fileName O nome do arquivo a ser exportado.
 */
function exportarCSV(headers, rows, fileName) {
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ====================================================================
// Dados Simulados
// ====================================================================

const chartData = {
    'chart3Ano': {
        labels: ['Cais', 'Estuário Interno', 'Manguezal'],
        indicadores: [
            { label: 'Oxigênio Dissolvido (mg/L)', data: [4.5, 3.2, 6.8], key: 'oxigenio' },
            { label: 'pH', data: [7.8, 7.1, 7.5], key: 'ph' },
            { label: 'Coliformes Fecais (NMP/100mL)', data: [1200, 2500, 450], key: 'coliformes' }
        ],
        type: 'bar',
        title: 'Bioindicadores da Qualidade da Água em Suape',
        yAxisTitle: 'Valores por Localização',
        fileName: 'bioindicadores_suape.csv'
    },
    'chart2AnoA': {
        labels: ['2000-2005', '2005-2010', '2010-2015', '2015-2020'],
        registros: [2, 5, 12, 25],
        type: 'line',
        title: 'Incidência de Tubarões em Anos Recentes',
        yAxisTitle: 'Número de Registros',
        fileName: 'ocorrencia_tubaroes_suape.csv'
    },
    'chart2AnoB': {
        labels: ['Cobertura de Saneamento Básico (%)', 'Incidência de Doenças Hídricas (casos/1000 hab)'],
        pre_saneamento: [15, 80],
        pos_saneamento: [75, 12],
        type: 'bar',
        title: 'Impacto do Saneamento em Tatuoquinha',
        yAxisTitle: 'Percentual / Casos por 1000 hab',
        fileName: 'saneamento_tatuoquinha.csv'
    },
    'chart1Ano': {
        labels: ['Tratamento Convencional', 'S. Latifolia', 'U. Lactuca'],
        remocao: [25, 65, 85],
        type: 'bar',
        title: 'Eficiência de Biofiltração de Efluentes',
        yAxisTitle: 'Eficiência de Remoção (%)',
        fileName: 'biofiltracao_macroalgas.csv'
    },
    'chart4Ano': {
        labels: ['Sargassum', 'Fucus', 'Laminaria', 'Macrocystis'],
        distribuicao: [45, 30, 15, 10],
        type: 'doughnut',
        title: 'Distribuição de Algas Marrons em Suape',
        fileName: 'distribuicao_algas.csv'
    }
};

let charts = {};

function renderCharts() {
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const colors = getChartColors(isDarkMode);

    // Destruir gráficos existentes antes de renderizar novamente
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {}; // Resetar o objeto de gráficos

    // ===========================================
    // Gráfico 1: 3º Ano - Bioindicadores
    // ===========================================
    charts.chart3Ano = createChart('chart3Ano', {
        labels: chartData.chart3Ano.labels,
        datasets: chartData.chart3Ano.indicadores.map(indicador => ({
            label: indicador.label,
            data: indicador.data,
            backgroundColor: indicador.key === 'coliformes' ? colors.accentRed : (indicador.key === 'oxigenio' ? colors.primary : colors.accentGreen),
            borderColor: 'white',
            borderWidth: 1
        }))
    }, 'bar', {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: chartData.chart3Ano.title, font: { size: 18, family: 'Montserrat' } },
            legend: {
                labels: {
                    color: colors.primary // Cor do texto da legenda
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: chartData.chart3Ano.yAxisTitle, font: { size: 14, family: 'Open Sans' }, color: colors.primary },
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            },
            x: {
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            }
        }
    });

    // ===========================================
    // Gráfico 2: 2º Ano A - Tubarões
    // ===========================================
    charts.chart2AnoA = createChart('chart2AnoA', {
        labels: chartData.chart2AnoA.labels,
        datasets: [{
            label: 'Número de Registros de Tubarões',
            data: chartData.chart2AnoA.registros,
            borderColor: colors.primary,
            backgroundColor: colors.primary + '40',
            tension: 0.4,
            pointStyle: 'circle',
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    }, 'line', {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: chartData.chart2AnoA.title, font: { size: 18, family: 'Montserrat' } },
            legend: {
                labels: {
                    color: colors.primary
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: chartData.chart2AnoA.yAxisTitle, font: { size: 14, family: 'Open Sans' }, color: colors.primary },
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            },
            x: {
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            }
        }
    });

    // ===========================================
    // Gráfico 3: 2º Ano B - Saneamento
    // ===========================================
    charts.chart2AnoB = createChart('chart2AnoB', {
        labels: chartData.chart2AnoB.labels,
        datasets: [{
            label: 'Antes do Saneamento',
            data: chartData.chart2AnoB.pre_saneamento,
            backgroundColor: colors.accentBrown,
        }, {
            label: 'Após o Saneamento',
            data: chartData.chart2AnoB.pos_saneamento,
            backgroundColor: colors.accentGreen,
        }]
    }, 'bar', {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: chartData.chart2AnoB.title, font: { size: 18, family: 'Montserrat' } },
            legend: {
                labels: {
                    color: colors.primary
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: chartData.chart2AnoB.yAxisTitle, font: { size: 14, family: 'Open Sans' }, color: colors.primary },
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            },
            x: {
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            }
        }
    });

    // ===========================================
    // Gráfico 4: 1º Ano - Biofiltração
    // ===========================================
    charts.chart1Ano = createChart('chart1Ano', {
        labels: chartData.chart1Ano.labels,
        datasets: [{
            label: 'Eficiência de Remoção de Nitratos (%)',
            data: chartData.chart1Ano.remocao,
            backgroundColor: [colors.secondary, colors.accentGreen, colors.primary],
            borderColor: 'white',
            borderWidth: 1
        }]
    }, 'bar', {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: chartData.chart1Ano.title, font: { size: 18, family: 'Montserrat' } },
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
                title: { display: true, text: chartData.chart1Ano.yAxisTitle, font: { size: 14, family: 'Open Sans' }, color: colors.primary },
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            },
            x: {
                ticks: { color: colors.primary },
                grid: { color: colors.secondary + '40' }
            }
        }
    });
    
    // ===========================================
    // Gráfico 5: Novo Gráfico - Distribuição de Algas Marrons
    // ===========================================
    charts.chart4Ano = createChart('chart4Ano', {
        labels: chartData.chart4Ano.labels,
        datasets: [{
            label: chartData.chart4Ano.title,
            data: chartData.chart4Ano.distribuicao,
            backgroundColor: [colors.primary, colors.accentGreen, colors.accentBrown, colors.secondary],
            hoverOffset: 4
        }]
    }, 'doughnut', {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: chartData.chart4Ano.title, font: { size: 18, family: 'Montserrat' } },
            legend: {
                position: 'bottom',
                labels: {
                    color: colors.primary
                }
            }
        }
    });

    // Event listeners para os botões de download
    document.querySelectorAll('[id^="download-chart"]').forEach(button => {
        const chartId = button.id.replace('download-chart', '');
        button.addEventListener('click', () => {
            const data = chartData[chartId];
            if (data) {
                const headers = ['Período', 'Número de Registros de Tubarões'];
                const rows = data.labels.map((label, i) => [label, data.registros[i]]);
                exportarCSV(headers, rows, data.fileName);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando gráficos...');
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado. Verifique a referência do CDN.');
        return;
    }

    renderCharts();

    // Event listener para o botão de alternância de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.documentElement.classList.toggle('dark-mode');
            renderCharts();
        });
    }
});
