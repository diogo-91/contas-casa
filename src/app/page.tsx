"use client";

import { useState, useEffect } from 'react';

interface Conta {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  recorrente: boolean;
  frequencia?: 'mensal' | 'anual';
  dataFinal?: string;
}

interface FormErrors {
  descricao?: string;
  valor?: string;
  vencimento?: string;
}

interface LoginForm {
  usuario: string;
  senha: string;
}

export default function Home() {
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    usuario: '',
    senha: ''
  });
  const [loginError, setLoginError] = useState('');

  // Estados do gerenciamento de contas
  const [contas, setContas] = useState<Conta[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [formConta, setFormConta] = useState<Conta>({
    id: 0,
    descricao: '',
    valor: 0,
    vencimento: '',
    status: 'pendente',
    recorrente: false,
    frequencia: 'mensal',
    dataFinal: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Verificar se já está autenticado ao carregar a página
  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Carregar contas do localStorage ao iniciar
  useEffect(() => {
    const contasSalvas = localStorage.getItem('contas');
    if (contasSalvas) {
      setContas(JSON.parse(contasSalvas));
    }
  }, []);

  // Salvar contas no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('contas', JSON.stringify(contas));
  }, [contas]);

  const handleLogin = () => {
    if (loginForm.usuario === 'tutui' && loginForm.senha === '26051991') {
      setIsAuthenticated(true);
      localStorage.setItem('auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth');
  };

  const formatarDataParaInput = (data: string | undefined) => {
    if (!data) return '';
    return data;
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return '';
    try {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      return data;
    }
  };

  const dataHoje = new Date().toISOString().split('T')[0];

  // Se não estiver autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                Minhas Contas
              </h1>
              <p className="text-gray-500 mt-2">Faça login para continuar</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário
                </label>
                <input
                  type="text"
                  value={loginForm.usuario}
                  onChange={(e) => setLoginForm({...loginForm, usuario: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700 border-purple-100 
                    focus:border-violet-500 focus:ring-violet-200 focus:ring-4 outline-none"
                  placeholder="Digite seu usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={loginForm.senha}
                  onChange={(e) => setLoginForm({...loginForm, senha: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700 border-purple-100 
                    focus:border-violet-500 focus:ring-violet-200 focus:ring-4 outline-none"
                  placeholder="Digite sua senha"
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-500 text-center">
                  {loginError}
                </p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 
                  rounded-xl hover:from-violet-700 hover:to-indigo-700 transform hover:scale-[1.02] 
                  transition-all duration-200 focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validarFormulario = (): boolean => {
    const erros: FormErrors = {};
    
    if (!formConta.descricao.trim()) {
      erros.descricao = 'Descrição é obrigatória';
    }
    
    if (formConta.valor <= 0) {
      erros.valor = 'Valor deve ser maior que zero';
    }
    
    if (!formConta.vencimento) {
      erros.vencimento = 'Data de vencimento é obrigatória';
    }

    // Verifica a data final apenas se a conta for recorrente
    if (formConta.recorrente) {
      if (!formConta.dataFinal) {
        erros.vencimento = 'Data final é obrigatória para contas recorrentes';
      } else if (formConta.vencimento) {
        const dataVencimento = new Date(formConta.vencimento);
        const dataFinal = new Date(formConta.dataFinal);
        
        if (dataFinal < dataVencimento) {
          erros.vencimento = 'Data final deve ser posterior à data de vencimento';
        }
      }
    }

    setFormErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const adicionarConta = () => {
    if (!validarFormulario()) return;

    const { id, ...dadosConta } = formConta;
    const novaConta: Conta = {
      id: Date.now(),
      ...dadosConta
    };
    
    if (novaConta.recorrente && novaConta.dataFinal) {
      // Adiciona a conta atual
      const contasRecorrentes: Conta[] = [];
      const dataBase = new Date(novaConta.vencimento);
      const dataFinal = new Date(novaConta.dataFinal);
      
      // Cria ocorrências até a data final
      let dataAtual = new Date(dataBase);
      let i = 0;
      
      while (dataAtual <= dataFinal) {
        contasRecorrentes.push({
          ...novaConta,
          id: Date.now() + i,
          vencimento: dataAtual.toISOString().split('T')[0],
          status: 'pendente' as const
        });
        
        // Avança para próxima data
        if (novaConta.frequencia === 'mensal') {
          dataAtual = new Date(dataAtual.setMonth(dataAtual.getMonth() + 1));
        } else { // anual
          dataAtual = new Date(dataAtual.setFullYear(dataAtual.getFullYear() + 1));
        }
        i++;
      }
      
      setContas([...contas, ...contasRecorrentes]);
    } else {
      setContas([...contas, novaConta]);
    }

    setModalAberto(false);
    setFormConta({
      id: 0,
      descricao: '',
      valor: 0,
      vencimento: '',
      status: 'pendente',
      recorrente: false,
      frequencia: 'mensal',
      dataFinal: ''
    });
  };

  const editarConta = (conta: Conta) => {
    setContaEditando(conta);
    setModalAberto(true);
  };

  const salvarEdicao = () => {
    if (!contaEditando || !validarFormulario()) return;
    
    const contasAtualizadas = contas.map(conta => 
      conta.id === contaEditando.id ? contaEditando : conta
    );
    
    setContas(contasAtualizadas);
    setContaEditando(null);
    setModalAberto(false);
  };

  const excluirConta = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setContas(contas.filter(conta => conta.id !== id));
    }
  };

  const filtrarContasPorMes = (contas: Conta[]) => {
    return contas.filter(conta => {
      const [ano, mes] = conta.vencimento.split('-');
      return parseInt(mes) === mesAtual && parseInt(ano) === anoAtual;
    });
  };

  const mudarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      if (mesAtual === 1) {
        setMesAtual(12);
        setAnoAtual(anoAtual - 1);
      } else {
        setMesAtual(mesAtual - 1);
      }
    } else {
      if (mesAtual === 12) {
        setMesAtual(1);
        setAnoAtual(anoAtual + 1);
      } else {
        setMesAtual(mesAtual + 1);
      }
    }
  };

  const nomeMes = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  const contasFiltradas = filtrarContasPorMes(contas);

  const totalContas = contasFiltradas
    .filter(conta => filtroStatus === 'todos' ? true : conta.status === filtroStatus)
    .reduce((acc, conta) => acc + conta.valor, 0);

  const totalPendente = contasFiltradas
    .filter(conta => conta.status === 'pendente')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const totalPago = contasFiltradas
    .filter(conta => conta.status === 'pago')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const marcarComoPaga = (conta: Conta) => {
    const contasAtualizadas = contas.map(c => 
      c.id === conta.id ? { ...c, status: 'pago' as const } : c
    );
    setContas(contasAtualizadas);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg fixed top-0 left-0 right-0 z-10">
        <div className="max-w-lg mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Minhas Contas</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-white hover:text-violet-200 transition-colors duration-150"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto pt-16 pb-24 px-4">
        {/* Seletor de Mês */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <button
            onClick={() => mudarMes('anterior')}
            className="text-violet-600 hover:text-violet-800 transition-colors"
          >
            ←
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            {nomeMes(mesAtual)} de {anoAtual}
          </h2>
          <button
            onClick={() => mudarMes('proximo')}
            className="text-violet-600 hover:text-violet-800 transition-colors"
          >
            →
          </button>
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
            <p className="text-sm text-violet-100 mb-1">Total Geral</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalContas)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
              <p className="text-sm text-amber-100 mb-1">Pendente</p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl p-4 shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
              <p className="text-sm text-emerald-100 mb-1">Pago</p>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
              </p>
            </div>
          </div>
        </div>

        {/* Filtro e Lista */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white/50">
            <select
              className="w-full rounded-lg border-gray-200 text-sm focus:ring-violet-500 focus:border-violet-500"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Contas Pendentes */}
            <div className="p-4 bg-amber-50/50">
              <h3 className="text-sm font-medium text-amber-800 mb-4">Contas Pendentes</h3>
              <div className="space-y-4">
                {contasFiltradas
                  .filter(conta => conta.status === 'pendente' || conta.status === 'atrasado')
                  .filter(conta => filtroStatus === 'todos' ? true : conta.status === filtroStatus)
                  .map((conta) => (
                    <div key={conta.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{conta.descricao}</h3>
                          <p className="text-lg font-bold text-violet-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          conta.status === 'pendente' ? 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800' : 
                          'bg-gradient-to-r from-red-200 to-rose-200 text-red-800'
                        }`}>
                          {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Vence em {formatarData(conta.vencimento)}
                          {conta.recorrente && (
                            <span className="ml-2 text-violet-600">
                              • Recorrente {conta.frequencia === 'mensal' ? 'Mensal' : 'Anual'}
                              {conta.dataFinal && ` até ${formatarData(conta.dataFinal)}`}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                          <button 
                            onClick={() => marcarComoPaga(conta)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-500 
                              text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transform hover:scale-105 
                              active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm 
                              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          >
                            <span>✓</span>
                            <span>Marcar como Paga</span>
                          </button>
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button 
                              onClick={() => editarConta(conta)}
                              className="text-sm text-violet-600 hover:text-violet-800 transition-colors duration-150 
                                hover:bg-violet-50 px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <span>✎</span>
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button 
                              onClick={() => excluirConta(conta.id)}
                              className="text-sm text-red-600 hover:text-red-800 transition-colors duration-150 
                                hover:bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <span>×</span>
                              <span className="hidden sm:inline">Excluir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {contasFiltradas.filter(conta => conta.status === 'pendente' || conta.status === 'atrasado').length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Nenhuma conta pendente.
                  </div>
                )}
              </div>
            </div>

            {/* Contas Pagas */}
            <div className="p-4 bg-emerald-50/50">
              <h3 className="text-sm font-medium text-emerald-800 mb-4">Contas Pagas</h3>
              <div className="space-y-4">
                {contasFiltradas
                  .filter(conta => conta.status === 'pago')
                  .filter(conta => filtroStatus === 'todos' ? true : conta.status === filtroStatus)
                  .map((conta) => (
                    <div key={conta.id} className="bg-white/80 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{conta.descricao}</h3>
                          <p className="text-lg font-bold text-violet-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-200 to-green-200 text-emerald-800">
                          Pago
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Vence em {formatarData(conta.vencimento)}
                          {conta.recorrente && (
                            <span className="ml-2 text-violet-600">
                              • Recorrente {conta.frequencia === 'mensal' ? 'Mensal' : 'Anual'}
                              {conta.dataFinal && ` até ${formatarData(conta.dataFinal)}`}
                            </span>
                          )}
                        </p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => editarConta(conta)}
                            className="text-sm text-violet-600 hover:text-violet-800 transition-colors duration-150"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => excluirConta(conta.id)}
                            className="text-sm text-red-600 hover:text-red-800 transition-colors duration-150"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {contasFiltradas.filter(conta => conta.status === 'pago').length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Nenhuma conta paga.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Botão Flutuante */}
      <button
        onClick={() => setModalAberto(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transform transition-all duration-200 hover:scale-110"
      >
        +
      </button>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0" onClick={() => {
              setModalAberto(false);
              setContaEditando(null);
              setFormErrors({});
            }}></div>
            
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-gradient-to-b from-white to-gray-50/80 shadow-xl rounded-2xl border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                  {contaEditando ? 'Editar Conta' : 'Nova Conta'}
                </h3>
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setContaEditando(null);
                    setFormErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Conta de luz"
                    className={`w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700 placeholder-gray-400
                      ${formErrors.descricao 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-purple-100 focus:border-violet-500 focus:ring-violet-200'
                      } focus:ring-4 outline-none`}
                    value={contaEditando ? contaEditando.descricao : formConta.descricao}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (contaEditando) {
                        setContaEditando({...contaEditando, descricao: value});
                      } else {
                        setFormConta({...formConta, descricao: value});
                      }
                      if (formErrors.descricao) {
                        setFormErrors({...formErrors, descricao: undefined});
                      }
                    }}
                  />
                  {formErrors.descricao && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span> {formErrors.descricao}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-white text-gray-700 placeholder-gray-400
                        ${formErrors.valor 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-purple-100 focus:border-violet-500 focus:ring-violet-200'
                        } focus:ring-4 outline-none`}
                      value={contaEditando ? contaEditando.valor : formConta.valor}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (contaEditando) {
                          setContaEditando({...contaEditando, valor: value});
                        } else {
                          setFormConta({...formConta, valor: value});
                        }
                        if (formErrors.valor) {
                          setFormErrors({...formErrors, valor: undefined});
                        }
                      }}
                    />
                  </div>
                  {formErrors.valor && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span> {formErrors.valor}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    className={`w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700
                      ${formErrors.vencimento 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-purple-100 focus:border-violet-500 focus:ring-violet-200'
                      } focus:ring-4 outline-none`}
                    value={formatarDataParaInput(contaEditando ? contaEditando.vencimento : formConta.vencimento)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (contaEditando) {
                        setContaEditando({...contaEditando, vencimento: value});
                      } else {
                        setFormConta({...formConta, vencimento: value});
                      }
                      if (formErrors.vencimento) {
                        setFormErrors({...formErrors, vencimento: undefined});
                      }
                    }}
                    required
                  />
                  {formErrors.vencimento && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <span className="mr-1">⚠️</span> {formErrors.vencimento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700 border-purple-100 
                      focus:border-violet-500 focus:ring-violet-200 focus:ring-4 outline-none"
                    value={contaEditando ? contaEditando.status : formConta.status}
                    onChange={(e) => {
                      const value = e.target.value as 'pendente' | 'pago' | 'atrasado';
                      if (contaEditando) {
                        setContaEditando({...contaEditando, status: value});
                      } else {
                        setFormConta({...formConta, status: value});
                      }
                    }}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="recorrente"
                      className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                      checked={contaEditando ? contaEditando.recorrente : formConta.recorrente}
                      onChange={(e) => {
                        const value = e.target.checked;
                        if (contaEditando) {
                          setContaEditando({...contaEditando, recorrente: value});
                        } else {
                          setFormConta({...formConta, recorrente: value});
                        }
                      }}
                    />
                    <label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
                      Conta Recorrente
                    </label>
                  </div>

                  {(contaEditando ? contaEditando.recorrente : formConta.recorrente) && (
                    <div className="pl-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequência
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="text-violet-600 border-gray-300 focus:ring-violet-500"
                              value="mensal"
                              checked={(contaEditando ? contaEditando.frequencia : formConta.frequencia) === 'mensal'}
                              onChange={(e) => {
                                if (contaEditando) {
                                  setContaEditando({...contaEditando, frequencia: 'mensal'});
                                } else {
                                  setFormConta({...formConta, frequencia: 'mensal'});
                                }
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">Mensal</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="text-violet-600 border-gray-300 focus:ring-violet-500"
                              value="anual"
                              checked={(contaEditando ? contaEditando.frequencia : formConta.frequencia) === 'anual'}
                              onChange={(e) => {
                                if (contaEditando) {
                                  setContaEditando({...contaEditando, frequencia: 'anual'});
                                } else {
                                  setFormConta({...formConta, frequencia: 'anual'});
                                }
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">Anual</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vigente até
                        </label>
                        <input
                          type="date"
                          className="w-full rounded-xl px-4 py-3 text-sm bg-white text-gray-700 border-purple-100 
                            focus:border-violet-500 focus:ring-violet-200 focus:ring-4 outline-none"
                          value={formatarDataParaInput(contaEditando ? contaEditando.dataFinal : formConta.dataFinal)}
                          min={contaEditando ? contaEditando.vencimento : formConta.vencimento}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (contaEditando) {
                              setContaEditando({...contaEditando, dataFinal: value});
                            } else {
                              setFormConta({...formConta, dataFinal: value});
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setContaEditando(null);
                    setFormErrors({});
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 
                    rounded-xl transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={contaEditando ? salvarEdicao : adicionarConta}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 
                    rounded-xl hover:from-violet-700 hover:to-indigo-700 transform hover:scale-[1.02] 
                    transition-all duration-200 focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                >
                  {contaEditando ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
