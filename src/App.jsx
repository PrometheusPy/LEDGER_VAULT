import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Terminal, TrendingUp, TrendingDown, Activity, 
  ArrowRight, ShieldCheck, DollarSign, Wifi, Battery
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("CREDIT"); // CREDIT or DEBIT
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem("ledger_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTransactions(parsed);
      calculateBalance(parsed);
    } else {
      // Initialize with a 0 start point for the graph
      setChartData([{ name: 'START', amount: 0 }]);
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("ledger_data", JSON.stringify(transactions));
    calculateBalance(transactions);
  }, [transactions]);

  // --- LOGIC ---
  const calculateBalance = (txs) => {
    let current = 0;
    const history = [];
    
    // Reverse for calculation order (oldest first)
    [...txs].reverse().forEach((t, i) => {
      if (t.type === 'CREDIT') current += parseFloat(t.amount);
      else current -= parseFloat(t.amount);
      
      history.push({
        name: i,
        amount: current,
        date: t.date
      });
    });

    setBalance(current);
    // Graph needs oldest -> newest
    setChartData(history);
  };

  const handleTransaction = () => {
    if (!amount || !desc) return;

    const newTx = {
      id: Date.now(),
      amount: parseFloat(amount),
      desc: desc.toUpperCase(),
      type: type,
      date: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };

    // Add to top of list
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    
    // Reset form
    setAmount("");
    setDesc("");
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  // Custom Tooltip for the graph
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-cyan-500 p-2 font-mono text-xs shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          <p className="text-cyan-400">VAL: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-cyan-500 font-mono overflow-hidden relative selection:bg-cyan-900/50">
      
      {/* --- GRID BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             maskImage: 'radial-gradient(circle, black 40%, transparent 100%)' 
           }}>
      </div>
      
      {/* --- SCAN LINE ANIMATION --- */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[length:100%_4px] bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(6,182,212,0.1)_50%)] animate-[scan_4s_linear_infinite]"></div>

      {/* --- HEADER --- */}
      <div className="border-b border-cyan-900/50 p-4 flex justify-between items-center bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Terminal size={18} />
          <span className="text-sm font-bold tracking-widest">LEDGER_V1</span>
        </div>
        <div className="flex gap-4 text-[10px] text-cyan-700">
           <div className="flex items-center gap-1"><Wifi size={10}/> SECURE</div>
           <div className="flex items-center gap-1"><Battery size={10}/> OPTIMAL</div>
        </div>
      </div>

      {/* --- TICKER TAPE --- */}
      <div className="w-full bg-cyan-900/10 overflow-hidden border-b border-cyan-900/30 py-1">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-[10px] text-cyan-600">
           BTC: 42,000 // ETH: 2,400 // CASH_RESERVE: LOW // ENCRYPTION: AES-256 // NODE_STATUS: ONLINE // UPLINK: STABLE // GHOST_MODE: ACTIVE //
        </div>
      </div>

      <div className="p-4 pb-24 max-w-md mx-auto">
        
        {/* --- MAIN BALANCE CARD --- */}
        <div className="mb-6 mt-2 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black border border-cyan-800 p-6 rounded-lg">
            <h2 className="text-xs text-cyan-600 tracking-[0.2em] mb-1">TOTAL NET WORTH</h2>
            <div className="text-4xl font-bold text-white tracking-tight shadow-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
              {formatCurrency(balance)}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <Activity size={14} className="animate-pulse" />
              <span className="text-cyan-400">LIVE FEED ACTIVE</span>
            </div>
          </div>
        </div>

        {/* --- GRAPH --- */}
        <div className="h-48 w-full bg-black/50 border border-cyan-900/50 mb-6 relative rounded overflow-hidden">
          <div className="absolute top-2 left-2 text-[10px] text-cyan-700">ASSET_VOLATILITY_INDEX</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVal)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* --- INPUT TERMINAL --- */}
        <div className="bg-black border border-cyan-800 p-4 mb-6 rounded">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setType("CREDIT")}
              className={`flex-1 py-2 text-xs font-bold border ${type === 'CREDIT' ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-cyan-900 text-cyan-700'}`}
            >
              <TrendingUp size={14} className="inline mr-1" /> INCOME
            </button>
            <button 
              onClick={() => setType("DEBIT")}
              className={`flex-1 py-2 text-xs font-bold border ${type === 'DEBIT' ? 'bg-red-900/30 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-cyan-900 text-cyan-700'}`}
            >
              <TrendingDown size={14} className="inline mr-1" /> EXPENSE
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative group">
               <DollarSign size={16} className="absolute left-3 top-3 text-cyan-700 group-focus-within:text-cyan-400" />
               <input 
                 type="number" 
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 placeholder="0.00"
                 className="w-full bg-[#050505] border border-cyan-900 rounded py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
               />
            </div>
            <div className="relative group">
               <input 
                 type="text" 
                 value={desc}
                 onChange={(e) => setDesc(e.target.value)}
                 placeholder="TRANSACTION_ID / DESC"
                 className="w-full bg-[#050505] border border-cyan-900 rounded py-2 pl-4 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono uppercase text-xs"
               />
            </div>
            <button 
              onClick={handleTransaction}
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-black font-bold text-sm tracking-widest active:scale-[0.98] transition-all"
            >
              EXECUTE_TRADE >>
            </button>
          </div>
        </div>

        {/* --- TRANSACTION LOG --- */}
        <div>
          <h3 className="text-xs text-cyan-700 mb-2 border-b border-cyan-900 pb-1">DATA_STREAM_LOG</h3>
          <div className="space-y-1">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 border-l-2 border-transparent hover:border-cyan-500 transition-all cursor-default">
                <div className="flex-1">
                  <div className="text-white text-xs font-bold">{t.desc}</div>
                  <div className="text-[10px] text-cyan-700">{t.date}</div>
                </div>
                <div className={`font-mono text-sm ${t.type === 'CREDIT' ? 'text-cyan-400' : 'text-red-500'}`}>
                  {t.type === 'CREDIT' ? '+' : '-'}{t.amount}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
               <div className="text-center py-8 text-cyan-900 text-xs font-mono">
                  NO_DATA_PACKETS_RECEIVED
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


    
