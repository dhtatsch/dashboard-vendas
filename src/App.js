import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// Dados mockados foram reincorporados diretamente aqui para resolver o erro de importação.
// Eles estavam em './data/salesData.json' anteriormente.
const initialAllSalesData = {
  "2024": {
    "monthlyData": [
      { "month": "Jan", "target": 9000, "achieved": 8800 },
      { "month": "Fev", "target": 9500, "achieved": 9200 },
      { "month": "Mar", "target": 10000, "achieved": 10100 },
      { "month": "Abr", "target": 9200, "achieved": 8900 },
      { "month": "Mai", "target": 10000, "achieved": 9800 },
      { "month": "Jun", "target": 10500, "achieved": 10700 },
      { "month": "Jul", "target": 11000, "achieved": 10500 },
      { "month": "Ago", "target": 10800, "achieved": 10200 },
      { "month": "Set", "target": 11500, "achieved": 11800 },
      { "month": "Out", "target": 12000, "achieved": 11500 },
      { "month": "Nov", "target": 12500, "achieved": 12700 },
      { "month": "Dez", "target": 13000, "achieved": 13200 }
    ],
    "yearlyData": {
      "target": 129000,
      "achieved": 127400
    }
  },
  "2025": {
    "monthlyData": [
      { "month": "Jan", "target": 10000, "achieved": 9500 },
      { "month": "Fev", "target": 11000, "achieved": 10500 },
      { "month": "Mar", "target": 12000, "achieved": 12200 },
      { "month": "Abr", "target": 10500, "achieved": 9800 },
      { "month": "Mai", "target": 11500, "achieved": 11000 },
      { "month": "Jun", "target": 12500, "achieved": 12800 },
      { "month": "Jul", "target": 13000, "achieved": 2300 },
      { "month": "Ago", "target": 12000, "achieved": 0 },
      { "month": "Set", "target": 13500, "achieved": 0 },
      { "month": "Out", "target": 14000, "achieved": 0 },
      { "month": "Nov", "target": 15000, "achieved": 0 },
      { "month": "Dez", "target": 16000, "achieved": 0 }
    ],
    "yearlyData": {
      "target": 151000,
      "achieved": 65800
    }
  },
  "2026": {
    "monthlyData": [
      { "month": "Jan", "target": 10500, "achieved": 0 },
      { "month": "Fev", "target": 11500, "achieved": 0 },
      { "month": "Mar", "target": 12500, "achieved": 0 },
      { "month": "Abr", "target": 11000, "achieved": 0 },
      { "month": "Mai", "target": 12000, "achieved": 0 },
      { "month": "Jun", "target": 13000, "achieved": 0 },
      { "month": "Jul", "target": 13500, "achieved": 0 },
      { "month": "Ago", "target": 12500, "achieved": 0 },
      { "month": "Set", "target": 14000, "achieved": 0 },
      { "month": "Out", "target": 14500, "achieved": 0 },
      { "month": "Nov", "target": 15500, "achieved": 0 },
      { "month": "Dez", "target": 16500, "achieved": 0 }
    ],
    "yearlyData": {
      "target": 157000,
      "achieved": 0
    }
  }
};

// Paleta de cores solicitada: roxo, azul e branco
const colors = {
  primary: '#86529b', // Roxo principal
  secondary: '#2d98d5', // Azul vibrante
  white: '#ffffff',
  textDark: '#333333', // Para texto escuro e legível
  grayLight: '#f0f4f8', // Fundo geral mais claro
  backgroundSection: '#f8faff', // Fundo para as seções dos gráficos e formulário
  grayMedium: '#d8d8d8', // Para linhas de grade e elementos neutros
};

// Função auxiliar para gerar dados diários mockados
// Esta função agora é chamada para enriquecer os dados carregados do JSON
const generateDailyData = (monthIndex, year, monthlyTarget, monthlyAchieved) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dailyData = [];
  let accumulated = 0;
  const today = new Date();
  const currentDayOfMonth = (today.getFullYear() === year && today.getMonth() === monthIndex) ? today.getDate() : 0;

  // Distribui o 'monthlyAchieved' de forma proporcional ou com alguma aleatoriedade
  // para os dias passados do mês.
  let remainingAchieved = monthlyAchieved;
  let remainingDaysToDistribute = currentDayOfMonth;

  for (let day = 1; day <= daysInMonth; day++) {
    let dailyAchieved = 0;
    if (day <= currentDayOfMonth) {
      if (remainingDaysToDistribute > 0) {
        // Distribui o restante do achieved de forma mais uniforme
        dailyAchieved = Math.floor(remainingAchieved / remainingDaysToDistribute);
        // Adiciona um pouco de aleatoriedade para os primeiros dias, mas garante que o total seja respeitado
        if (day <= currentDayOfMonth - 1) { // Para não afetar o último dia de distribuição
          dailyAchieved = Math.max(0, Math.round(dailyAchieved * (0.8 + Math.random() * 0.4)));
        }
      }
    }
    accumulated += dailyAchieved;
    remainingAchieved -= dailyAchieved;
    remainingDaysToDistribute--;

    dailyData.push({ day, dailyAchieved, accumulatedAchieved: accumulated });
  }

  // Ajusta o último dia para garantir que o total 'monthlyAchieved' seja exato
  if (dailyData.length > 0) {
    const lastDayIndex = dailyData.length - 1;
    const currentSum = dailyData.reduce((sum, d) => d.dailyAchieved + sum, 0);
    const difference = monthlyAchieved - currentSum;
    dailyData[lastDayIndex].dailyAchieved += difference;
    // Recalcula o acumulado do último dia
    dailyData[lastDayIndex].accumulatedAchieved = dailyData.slice(0, lastDayIndex + 1).reduce((sum, d) => d.dailyAchieved + sum, 0);
  }


  return dailyData;
};


// Componente principal do aplicativo
const App = () => {
  const [allSalesData, setAllSalesData] = useState({});
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [salesData, setSalesData] = useState(null); // Dados do ano selecionado
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // Mês inicial, ajustado após carregar salesData
  const [selectedDay, setSelectedDay] = useState(1); // Novo estado para o dia selecionado
  const [newMonthlyTarget, setNewMonthlyTarget] = useState('');
  const [newDailyAchieved, setNewDailyAchieved] = useState(''); // Novo estado para vendas diárias
  const [newAnnualTarget, setNewAnnualTarget] = useState('');
  const [newAnnualAchieved, setNewAnnualAchieved] = useState('');
  const [message, setMessage] = useState(''); // Para mensagens de feedback ao usuário
  const [showEditForm, setShowEditForm] = useState(false); // Estado para controlar a visibilidade do formulário de edição

  useEffect(() => {
    // Processa os dados iniciais do JSON para adicionar dailyData e recalcular achieved
    const processedSalesData = {};
    for (const year in initialAllSalesData) {
      const yearData = { ...initialAllSalesData[year] };
      yearData.monthlyData = yearData.monthlyData.map((monthData, index) => {
        const dailyData = generateDailyData(index, parseInt(year), monthData.target, monthData.achieved);
        const totalAchievedForMonth = dailyData.reduce((sum, day) => sum + day.dailyAchieved, 0);
        return {
          ...monthData,
          dailyData: dailyData,
          achieved: totalAchievedForMonth // Garante que achieved reflita a soma dos dailyAchieved
        };
      });

      // Recalcula o total anual com base nos novos dados mensais processados
      const recalculatedAchievedAnnual = yearData.monthlyData.reduce((sum, month) => sum + month.achieved, 0);
      const recalculatedTargetAnnual = yearData.monthlyData.reduce((sum, month) => sum + month.target, 0);
      yearData.yearlyData = {
        target: recalculatedTargetAnnual,
        achieved: recalculatedAchievedAnnual
      };

      processedSalesData[year] = yearData;
    }
    setAllSalesData(processedSalesData);
    // Define o ano inicial como o ano atual
    setSelectedYear(currentYear);
  }, []); // Executa apenas uma vez no montagem

  // Atualiza os dados de vendas exibidos quando o ano selecionado muda
  useEffect(() => {
    if (allSalesData[selectedYear]) {
      setSalesData(allSalesData[selectedYear]);
      // Resetar o mês e dia selecionado para o mês/dia atual do ano selecionado ou 0/1
      const today = new Date();
      const monthIndex = today.getMonth();
      const dayOfMonth = today.getDate();

      if (selectedYear === today.getFullYear().toString() && monthIndex < allSalesData[selectedYear].monthlyData.length) {
        setSelectedMonthIndex(monthIndex);
        setSelectedDay(dayOfMonth);
      } else {
        setSelectedMonthIndex(0);
        setSelectedDay(1);
      }
    }
  }, [selectedYear, allSalesData]);

  // Atualiza os campos de entrada do formulário mensal quando o mês/dia selecionado ou os dados de vendas mudam
  useEffect(() => {
    if (salesData && salesData.monthlyData[selectedMonthIndex]) {
      setNewMonthlyTarget(salesData.monthlyData[selectedMonthIndex].target);
      const dailyEntry = salesData.monthlyData[selectedMonthIndex].dailyData.find(d => d.day === selectedDay);
      setNewDailyAchieved(dailyEntry ? dailyEntry.dailyAchieved : 0);
    }
  }, [selectedMonthIndex, selectedDay, salesData]);

  if (!salesData) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.grayLight }}>
        <p className={`text-lg text-[${colors.textDark}]`}>Carregando dados...</p>
      </div>
    );
  }

  // Calcula os dados para o gráfico de velocímetro mensal
  const currentMonthData = salesData.monthlyData[selectedMonthIndex];
  const monthlySpeedometerData = [
    {
      name: 'Meta Mensal',
      value: currentMonthData.achieved,
      fill: colors.secondary
    },
    {
      name: 'Restante',
      value: Math.max(0, currentMonthData.target - currentMonthData.achieved),
      fill: colors.primary // Alterado para a cor roxa
    }
  ];

  // Calcula os dados para o gráfico de velocímetro anual
  const yearlySpeedometerData = [
    {
      name: 'Meta Anual',
      value: salesData.yearlyData.achieved,
      fill: colors.secondary
    },
    {
      name: 'Restante',
      value: Math.max(0, salesData.yearlyData.target - salesData.yearlyData.achieved),
      fill: colors.primary // Alterado para a cor roxa
    }
  ];

  // Função para lidar com a atualização dos dados mensais (incluindo diários)
  const handleMonthlyUpdate = (e) => {
    e.preventDefault();
    // Cria uma cópia profunda dos dados para garantir imutabilidade
    const updatedAllSalesData = JSON.parse(JSON.stringify(allSalesData));
    const yearToUpdate = updatedAllSalesData[selectedYear];
    const monthToUpdate = yearToUpdate.monthlyData[selectedMonthIndex];

    // Atualiza a meta mensal
    monthToUpdate.target = parseFloat(newMonthlyTarget);

    // Atualiza o dailyAchieved para o dia selecionado
    const dailyEntryIndex = monthToUpdate.dailyData.findIndex(d => d.day === selectedDay);
    if (dailyEntryIndex !== -1) {
      monthToUpdate.dailyData[dailyEntryIndex].dailyAchieved = parseFloat(newDailyAchieved);
    }

    // Recalcula o accumulatedAchieved para todos os dias a partir do dia atualizado
    let currentAccumulated = 0;
    for (let i = 0; i < monthToUpdate.dailyData.length; i++) {
      currentAccumulated += monthToUpdate.dailyData[i].dailyAchieved;
      monthToUpdate.dailyData[i].accumulatedAchieved = currentAccumulated;
    }

    monthToUpdate.achieved = currentAccumulated; // Atualiza o total alcançado do mês

    // Recalcula o total anual com base nos novos dados mensais
    const recalculatedAchievedAnnual = yearToUpdate.monthlyData.reduce((sum, month) => sum + month.achieved, 0);
    const recalculatedTargetAnnual = yearToUpdate.monthlyData.reduce((sum, month) => sum + month.target, 0);

    yearToUpdate.yearlyData = {
      target: recalculatedTargetAnnual,
      achieved: recalculatedAchievedAnnual
    };

    setAllSalesData(updatedAllSalesData);

    setMessage('Metas mensais e diárias atualizadas com sucesso!');
    setTimeout(() => setMessage(''), 3000); // Limpa a mensagem após 3 segundos
  };

  // Função para lidar com a atualização dos dados anuais
  const handleAnnualUpdate = (e) => {
    e.preventDefault();
    // Cria uma cópia profunda dos dados para garantir imutabilidade
    const updatedAllSalesData = JSON.parse(JSON.stringify(allSalesData));
    const yearToUpdate = updatedAllSalesData[selectedYear];

    yearToUpdate.yearlyData = {
      target: parseFloat(newAnnualTarget) || yearToUpdate.yearlyData.target,
      achieved: parseFloat(newAnnualAchieved) || yearToUpdate.yearlyData.achieved
    };

    setAllSalesData(updatedAllSalesData);
    setMessage('Metas anuais atualizadas com sucesso!');
    setTimeout(() => setMessage(''), 3000); // Limpa a mensagem após 3 segundos
  };

  // Obter o número de dias no mês selecionado para o dropdown de dias
  const daysInSelectedMonth = salesData.monthlyData[selectedMonthIndex]
    ? salesData.monthlyData[selectedMonthIndex].dailyData.length
    : 0;

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans`} style={{ backgroundColor: colors.grayLight }}>
      <div className={`max-w-7xl mx-auto bg-[${colors.white}] rounded-lg shadow-xl p-6 sm:p-8 relative`}>
        {/* Logo e Título centralizados */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img
            src="https://www.meuresiduo.com/wp-content/uploads/elementor/thumbs/meuresiduo-site-qquxpzcy5kvhbla7dyuea6pr6zctl421no3scoosuw.webp"
            alt="Logo Meu Resíduo"
            className="h-10 sm:h-12 mb-2 rounded-md"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/cccccc/333333?text=Logo"; }}
          />
          <h1 className={`text-3xl sm:text-4xl font-bold text-center text-[${colors.textDark}]`}>
            Dashboard de Metas de Vendas
          </h1>
          {/* Seletor de Ano e Mês */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <div className="flex-1 min-w-0 sm:min-w-[150px]">
              <label htmlFor="year-select" className={`block text-sm font-medium text-[${colors.textDark}] mb-2 text-center`}>
                Selecionar Ano:
              </label>
              <select
                id="year-select"
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {Object.keys(allSalesData).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0 sm:min-w-[150px]">
              <label htmlFor="month-filter-select" className={`block text-sm font-medium text-[${colors.textDark}] mb-2 text-center`}>
                Filtrar Mês (Velocímetro):
              </label>
              <select
                id="month-filter-select"
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value))}
              >
                {salesData.monthlyData.map((data, index) => (
                  <option key={index} value={index}>
                    {data.month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-center" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {/* Floating Action Button para abrir o formulário de edição */}
        {!showEditForm && (
          <button
            onClick={() => setShowEditForm(true)}
            className={`fixed bottom-8 right-8 bg-[${colors.primary}] text-[${colors.white}] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[${colors.secondary}] transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[${colors.secondary}] focus:ring-opacity-75`}
            title="Cadastrar/Alterar Metas"
          >
            {/* Ícone de lápis ou engrenagem para indicar edição */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Seção de Gerenciamento de Metas (condicionalmente renderizada) */}
        {showEditForm && (
          <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md mb-10`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-semibold text-[${colors.primary}]`}>
                Gerenciar Metas para {selectedYear}
              </h2>
              <button
                onClick={() => setShowEditForm(false)}
                className={`bg-gray-300 text-[${colors.textDark}] py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out shadow-sm`}
              >
                Voltar ao Dashboard
              </button>
            </div>

            {/* Formulário de Metas Mensais (com edição diária) */}
            <form onSubmit={handleMonthlyUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg">
              <h3 className={`text-xl font-medium text-[${colors.textDark}] mb-4`}>Atualizar Meta Mensal e Vendas Diárias</h3>
              <div className="mb-4">
                <label htmlFor="month-select-edit" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Selecionar Mês:
                </label>
                <select
                  id="month-select-edit"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={selectedMonthIndex}
                  onChange={(e) => {
                    setSelectedMonthIndex(parseInt(e.target.value));
                    setSelectedDay(1); // Resetar o dia para 1 ao mudar o mês
                  }}
                >
                  {salesData.monthlyData.map((data, index) => (
                    <option key={index} value={index}>
                      {data.month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="day-select-edit" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Selecionar Dia:
                </label>
                <select
                  id="day-select-edit"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                >
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Dia {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="monthly-target" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Meta Mensal (R$):
                </label>
                <input
                  type="number"
                  id="monthly-target"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={newMonthlyTarget}
                  onChange={(e) => setNewMonthlyTarget(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="daily-achieved" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Alcançado Diário (R$):
                </label>
                <input
                  type="number"
                  id="daily-achieved"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={newDailyAchieved}
                  onChange={(e) => setNewDailyAchieved(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-[${colors.primary}] text-[${colors.white}] py-2 px-4 rounded-md hover:bg-[${colors.secondary}] transition duration-300 ease-in-out shadow-md`}
              >
                Atualizar Meta Mensal e Diária
              </button>
            </form>

            {/* Formulário de Metas Anuais */}
            <form onSubmit={handleAnnualUpdate} className="p-4 border border-gray-200 rounded-lg">
              <h3 className={`text-xl font-medium text-[${colors.textDark}] mb-4`}>Atualizar Meta Anual</h3>
              <div className="mb-4">
                <label htmlFor="annual-target" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Meta Anual (R$):
                </label>
                <input
                  type="number"
                  id="annual-target"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={newAnnualTarget}
                  onChange={(e) => setNewAnnualTarget(e.target.value)}
                  placeholder={salesData.yearlyData.target.toLocaleString('pt-BR')}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="annual-achieved" className={`block text-sm font-medium text-[${colors.textDark}] mb-2`}>
                  Alcançado Anual (R$):
                </label>
                <input
                  type="number"
                  id="annual-achieved"
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${colors.secondary}] focus:border-[${colors.secondary}]`}
                  value={newAnnualAchieved}
                  onChange={(e) => setNewAnnualAchieved(e.target.value)}
                  placeholder={salesData.yearlyData.achieved.toLocaleString('pt-BR')}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-[${colors.primary}] text-[${colors.white}] py-2 px-4 rounded-md hover:bg-[${colors.secondary}] transition duration-300 ease-in-out shadow-md`}
              >
                Atualizar Meta Anual
              </button>
            </form>
          </div>
        )}

        {/* Seção de Gráficos (visível apenas se o formulário de edição estiver oculto) */}
        {!showEditForm && (
          <>
            {/* Seção de Gráficos de Velocímetro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Velocímetro Mensal */}
              <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md flex flex-col items-center`}>
                <h2 className={`text-xl sm:text-2xl font-semibold text-[${colors.primary}] mb-4`}>
                  Meta Mensal ({currentMonthData.month})
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={30}
                    data={monthlySpeedometerData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, currentMonthData.target]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: colors.white, fontSize: '14px' }}
                      background
                      clockWise
                      dataKey="value"
                    />
                    <Tooltip formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]} />
                    <Legend
                      iconSize={10}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px', color: colors.textDark }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className={`text-center text-[${colors.textDark}] mt-4 text-lg`}>
                  Alcançado: <span className={`font-bold text-[${colors.secondary}]`}>R$ {currentMonthData.achieved.toLocaleString('pt-BR')}</span> de{' '}
                  <span className={`font-bold text-[${colors.primary}]`}>R$ {currentMonthData.target.toLocaleString('pt-BR')}</span>
                </p>
                <p className={`text-center text-[${colors.textDark}] text-sm`}>
                  Progresso: {((currentMonthData.achieved / currentMonthData.target) * 100).toFixed(2)}%
                </p>
              </div>

              {/* Velocímetro Anual */}
              <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md flex flex-col items-center`}>
                <h2 className={`text-xl sm:text-2xl font-semibold text-[${colors.primary}] mb-4`}>
                  Meta Anual Acumulada
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={30}
                    data={yearlySpeedometerData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, salesData.yearlyData.target]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: colors.white, fontSize: '14px' }}
                      background
                      clockWise
                      dataKey="value"
                    />
                    <Tooltip formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]} />
                    <Legend
                      iconSize={10}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px', color: colors.textDark }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className={`text-center text-[${colors.textDark}] mt-4 text-lg`}>
                  Alcançado: <span className={`font-bold text-[${colors.secondary}]`}>R$ {salesData.yearlyData.achieved.toLocaleString('pt-BR')}</span> de{' '}
                  <span className={`font-bold text-[${colors.primary}]`}>R$ {salesData.yearlyData.target.toLocaleString('pt-BR')}</span>
                </p>
                <p className={`text-center text-[${colors.textDark}] text-sm`}>
                  Progresso: {((salesData.yearlyData.achieved / salesData.yearlyData.target) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Gráfico de Linha Mensal Detalhado por Dia */}
            <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md mb-10`}>
              <h2 className={`text-xl sm:text-2xl font-semibold text-[${colors.primary}] mb-4 text-center`}>
                Detalhe Mensal por Dia ({currentMonthData.month})
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={currentMonthData.dailyData} // Usando dailyData
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grayMedium} />
                  <XAxis dataKey="day" stroke={colors.textDark} /> {/* Eixo X por dia */}
                  <YAxis
                    tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    domain={[0, 'auto']}
                    stroke={colors.textDark}
                  />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="dailyAchieved"
                    stroke={colors.primary}
                    activeDot={{ r: 8 }}
                    name="Alcançado Diário"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="accumulatedAchieved"
                    stroke={colors.secondary}
                    activeDot={{ r: 8 }}
                    name="Alcançado Acumulado"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Linha Mensal (Todos os Meses) */}
            <div className="grid grid-cols-1 gap-6">
              <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md`}>
                <h2 className={`text-xl sm:text-2xl font-semibold text-[${colors.primary}] mb-4 text-center`}>
                  Metas e Vendas Mensais (Todos os Meses)
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={salesData.monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayMedium} />
                    <XAxis dataKey="month" stroke={colors.textDark} />
                    <YAxis
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      domain={[0, 'auto']}
                      stroke={colors.textDark}
                    />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke={colors.primary}
                      activeDot={{ r: 8 }}
                      name="Meta"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="achieved"
                      stroke={colors.secondary}
                      name="Alcançado"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Linha Acumulado Anual */}
              <div className={`bg-[${colors.backgroundSection}] p-6 rounded-xl shadow-md`}>
                <h2 className={`text-xl sm:text-2xl font-semibold text-[${colors.primary}] mb-4 text-center`}>
                  Progresso Acumulado Anual
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={salesData.monthlyData.map((data, index) => {
                      const accumulatedTarget = salesData.monthlyData
                        .slice(0, index + 1)
                        .reduce((sum, item) => sum + item.target, 0);
                      const accumulatedAchieved = salesData.monthlyData
                        .slice(0, index + 1)
                        .reduce((sum, item) => sum + item.achieved, 0);
                      return {
                        month: data.month,
                        accumulatedTarget,
                        accumulatedAchieved
                      };
                    })}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayMedium} />
                    <XAxis dataKey="month" stroke={colors.textDark} />
                    <YAxis
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      domain={[0, 'auto']}
                      stroke={colors.textDark}
                    />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accumulatedTarget"
                      stroke={colors.primary} // Usando primary para a meta acumulada
                      activeDot={{ r: 8 }}
                      name="Meta Acumulada"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="accumulatedAchieved"
                      stroke={colors.secondary}
                      name="Alcançado Acumulado"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
