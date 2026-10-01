import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building2,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  History,
  TrendingUp,
  BarChart3,
  Save,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FileCheck,
  Cpu,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// New Components
import { Analytics } from './components/Analytics';
import { Sessions as WorkLogs } from './components/Sessions';

// Set worker source for pdfjs-dist - Using unpkg for better reliability
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

// PDF Canvas Renderer Component
const PdfCanvasRenderer = ({ pdfData }: { pdfData: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderPdf = async () => {
      if (!pdfData) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting PDF render, data length:', pdfData.length);
        
        // Convert base64 to Uint8Array
        let bytes: Uint8Array;
        try {
          const base64Content = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData;
          const binaryString = atob(base64Content);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
        } catch (e) {
          console.error('Base64 decoding failed:', e);
          throw new Error('Invalid PDF data format');
        }

        const loadingTask = pdfjsLib.getDocument({ 
          data: bytes,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        console.log('PDF loaded, pages:', pdf.numPages);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = ''; // Clear previous renders
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            const pageContainer = document.createElement('div');
            pageContainer.className = "relative mb-6 group";
            
            const pageLabel = document.createElement('div');
            pageLabel.className = "absolute -top-3 left-4 bg-[#0052CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 opacity-80 group-hover:opacity-100 transition-opacity";
            pageLabel.textContent = `Page ${pageNum}`;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = "w-full rounded-lg shadow-sm border border-gray-200 bg-white";
            
            pageContainer.appendChild(pageLabel);
            pageContainer.appendChild(canvas);
            containerRef.current.appendChild(pageContainer);
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
              // @ts-ignore
              canvas: canvas
            }).promise;
            
            console.log(`Rendered page ${pageNum}`);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Detailed PDF Render Error:', err);
        if (isMounted) {
          setError(`Failed to render PDF: ${err.message || 'Unknown error'}. Please try opening in a new tab.`);
          setLoading(false);
        }
      }
    };

    renderPdf();
    return () => { isMounted = false; };
  }, [pdfData, retryCount]);

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-100 p-4 rounded-xl border border-[#E5E7EB]">
      {loading && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-8 h-8 border-4 border-[#0052CC]/30 border-t-[#0052CC] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Rendering PDF pages...</p>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setRetryCount(prev => prev + 1);
            }}
            className="bg-[#0052CC] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#0747A6] transition-all"
          >
            Retry Rendering
          </button>
        </div>
      )}
      <div ref={containerRef} className={loading || error ? "hidden" : "block"} />
    </div>
  );
};

import { cn, calculateAveragePeriod, normalizePeriodPrice } from './utils';
import { 
  MONTHS, 
  YEARS, 
  INITIAL_SHED_MASTER, 
  INITIAL_PRICE_MASTER, 
  ShedMasterEntry, 
  PriceMasterEntry, 
  PriceData,
  SelectedShed,
  GOODS_ALLOCATION,
  COACH_ALLOCATION,
  Session,
  ConsumptionRecord
} from './types';

export interface ScannedVoucherLineItem {
  page: number;
  date: string;
  loco_no: string;
  train_no: string;
  litres: number;
  category: 'coach' | 'goods';
  reason: string;
}

export interface ScannedConsumingShedReview {
  id: string;
  selected: boolean;
  shed_name: string;
  railway: string;
  voucher_pages: string;
  goods_litres: number;
  coach_litres: number;
  total_litres: number;
  pricing_period: 'p1' | 'p2' | 'average';
  period_reason: string;
  date_range_str: string;
  items: ScannedVoucherLineItem[];
  showItems?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'prices' | 'sheds' | 'worklogs' | 'analytics'>('generate');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return MONTHS[d.getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.getFullYear().toString();
  });
  const [priceMaster, setPriceMaster] = useState<PriceMasterEntry[]>([]);
  const [shedMaster, setShedMaster] = useState<ShedMasterEntry[]>([]);

  // Price Master Pagination States
  const priceMasterYears = useMemo(() => {
    const years = Array.from(new Set(priceMaster.map(p => p.year))) as string[];
    return years.sort((a, b) => b.localeCompare(a));
  }, [priceMaster]);

  const [selectedPriceYear, setSelectedPriceYear] = useState<string>('');

  // Sync selectedPriceYear to the latest available year if empty or not valid
  useEffect(() => {
    if (priceMasterYears.length > 0) {
      if (!selectedPriceYear || !priceMasterYears.includes(selectedPriceYear)) {
        setSelectedPriceYear(priceMasterYears[0]);
      }
    } else {
      setSelectedPriceYear(new Date().getFullYear().toString());
    }
  }, [priceMasterYears, selectedPriceYear]);

  const [pricePage, setPricePage] = useState(1);

  // Reset page to 1 when year selection changes
  useEffect(() => {
    setPricePage(1);
  }, [selectedPriceYear]);

  const priceMonthsPerPage = 4;

  const uniqueMonthsForSelectedYear = useMemo(() => {
    const filtered = priceMaster.filter(p => p.year === selectedPriceYear);
    const months = Array.from(new Set(filtered.map(p => p.month))) as string[];
    return months.sort((a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a));
  }, [priceMaster, selectedPriceYear]);

  const totalPricePages = Math.max(1, Math.ceil(uniqueMonthsForSelectedYear.length / priceMonthsPerPage));

  const paginatedMonths = useMemo(() => {
    const startIndex = (pricePage - 1) * priceMonthsPerPage;
    return uniqueMonthsForSelectedYear.slice(startIndex, startIndex + priceMonthsPerPage);
  }, [uniqueMonthsForSelectedYear, pricePage]);

  // Derived filtered & paginated Price Master
  const paginatedPriceMaster = useMemo(() => {
    const filtered = priceMaster.filter(p => p.year === selectedPriceYear && paginatedMonths.includes(p.month));
    return filtered.sort((a, b) => {
      const monthA = MONTHS.indexOf(a.month);
      const monthB = MONTHS.indexOf(b.month);
      if (monthB !== monthA) return monthB - monthA;
      return a.supplying_shed.localeCompare(b.supplying_shed);
    });
  }, [priceMaster, selectedPriceYear, paginatedMonths]);

  // Shed Master Pagination States
  const [shedMasterPage, setShedMasterPage] = useState(1);
  const shedMasterPerPage = 5;

  const totalShedMasterPages = Math.max(1, Math.ceil(shedMaster.length / shedMasterPerPage));

  // Reset page when length decreases below bounds
  useEffect(() => {
    if (shedMasterPage > totalShedMasterPages) {
      setShedMasterPage(totalShedMasterPages);
    }
  }, [shedMaster.length, totalShedMasterPages, shedMasterPage]);

  const paginatedShedMaster = useMemo(() => {
    const startIndex = (shedMasterPage - 1) * shedMasterPerPage;
    return shedMaster.slice(startIndex, startIndex + shedMasterPerPage);
  }, [shedMaster, shedMasterPage, shedMasterPerPage]);
  const [selectedSupplyingShed, setSelectedSupplyingShed] = useState('HXP');
  const [selectedSheds, setSelectedSheds] = useState<SelectedShed[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingPriceId, setDeletingPriceId] = useState<string | null>(null);
  const [masterVoucherPdf, setMasterVoucherPdf] = useState<string | null>(null);
  const [masterVoucherPdfName, setMasterVoucherPdfName] = useState<string | null>(null);
  const [masterVoucherPdfUrl, setMasterVoucherPdfUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // AI / OCR Price Circular Scanner State
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrPdfBase64, setOcrPdfBase64] = useState<string | null>(null);
  const [ocrPdfName, setOcrPdfName] = useState<string | null>(null);
  const [ocrPdfSize, setOcrPdfSize] = useState<string | null>(null);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrScanStep, setOcrScanStep] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrSelectedShed, setOcrSelectedShed] = useState<string>('HXP');
  const [ocrApplyBoth, setOcrApplyBoth] = useState<boolean>(true);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [scanningRowKey, setScanningRowKey] = useState<string | null>(null);

  // AI Combined Voucher OCR & Consuming Sheds Review State
  const [showVoucherOcrModal, setShowVoucherOcrModal] = useState<boolean>(false);
  const [voucherPdfBase64, setVoucherPdfBase64] = useState<string | null>(null);
  const [voucherPdfName, setVoucherPdfName] = useState<string | null>(null);
  const [voucherPdfSize, setVoucherPdfSize] = useState<string | null>(null);
  const [isScanningVoucher, setIsScanningVoucher] = useState<boolean>(false);
  const [voucherScanStep, setVoucherScanStep] = useState<string>('');
  const [voucherOcrError, setVoucherOcrError] = useState<string | null>(null);
  const [scannedShedsReview, setScannedShedsReview] = useState<ScannedConsumingShedReview[]>([]);
  const [scannedVoucherMeta, setScannedVoucherMeta] = useState<{
    supplying_shed: string;
    voucher_month: string;
    voucher_year: string;
    total_pages: number;
  } | null>(null);

  // Sessions & Analytics State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'in_progress' | 'completed'>('in_progress');
  const isCompleted = false; // Allow editing completed/archived sessions as per user request
  const isSessionFinalized = sessionStatus === 'completed';
  const [isSavingSession, setIsSavingSession] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Cleanup Object URL
  useEffect(() => {
    return () => {
      if (masterVoucherPdfUrl) {
        URL.revokeObjectURL(masterVoucherPdfUrl);
      }
    };
  }, [masterVoucherPdfUrl]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shedsRes, pricesRes, sessionsRes, analyticsRes] = await Promise.all([
          fetch('/api/sheds'),
          fetch('/api/prices'),
          fetch('/api/sessions'),
          fetch('/api/analytics')
        ]);
        const sheds = await shedsRes.json();
        const prices = await pricesRes.json();
        const loadedSessions = await sessionsRes.json();
        const loadedAnalytics = await analyticsRes.json();
        
        setShedMaster(sheds.length > 0 ? sheds : INITIAL_SHED_MASTER);
        setPriceMaster(prices.length > 0 ? prices : INITIAL_PRICE_MASTER);
        setSessions(loadedSessions);
        setConsumptionRecords(loadedAnalytics);

        // If initial data was empty, populate DB with defaults
        if (sheds.length === 0) {
          for (const s of INITIAL_SHED_MASTER) {
            await fetch('/api/sheds', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(s)
            });
          }
        }
        if (prices.length === 0) {
          for (const p of INITIAL_PRICE_MASTER) {
            await fetch('/api/prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(p)
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const createNewLog = () => {
    if (selectedSheds.length > 0) {
      if (!window.confirm('Clear current progress and start a new work log?')) {
        return;
      }
    }
    
    // Explicitly reset all relevant state
    setCurrentSessionId(null);
    setSelectedSheds([]);
    setMasterVoucherPdf(null);
    setMasterVoucherPdfName(null);
    if (masterVoucherPdfUrl) {
      URL.revokeObjectURL(masterVoucherPdfUrl);
      setMasterVoucherPdfUrl(null);
    }
    setSessionName('');
    setSessionDesc('');
    setSessionStatus('in_progress');
    setShowPdfPreview(false);
    
    // Reset to defaults
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(MONTHS[d.getMonth()]);
    setSelectedYear(d.getFullYear().toString());
    
    setSuccessMessage('Started a fresh work log');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [newShed, setNewShed] = useState<Partial<ShedMasterEntry>>({
    railway: 'WR'
  });

  const filteredSheds = useMemo(() => {
    return shedMaster.filter(shed => 
      shed.shed_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shed.railway.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, shedMaster]);

  const addShedToGeneration = (shed: ShedMasterEntry) => {
    setSelectedSheds(prev => [{ 
      ...shed, 
      instanceId: Math.random().toString(36).substr(2, 9),
      for_month: selectedMonth,
      for_year: selectedYear,
      during_month: selectedMonth,
      during_year: selectedYear,
      supplying_shed: selectedSupplyingShed,
      pricing_period: 'average',
      goods_litres: 0,
      coach_litres: 0,
      is_power_car: false
    }, ...prev]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const updateSelectedShed = (instanceId: string, updates: Partial<SelectedShed>) => {
    setSelectedSheds(prev => prev.map(s => {
      if (s.instanceId === instanceId) {
        const updated = { ...s, ...updates };
        if (updates.is_power_car) {
          updated.goods_litres = 0;
        }
        return updated;
      }
      return s;
    }));
  };

  const removeShed = (instanceId: string) => {
    setSelectedSheds(prev => prev.filter(s => s.instanceId !== instanceId));
  };

  const getPriceForShed = (supplyingShed: string, period: string, month: string, year: string) => {
    const entry = priceMaster.find(p => 
      p.supplying_shed === supplyingShed && 
      p.month === month && 
      p.year === year
    );
    if (!entry) return null;
    return entry.periods[period as keyof typeof entry.periods];
  };

  const calculateAmounts = (shed: SelectedShed) => {
    const price = getPriceForShed(shed.supplying_shed, shed.pricing_period, shed.during_month, shed.during_year);
    if (!price) return null;

    const totalLitres = shed.goods_litres + shed.coach_litres;
    const klrs = totalLitres / 1000;

    const primeCost = price.base_price * klrs;
    const excise = price.excise * klrs;
    const vat = price.vat * klrs;
    const overhead = price.overhead * klrs;
    const total = primeCost + excise + vat + overhead;

    return {
      primeCost,
      excise,
      vat,
      overhead,
      total,
      klrs,
      price,
      coachPrimeCost: price.base_price * (shed.coach_litres / 1000),
      goodsPrimeCost: price.base_price * (shed.goods_litres / 1000)
    };
  };

  const sortedPriceMaster = useMemo(() => {
    return [...priceMaster].sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      const monthA = MONTHS.indexOf(a.month);
      const monthB = MONTHS.indexOf(b.month);
      return monthB - monthA;
    });
  }, [priceMaster]);

  const [newPriceEntry, setNewPriceEntry] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return {
      month: MONTHS[d.getMonth()],
      year: d.getFullYear().toString(),
      supplying_shed: 'HXP'
    };
  });

  const addPriceEntry = async () => {
    const exists = priceMaster.find(p => 
      p.month === newPriceEntry.month && 
      p.year === newPriceEntry.year && 
      p.supplying_shed === newPriceEntry.supplying_shed
    );
    if (exists) {
      alert('Price entry already exists for this period and shed.');
      return;
    }
    const newEntry: PriceMasterEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...newPriceEntry,
      periodNames: {
        p1: '1st-15th',
        p2: '16th-End'
      },
      periods: {
        p1: { base_price: 0, excise: 0, vat: 0, overhead: 0 },
        p2: { base_price: 0, excise: 0, vat: 0, overhead: 0 },
        average: { base_price: 0, excise: 0, vat: 0, overhead: 0 }
      }
    };
    
    try {
      await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      setPriceMaster([...priceMaster, newEntry]);
    } catch (error) {
      console.error('Error adding price:', error);
    }
  };

  const updatePriceEntry = async (entryId: string, period: string, data: PriceData) => {
    const entry = priceMaster.find(p => p.id === entryId);
    if (!entry) return;

    let updatedPeriods = { ...entry.periods, [period]: data };

    // Auto-calculate average if p1 or p2 is updated - round off average to whole integer without exceeding average rate
    if (period === 'p1' || period === 'p2') {
      const p1 = updatedPeriods['p1'];
      const p2 = updatedPeriods['p2'];
      updatedPeriods['average'] = calculateAveragePeriod(p1, p2);
    }

    const updatedEntry = {
      ...entry,
      periods: updatedPeriods
    };

    try {
      await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry)
      });
      setPriceMaster(prev => prev.map(p => p.id === entryId ? updatedEntry : p));
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const handleRowScanPdf = async (entry: PriceMasterEntry, period: 'p1' | 'p2', base64: string) => {
    const rowKey = `${entry.id}-${period}`;
    setScanningRowKey(rowKey);
    try {
      const res = await fetch('/api/prices/scan-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf_base64: base64,
          target_shed: entry.supplying_shed
        })
      });

      const json = await res.json();
      if (json.success && json.data && json.data.locations?.length > 0) {
        // Strict matching for this entry's supplying shed: HXP -> Hapa, WKR -> Wakaner
        const expectedLocName = entry.supplying_shed === 'HXP' ? 'Hapa' : 'Wakaner';
        const loc = json.data.locations.find((l: any) => 
          l.shed_code === entry.supplying_shed || 
          (l.rcd_location && (
            (entry.supplying_shed === 'HXP' && /hapa/i.test(l.rcd_location)) ||
            (entry.supplying_shed === 'WKR' && /(wakaner|wankaner)/i.test(l.rcd_location))
          ))
        );

        if (!loc) {
          const available = json.data.locations.map((l: any) => `${l.shed_code} (${l.rcd_location})`).join(', ');
          throw new Error(`The scanned PDF does not contain the required row with exact RCD Location "${expectedLocName}" for ${entry.supplying_shed}. (Found in document: ${available})`);
        }

        const calc = loc?.calculated || loc?.raw || {};

        const newPeriodData: PriceData = {
          base_price: Math.round(Number(calc?.base_price) || 0),
          excise: Math.round(Number(calc?.excise ?? calc?.excise_duty) || 0),
          vat: Math.round(Number(calc?.vat) || 0),
          overhead: Math.round(Number(calc?.overhead) || 0),
          pdf_base64: base64
        };

        const updatedPeriods = {
          ...entry.periods,
          [period]: newPeriodData
        };

        // Recalculate average row with strict whole integer & non-exceeding total rate
        updatedPeriods.average = calculateAveragePeriod(updatedPeriods.p1, updatedPeriods.p2);

        const updatedEntry = {
          ...entry,
          periods: updatedPeriods
        };

        await fetch('/api/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry)
        });

        setPriceMaster(prev => prev.map(p => p.id === entry.id ? updatedEntry : p));

        const bPrice = Number(newPeriodData.base_price) || 0;
        const eDuty = Number(newPeriodData.excise) || 0;
        const vTax = Number(newPeriodData.vat) || 0;
        const oHead = Number(newPeriodData.overhead) || 0;
        const totalRate = bPrice + eDuty + vTax + oHead;
        setSuccessMessage(
          `✓ AI Scanned ${entry.supplying_shed} (${period}): Base ₹${bPrice.toLocaleString('en-IN')}, Excise ₹${eDuty.toLocaleString('en-IN')}, VAT ₹${vTax.toLocaleString('en-IN')}, Overhead ₹${oHead.toLocaleString('en-IN')} = Total ₹${totalRate.toLocaleString('en-IN')}. All fields remain fully editable!`
        );
      } else {
        // Fallback: save PDF if OCR didn't find figures
        updatePriceEntry(entry.id, period, { ...entry.periods[period], pdf_base64: base64 });
        setSuccessMessage(`PDF uploaded for ${entry.supplying_shed} (${period}). Inputs remain fully editable.`);
      }
    } catch (err: any) {
      console.error('Error scanning PDF for row:', err);
      updatePriceEntry(entry.id, period, { ...entry.periods[period], pdf_base64: base64 });
      setSuccessMessage(`PDF attached to ${entry.supplying_shed} (${period}). Inputs remain editable.`);
    } finally {
      setScanningRowKey(null);
    }
  };

  const handleOcrFileSelect = async (file: File) => {
    try {
      setOcrError(null);
      setOcrResult(null);
      setOcrPdfName(file.name);
      setOcrPdfSize((file.size / 1024).toFixed(1) + ' KB');
      const base64 = await fileToBase64(file);
      setOcrPdfBase64(base64);
    } catch (e: any) {
      setOcrError('Failed to read PDF file: ' + e.message);
    }
  };

  const handleRunOcrScan = async () => {
    if (!ocrPdfBase64) return;
    setIsScanningOcr(true);
    setOcrError(null);
    setOcrScanStep('Scanning circular text & table...');

    const stepTimer1 = setTimeout(() => setOcrScanStep('Detecting effective date w.e.f. & period (1st-15th / 16th-End)...'), 800);
    const stepTimer2 = setTimeout(() => setOcrScanStep('Matching Western Railway (WR) RCD depots: Hapa (HXP) & Wankaner (WKR)...'), 1600);
    const stepTimer3 = setTimeout(() => setOcrScanStep('Mapping columns & verifying All Inclusive Rate formula...'), 2400);

    try {
      const res = await fetch('/api/prices/scan-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf_base64: ocrPdfBase64,
          target_shed: ocrSelectedShed
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to scan circular');
      }

      setOcrResult(json.data);
      if (json.data.locations?.length > 0) {
        const hasHxp = json.data.locations.some((l: any) => l.shed_code === 'HXP');
        const hasWkr = json.data.locations.some((l: any) => l.shed_code === 'WKR');
        if (hasHxp) setOcrSelectedShed('HXP');
        else if (hasWkr) setOcrSelectedShed('WKR');
        else setOcrSelectedShed(json.data.locations[0].shed_code);
        setOcrApplyBoth(hasHxp && hasWkr);
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      console.error('OCR scan failed:', err);
      setOcrError(err.message || 'Failed to scan and extract price PDF. Please check the document format.');
    } finally {
      setIsScanningOcr(false);
      setOcrScanStep('');
    }
  };

  const handleUpdateOcrField = (shedCode: string, field: 'base_price' | 'excise' | 'vat' | 'overhead' | 'all_inclusive_rate', value: number) => {
    if (!ocrResult) return;
    const updatedLocations = (ocrResult.locations || []).map((loc: any) => {
      if (loc.shed_code !== shedCode) return loc;
      const currentCalc = { ...(loc.calculated || loc.raw || {}) };
      currentCalc[field] = Math.round(Number(value) || 0);
      if (field === 'excise') currentCalc.excise_duty = Math.round(Number(value) || 0);
      if (field === 'vat') currentCalc.total_tax = Math.round(Number(value) || 0);
      return {
        ...loc,
        calculated: currentCalc
      };
    });
    setOcrResult({
      ...ocrResult,
      locations: updatedLocations
    });
  };

  const handleAutoBalanceOcrOverhead = (shedCode: string) => {
    if (!ocrResult) return;
    const updatedLocations = (ocrResult.locations || []).map((loc: any) => {
      if (loc.shed_code !== shedCode) return loc;
      const calc = { ...(loc.calculated || loc.raw || {}) };
      const base = Math.round(Number(calc.base_price) || 0);
      const excise = Math.round(Number(calc.excise ?? calc.excise_duty) || 0);
      const vat = Math.round(Number(calc.vat ?? calc.total_tax) || 0);
      const allInc = Math.round(Number(calc.all_inclusive_rate) || (base + excise + vat + (Number(calc.overhead) || 0)));
      calc.overhead = allInc - (base + excise + vat);
      return {
        ...loc,
        calculated: calc
      };
    });
    setOcrResult({
      ...ocrResult,
      locations: updatedLocations
    });
  };

  const handleApplyOcrToPriceMaster = async () => {
    if (!ocrResult || !ocrPdfBase64) return;

    const { month, year, period, period_name, locations } = ocrResult;
    const targetLocations = locations.filter((loc: any) => {
      if (ocrApplyBoth) return true;
      return loc.shed_code === ocrSelectedShed;
    });

    if (targetLocations.length === 0) {
      setOcrError('No matching shed location selected to apply.');
      return;
    }

    let updatedList = [...priceMaster];

    for (const loc of targetLocations) {
      const shedCode = loc.shed_code || ocrSelectedShed;
      const calc = loc.calculated || loc.raw || {};

      let entryIndex = updatedList.findIndex(
        p => p.supplying_shed === shedCode && p.month === month && p.year === year
      );

      let entry: PriceMasterEntry;
      if (entryIndex >= 0) {
        entry = { ...updatedList[entryIndex] };
      } else {
        entry = {
          id: Math.random().toString(36).substr(2, 9),
          supplying_shed: shedCode,
          month,
          year,
          periodNames: {
            p1: '1st-15th',
            p2: '16th-End'
          },
          periods: {
            p1: { base_price: 0, excise: 0, vat: 0, overhead: 0 },
            p2: { base_price: 0, excise: 0, vat: 0, overhead: 0 },
            average: { base_price: 0, excise: 0, vat: 0, overhead: 0 }
          }
        };
      }

      const updatedPeriods = {
        ...entry.periods,
        [period]: {
          base_price: Math.round(Number(calc.base_price) || 0),
          excise: Math.round(Number(calc.excise ?? calc.excise_duty) || 0),
          vat: Math.round(Number(calc.vat ?? calc.total_tax) || 0),
          overhead: Math.round(Number(calc.overhead) || 0),
          pdf_base64: ocrPdfBase64
        }
      };

      // Calculate average row using our robust accounting rule
      updatedPeriods.average = calculateAveragePeriod(updatedPeriods.p1, updatedPeriods.p2);

      const finalEntry: PriceMasterEntry = {
        ...entry,
        periods: updatedPeriods
      };

      await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEntry)
      });

      if (entryIndex >= 0) {
        updatedList[entryIndex] = finalEntry;
      } else {
        updatedList.push(finalEntry);
      }
    }

    setPriceMaster(updatedList);
    setSelectedPriceYear(year);
    setShowOcrModal(false);
    setOcrResult(null);
    setOcrPdfBase64(null);
    setOcrPdfName(null);
    setSuccessMessage(`✓ Successfully applied circular rates for ${targetLocations.map((l: any) => l.shed_code).join(' & ')} (${month} ${year}, ${period_name}). All table inputs remain editable!`);
  };

  // AI Combined Voucher Scanning & Review Logic
  const handleRunCombinedVoucherScan = async (pdfDataOverride?: string, fileNameOverride?: string) => {
    const dataToSend = pdfDataOverride || voucherPdfBase64 || masterVoucherPdf;
    const nameToSend = fileNameOverride || voucherPdfName || masterVoucherPdfName || 'combined_voucher.pdf';

    if (!dataToSend) {
      setVoucherOcrError('Please upload or select a Combined Voucher PDF first.');
      return;
    }

    setIsScanningVoucher(true);
    setVoucherOcrError(null);
    setVoucherScanStep('Extracting PDF text and analyzing portrait/landscape pages...');

    try {
      const stepTimer1 = setTimeout(() => {
        setVoucherScanStep('Scanning with Gemini AI: identifying Consuming Shed headers & multi-page ranges (e.g. SGUJ, ABR, ROZA)...');
      }, 2500);

      const stepTimer2 = setTimeout(() => {
        setVoucherScanStep('Classifying Train Numbers (Numerical -> Coach Litres, Alphabetical -> Goods Litres)...');
      }, 6000);

      const stepTimer3 = setTimeout(() => {
        setVoucherScanStep('Analyzing table dates for Pricing Period (1st-15th, 16th-End, or Average)...');
      }, 9500);

      const res = await fetch('/api/vouchers/scan-combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf_base64: dataToSend,
          supplying_shed: selectedSupplyingShed, // Strictly fixed from Step 1!
          default_month: selectedMonth,
          default_year: selectedYear
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to scan combined voucher PDF');
      }

      const { consuming_sheds, supplying_shed, voucher_month, voucher_year, total_pages } = json.data;

      if (!consuming_sheds || consuming_sheds.length === 0) {
        throw new Error('No consuming sheds found in the uploaded voucher PDF.');
      }

      // Map to interactive review state
      const reviewList: ScannedConsumingShedReview[] = consuming_sheds.map((cs: any, idx: number) => {
        // Strict and smart matching with existing Shed Master (e.g., SGUJ, ABR, ROZA, etc.)
        const match = shedMaster.find(sm => sm.shed_name.toUpperCase() === cs.shed_name.toUpperCase());
        return {
          id: `scanned-shed-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          selected: true,
          shed_name: match?.shed_name || cs.shed_name,
          railway: match?.railway || cs.railway || 'WR',
          voucher_pages: String(cs.voucher_pages || (idx + 1)),
          goods_litres: Number(cs.goods_litres) || 0,
          coach_litres: Number(cs.coach_litres) || 0,
          total_litres: Number(cs.total_litres) || ((Number(cs.goods_litres) || 0) + (Number(cs.coach_litres) || 0)),
          pricing_period: (cs.pricing_period === 'p1' || cs.pricing_period === 'p2') ? cs.pricing_period : 'average',
          period_reason: cs.period_reason || '',
          date_range_str: cs.date_range_str || '',
          items: cs.items || [],
          showItems: false
        };
      });

      setScannedShedsReview(reviewList);
      setScannedVoucherMeta({
        supplying_shed: supplying_shed || selectedSupplyingShed,
        voucher_month: voucher_month || selectedMonth,
        voucher_year: voucher_year || selectedYear,
        total_pages: total_pages || reviewList.length
      });

      // Keep voucherPdfBase64 in state for review and master preview
      if (!voucherPdfBase64 && dataToSend) {
        setVoucherPdfBase64(dataToSend);
        setVoucherPdfName(nameToSend);
      }

      // Automatically attach as Master Voucher PDF in Step 2 if not already uploaded
      if (!masterVoucherPdf && dataToSend) {
        setMasterVoucherPdf(dataToSend);
        setMasterVoucherPdfName(nameToSend);
        try {
          const clean = dataToSend.includes(',') ? dataToSend.split(',')[1] : dataToSend;
          const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: 'application/pdf' });
          if (masterVoucherPdfUrl) URL.revokeObjectURL(masterVoucherPdfUrl);
          setMasterVoucherPdfUrl(URL.createObjectURL(blob));
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Error scanning combined voucher:', err);
      setVoucherOcrError(err?.message || 'Error occurred while scanning combined voucher.');
    } finally {
      setIsScanningVoucher(false);
      setVoucherScanStep('');
    }
  };

  const handleApplyScannedShedsToStep3 = async () => {
    const selectedToApply = scannedShedsReview.filter(s => s.selected);
    if (selectedToApply.length === 0) {
      setVoucherOcrError('Please select at least one consuming shed to apply.');
      return;
    }

    // 1. Ensure any newly discovered shed is persisted into Shed Master
    for (const item of selectedToApply) {
      const existsInMaster = shedMaster.some(
        sm => sm.shed_name.toUpperCase() === item.shed_name.toUpperCase()
      );
      if (!existsInMaster) {
        const newShedEntry: ShedMasterEntry = {
          id: `shed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          shed_name: item.shed_name.toUpperCase(),
          railway: item.railway.toUpperCase()
        };
        try {
          await fetch('/api/sheds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newShedEntry)
          });
          setShedMaster(prev => [...prev, newShedEntry]);
        } catch (e) {
          console.warn('Failed to save new shed to master:', e);
        }
      }
    }

    // 2. Add or update consuming sheds in Step 3 (selectedSheds)
    setSelectedSheds(prev => {
      let currentList = [...prev];

      for (const item of selectedToApply) {
        const matchedMaster = shedMaster.find(
          sm => sm.shed_name.toUpperCase() === item.shed_name.toUpperCase()
        );
        const shedId = matchedMaster?.id || `shed-${Date.now()}`;

        // Check if this shed is already added in Step 3
        const existingIdx = currentList.findIndex(
          s => s.shed_name.toUpperCase() === item.shed_name.toUpperCase()
        );

        const newSelectedEntry: SelectedShed = {
          id: shedId,
          instanceId: Math.random().toString(36).substr(2, 9),
          shed_name: item.shed_name.toUpperCase(),
          railway: item.railway.toUpperCase(),
          for_month: selectedMonth,
          for_year: selectedYear,
          during_month: selectedMonth,
          during_year: selectedYear,
          supplying_shed: selectedSupplyingShed, // Fixed from Step 1!
          pricing_period: item.pricing_period,
          goods_litres: item.goods_litres,
          coach_litres: item.coach_litres,
          is_power_car: false,
          voucher_pages: item.voucher_pages // Page number or range e.g. "1" or "2-3" or "4-5"
        };

        if (existingIdx >= 0) {
          currentList[existingIdx] = {
            ...currentList[existingIdx],
            ...newSelectedEntry,
            instanceId: currentList[existingIdx].instanceId
          };
        } else {
          currentList.push(newSelectedEntry);
        }
      }

      return currentList;
    });

    // 3. Ensure master voucher PDF in Step 2 is set so individual pages can be previewed/generated
    if (voucherPdfBase64 && !masterVoucherPdf) {
      setMasterVoucherPdf(voucherPdfBase64);
      setMasterVoucherPdfName(voucherPdfName);
      try {
        const clean = voucherPdfBase64.includes(',') ? voucherPdfBase64.split(',')[1] : voucherPdfBase64;
        const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        if (masterVoucherPdfUrl) URL.revokeObjectURL(masterVoucherPdfUrl);
        setMasterVoucherPdfUrl(URL.createObjectURL(blob));
      } catch (e) {}
    }

    setShowVoucherOcrModal(false);
    setSuccessMessage(
      `✓ Successfully imported ${selectedToApply.length} consuming shed${selectedToApply.length > 1 ? 's' : ''} (${selectedToApply.map(s => s.shed_name).join(', ')}) to Step 3 with verified page ranges and Coach/Goods litres!`
    );
  };

  const updateReviewShed = (id: string, updates: Partial<ScannedConsumingShedReview>) => {
    setScannedShedsReview(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        if (updates.coach_litres !== undefined || updates.goods_litres !== undefined) {
          updated.total_litres = (Number(updated.coach_litres) || 0) + (Number(updated.goods_litres) || 0);
        }
        return updated;
      }
      return s;
    }));
  };

  const toggleReviewShedSelect = (id: string) => {
    setScannedShedsReview(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const toggleReviewShedItems = (id: string) => {
    setScannedShedsReview(prev => prev.map(s => s.id === id ? { ...s, showItems: !s.showItems } : s));
  };

  const addManualShedToReview = () => {
    const defaultShed = shedMaster[0] || { shed_name: 'NEW_SHED', railway: 'WR' };
    const newReviewItem: ScannedConsumingShedReview = {
      id: `manual-review-${Date.now()}`,
      selected: true,
      shed_name: defaultShed.shed_name,
      railway: defaultShed.railway,
      voucher_pages: '1',
      goods_litres: 0,
      coach_litres: 0,
      total_litres: 0,
      pricing_period: 'average',
      period_reason: 'Manually added shed',
      date_range_str: '',
      items: [],
      showItems: false
    };
    setScannedShedsReview(prev => [...prev, newReviewItem]);
  };

  const removeShedFromReview = (id: string) => {
    setScannedShedsReview(prev => prev.filter(s => s.id !== id));
  };

  const updatePeriodName = async (entryId: string, periodKey: 'p1' | 'p2', newName: string) => {
    const entry = priceMaster.find(p => p.id === entryId);
    if (!entry) return;

    const updatedEntry = {
      ...entry,
      periodNames: {
        ...entry.periodNames,
        [periodKey]: newName
      }
    };

    try {
      await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry)
      });
      setPriceMaster(prev => prev.map(p => p.id === entryId ? updatedEntry : p));
    } catch (error) {
      console.error('Error updating period name:', error);
    }
  };

  const deletePriceEntry = async (id: string) => {
    const entry = priceMaster.find(p => p.id === id);
    try {
      await fetch(`/api/prices/${id}`, { method: 'DELETE' });
      setPriceMaster(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting price:', error);
    }
  };

  const generateCertificatesOnlyZip = async () => {
    setIsGenerating(true);
    
    // Auto-save/update before generating
    const sessionId = await handleSaveAction(true);
    
    const zip = new JSZip();

    try {
      for (const shed of selectedSheds) {
        const calc = calculateAmounts(shed);
        if (!calc) continue;

        const doc = new jsPDF('p', 'mm', 'a4');
        const today = new Date().toLocaleDateString('en-GB');

        // Header Design
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('WESTERN RAILWAY RAJKOT DIVISION', 105, 15, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('times', 'bold');
        const headerX = 145;
        doc.text("Sr. DFM's OFFICE, Rajkot.", headerX, 25);
        doc.text(`DT. ${today}`, headerX, 30);

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('C E R T I F I C A T E', 15, 30);

        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        
        const calculatedTotalAmount = shed.is_power_car
          ? Math.round(calc?.primeCost || 0) + Math.round(calc?.excise || 0) + Math.round(calc?.vat || 0) + Math.round(calc?.overhead || 0)
          : Math.round(calc?.coachPrimeCost || 0) + Math.round(calc?.goodsPrimeCost || 0) + Math.round(calc?.excise || 0) + Math.round(calc?.vat || 0) + Math.round(calc?.overhead || 0);
        const totalAmount = (calculatedTotalAmount || 0).toLocaleString('en-IN');
        const totalLitres = ((Number(shed.goods_litres) || 0) + (Number(shed.coach_litres) || 0)).toLocaleString('en-IN');
        
        const getFullMonth = (m: string) => {
          const map: Record<string, string> = {
            'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
            'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
            'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
          };
          return map[m] || m;
        };

        // Justified Paragraph Helper
        const drawJustifiedParagraph = (parts: { text: string; bold: boolean }[], startY: number) => {
          let currentY = startY;
          const lineHeight = 6;
          const leftMargin = 15;
          const rightMargin = 195;
          const indent = 55;

          let allWords: { text: string; bold: boolean }[] = [];
          parts.forEach(p => {
            const words = p.text.split(' ');
            words.forEach((w, i) => {
              if (w === '' && i > 0) return;
              allWords.push({ text: w, bold: p.bold });
            });
          });

          let lineWords: { text: string; bold: boolean }[] = [];
          let currentLineWidth = 0;
          let isFirstLine = startY === 45;

          const renderLine = (words: { text: string; bold: boolean }[], y: number, isLast: boolean, isFirst: boolean) => {
            const startX = isFirst ? indent : leftMargin;
            const availableWidth = rightMargin - startX;
            
            if (isLast || words.length === 1) {
              let x = startX;
              words.forEach(w => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                doc.text(w.text, x, y);
                x += doc.getTextWidth(w.text + ' ');
              });
            } else {
              const totalWordsWidth = words.reduce((acc, w) => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                return acc + doc.getTextWidth(w.text);
              }, 0);
              const totalSpacing = availableWidth - totalWordsWidth;
              const spacingPerWord = totalSpacing / (words.length - 1);
              
              let x = startX;
              words.forEach((w, i) => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                doc.text(w.text, x, y);
                x += doc.getTextWidth(w.text) + spacingPerWord;
              });
            }
          };

          for (let i = 0; i < allWords.length; i++) {
            const word = allWords[i];
            const startX = isFirstLine ? indent : leftMargin;
            const availableWidth = rightMargin - startX;
            
            doc.setFont('times', word.bold ? 'bold' : 'normal');
            const wordWidth = doc.getTextWidth(word.text);
            const spaceWidth = doc.getTextWidth(' ');

            if (currentLineWidth + wordWidth > availableWidth) {
              renderLine(lineWords, currentY, false, isFirstLine);
              currentY += lineHeight;
              lineWords = [word];
              currentLineWidth = wordWidth + spaceWidth;
              isFirstLine = false;
            } else {
              lineWords.push(word);
              currentLineWidth += wordWidth + spaceWidth;
            }
          }
          
          if (lineWords.length > 0) {
            renderLine(lineWords, currentY, true, isFirstLine);
          }
          
          return currentY + lineHeight;
        };

        const p1Parts = [
          { text: 'Certified that an amount of ', bold: false },
          { text: `${totalAmount}/-`, bold: true },
          { text: ' on account of cost and other charges towards ', bold: false },
          { text: `${totalLitres}`, bold: true },
          { text: ' litres of HSD Oil issued to ', bold: false },
          { text: shed.is_power_car ? 'Power Car' : 'Coach/Goods/Shunting Departmental Engines', bold: true },
          { text: ' of ', bold: false },
          { text: `${shed.shed_name} Shed`, bold: true },
          { text: ' of ', bold: false },
          { text: `${shed.railway} Railway`, bold: true },
          { text: ' by DFO-', bold: false },
          { text: `${shed.supplying_shed}`, bold: true },
          { text: ', Rajkot Division, Western Railway, during ', bold: false },
          { text: `${getFullMonth(shed.during_month)} ${shed.during_year}`, bold: true },
          { text: ', as per the statement attached, has been duly accounted for.', bold: false }
        ];

        const p2Parts = [
          { text: 'The same has been audited and found to be a bona fide item of expenditure/receipt, debitable/creditable to TRHQ, ', bold: false },
          { text: `${shed.railway} Railway`, bold: true },
          { text: ', in the accounts for the month of ', bold: false },
          { text: `${getFullMonth(shed.for_month)} ${shed.for_year}`, bold: true },
          { text: ', as issued by DFO-', bold: false },
          { text: `${shed.supplying_shed}`, bold: true },
          { text: '.', bold: false }
        ];

        const nextY = drawJustifiedParagraph(p1Parts, 45);
        const lastY = drawJustifiedParagraph(p2Parts, nextY + 4);

        const qtyTitle = shed.is_power_car 
          ? `SR.DEE./${shed.shed_name} [${shed.railway} RLY]) Qty.HSD OIL`
          : `Shed  ${shed.shed_name}  ( ${shed.railway} RLY. )  Qty. HSD OIL`;

        doc.setFont('times', 'normal');
        doc.text('Encl: One statement', 15, lastY + 25);
        doc.text('For, Divisional Finance Manager,', 195, lastY + 25, { align: 'right' });
        doc.text('Western Railway, Rajkot.', 195, lastY + 30, { align: 'right' });

        doc.setFont('courier', 'bold');
        doc.text('Ltrs', 160, lastY + 50, { align: 'right' });
        doc.text('K.Ltrs', 185, lastY + 50, { align: 'right' });
        doc.setFont('courier', 'normal');
        
        doc.text(qtyTitle, 15, lastY + 57);
        doc.text('(COACH)', 120, lastY + 57);
        doc.text(`${shed.coach_litres}`, 160, lastY + 57, { align: 'right' });
        doc.text(`${(shed.coach_litres / 1000).toFixed(3)}`, 185, lastY + 57, { align: 'right' });

        if (!shed.is_power_car) {
          doc.text('(GOODS)', 120, lastY + 64);
          doc.text(`${shed.goods_litres}`, 160, lastY + 64, { align: 'right' });
          doc.text(`${(shed.goods_litres / 1000).toFixed(3)}`, 185, lastY + 64, { align: 'right' });
        }

        doc.line(140, lastY + 67, 195, lastY + 67);
        doc.setFont('courier', 'bold');
        doc.text('TOTAL', 120, lastY + 72);
        doc.text(`${shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)}`, 160, lastY + 72, { align: 'right' });
        doc.text(`${((shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)) / 1000).toFixed(3)}`, 185, lastY + 72, { align: 'right' });
        doc.setFont('courier', 'normal');

        const tableBody = [];
        if (shed.is_power_car) {
          tableBody.push(['Base Price', Math.round(calc.price?.base_price || 0).toLocaleString('en-IN'), '08066031', Math.round(calc.primeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Excise Duty', Math.round(calc.price?.excise || 0).toLocaleString('en-IN'), '08066036', Math.round(calc.excise || 0).toLocaleString('en-IN')]);
          tableBody.push(['Sales Tax/Add.Tax', Math.round(calc.price?.vat || 0).toLocaleString('en-IN'), '08066038', Math.round(calc.vat || 0).toLocaleString('en-IN')]);
          tableBody.push(['Other Taxes & Levies', Math.round(calc.price?.overhead || 0).toLocaleString('en-IN'), '08066099', Math.round(calc.overhead || 0).toLocaleString('en-IN')]);
        } else {
          tableBody.push(['Base Price (COACH)', Math.round(calc.price?.base_price || 0).toLocaleString('en-IN'), COACH_ALLOCATION, Math.round(calc.coachPrimeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Base Price (GOODS)', '', GOODS_ALLOCATION, Math.round(calc.goodsPrimeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Excise Duty', Math.round(calc.price?.excise || 0).toLocaleString('en-IN'), '10023136', Math.round(calc.excise || 0).toLocaleString('en-IN')]);
          tableBody.push(['Sales Tax/Add.Tax', Math.round(calc.price?.vat || 0).toLocaleString('en-IN'), '10023238', Math.round(calc.vat || 0).toLocaleString('en-IN')]);
          tableBody.push(['Other Taxes & Levies', Math.round(calc.price?.overhead || 0).toLocaleString('en-IN'), '10022199', Math.round(calc.overhead || 0).toLocaleString('en-IN')]);
        }
        tableBody.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, Math.round((calc.price?.base_price || 0) + (calc.price?.excise || 0) + (calc.price?.vat || 0) + (calc.price?.overhead || 0)).toLocaleString('en-IN'), '', { content: (calculatedTotalAmount || 0).toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }]);

        autoTable(doc, {
          startY: lastY + 85,
          head: [['Particulars', 'Rate per K.L.R.S.', 'Allocation', 'Amount']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, font: 'times' },
          styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1, font: 'times', textColor: [0, 0, 0] },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          }
        });

        const finalPdfBytes = doc.output('arraybuffer');
        const fileName = `${shed.shed_name}_${shed.railway}_RS_${calculatedTotalAmount}_${shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)}_LITRES_${shed.during_month}${shed.during_year}.pdf`;
        zip.file(fileName, finalPdfBytes);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `HSD_Certificates_Only_${selectedMonth}_${selectedYear}.zip`;
      link.click();
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Error generating certificates. Please check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllSheds = () => {
    if (window.confirm('Are you sure you want to clear all added sheds?')) {
      setSelectedSheds([]);
    }
  };

  const handleSaveAction = async (silent = false) => {
    const finalName = sessionName || `Log ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    setIsSavingSession(true);
    const sessionId = currentSessionId || Math.random().toString(36).substr(2, 9);
    const existingLog = sessions.find(s => s.id === sessionId);

    const newSession: Session = {
      id: sessionId,
      name: finalName,
      description: sessionDesc,
      is_completed: sessionStatus === 'completed',
      created_at: existingLog?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: {
        selectedMonth,
        selectedYear,
        selectedSupplyingShed,
        masterVoucherPdf,
        masterVoucherPdfName,
        selectedSheds
      }
    };

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      
      if (sessionStatus === 'completed') {
        await fetch(`/api/sessions/${sessionId}/complete`, { method: 'PATCH' });
        await recordAnalyticsData(selectedSheds, sessionId);
      }

      setSessions(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)]);
      setCurrentSessionId(sessionId);
      if (!sessionName) setSessionName(finalName);
      if (!silent) setSuccessMessage(currentSessionId ? 'Work log updated' : 'Work log saved');

      return sessionId;
    } catch (e) {
      console.error('Save session error:', e);
      if (!silent) alert('Error saving work log');
      return null;
    } finally {
      setIsSavingSession(false);
    }
  };

  const completeSession = async (id: string, skipConfirm = false) => {
    const logToComplete = sessions.find(s => s.id === id);
    if (!logToComplete) return;

    if (!skipConfirm && !window.confirm('Mark this work log as COMPLETED? \n\nThis will freeze the data and sync it to the dashboard analytics.')) {
      return;
    }

    try {
      await fetch(`/api/sessions/${id}/complete`, { method: 'PATCH' });
      
      // Record analytics data
      await recordAnalyticsData(logToComplete.state.selectedSheds, id);
      
      setSessions(prev => prev.map(s => s.id === id ? { ...s, is_completed: true } : s));
      setSuccessMessage('Work log marked as completed');
      
      // Refresh analytics
      const analyticsRes = await fetch('/api/analytics');
      const updatedAnalytics = await analyticsRes.json();
      setConsumptionRecords(updatedAnalytics);
      
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setSelectedSheds([]);
      }
    } catch (e) {
      console.error('Complete session error:', e);
      alert('Error finalizing work log');
    }
  };

  const deleteSession = async (id: string) => {
    const logToDelete = sessions.find(s => s.id === id);
    if (!logToDelete) return;

    if (!window.confirm('DELETE this work log? \n\nThis action cannot be undone and will remove associated records from analytics.')) {
      return;
    }

    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) setCurrentSessionId(null);
      
      // Refresh analytics as records are deleted cascade
      const analyticsRes = await fetch('/api/analytics');
      const updatedAnalytics = await analyticsRes.json();
      setConsumptionRecords(updatedAnalytics);
      setSuccessMessage('Work log deleted successfully');
    } catch (e) {
      console.error('Delete session error:', e);
      alert('Error deleting work log');
    }
  };

  const loadSession = async (session: Session) => {
    const { state } = session;
    setCurrentSessionId(session.id);
    setSessionName(session.name);
    setSessionDesc(session.description || '');
    setSessionStatus(session.is_completed ? 'completed' : 'in_progress');
    setSelectedMonth(state.selectedMonth);
    setSelectedYear(state.selectedYear);
    setSelectedSupplyingShed(state.selectedSupplyingShed);
    setMasterVoucherPdf(state.masterVoucherPdf);
    setMasterVoucherPdfName(state.masterVoucherPdfName);
    setSelectedSheds(state.selectedSheds);
    
    // Revoke old URL and create new one if pdf exists
    if (masterVoucherPdfUrl) URL.revokeObjectURL(masterVoucherPdfUrl);
    if (state.masterVoucherPdf) {
      try {
        const base64Content = state.masterVoucherPdf.includes(',') ? state.masterVoucherPdf.split(',')[1] : state.masterVoucherPdf;
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setMasterVoucherPdfUrl(url);
      } catch (e) {
        console.error('Error creating PDF URL from session:', e);
      }
    } else {
      setMasterVoucherPdfUrl(null);
    }
    
    setActiveTab('generate');
    setSuccessMessage('Work log loaded successfully');
  };

  const recordAnalyticsData = async (shedsToRecord: SelectedShed[], sessionId: string) => {
    const records = shedsToRecord.map(shed => {
      const calc = calculateAmounts(shed);
      return {
        id: Math.random().toString(36).substr(2, 9),
        session_id: sessionId,
        shed_name: shed.shed_name,
        railway: shed.railway,
        supplying_shed: shed.supplying_shed,
        month: shed.for_month,
        year: shed.for_year,
        during_month: shed.during_month,
        during_year: shed.during_year,
        goods_litres: shed.goods_litres,
        coach_litres: shed.coach_litres,
        total_litres: shed.goods_litres + shed.coach_litres,
        amount: calc?.total || 0,
        is_power_car: shed.is_power_car,
        pricing_period: shed.pricing_period
      };
    });

    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });
    } catch (e) {
      console.error('Record analytics error:', e);
    }
  };

  const parsePageRanges = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',').map(p => p.trim());
    
    parts.forEach(part => {
      if (part.includes('-')) {
        const rangeParts = part.split('-').map(n => parseInt(n.trim()));
        if (rangeParts.length === 2) {
          const [start, end] = rangeParts;
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(end, maxPages); i++) {
              pages.add(i - 1); // 0-indexed
            }
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pages.add(page - 1); // 0-indexed
        }
      }
    });
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const generateCertificatesZip = async () => {
    setIsGenerating(true);
    
    // Auto-save/update before generating
    const sessionId = await handleSaveAction(true);
    
    const zip = new JSZip();

    try {
      for (const shed of selectedSheds) {
        const calc = calculateAmounts(shed);
        if (!calc) continue;

        // 1. Generate Certificate PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        const today = new Date().toLocaleDateString('en-GB');

        // Header Design
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('WESTERN RAILWAY RAJKOT DIVISION', 105, 15, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('times', 'bold');
        const headerX = 145;
        doc.text("Sr. DFM's OFFICE, Rajkot.", headerX, 25);
        doc.text(`DT. ${today}`, headerX, 30);

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('C E R T I F I C A T E', 15, 30);

        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        
        const calculatedTotalAmount = shed.is_power_car
          ? Math.round(calc?.primeCost || 0) + Math.round(calc?.excise || 0) + Math.round(calc?.vat || 0) + Math.round(calc?.overhead || 0)
          : Math.round(calc?.coachPrimeCost || 0) + Math.round(calc?.goodsPrimeCost || 0) + Math.round(calc?.excise || 0) + Math.round(calc?.vat || 0) + Math.round(calc?.overhead || 0);
        const totalAmount = (calculatedTotalAmount || 0).toLocaleString('en-IN');
        const totalLitres = ((Number(shed.goods_litres) || 0) + (Number(shed.coach_litres) || 0)).toLocaleString('en-IN');
        
        const getFullMonth = (m: string) => {
          const map: Record<string, string> = {
            'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
            'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
            'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
          };
          return map[m] || m;
        };

        // Justified Paragraph Helper
        const drawJustifiedParagraph = (parts: { text: string; bold: boolean }[], startY: number) => {
          let currentY = startY;
          const lineHeight = 6;
          const leftMargin = 15;
          const rightMargin = 195;
          const indent = 55;

          // Flatten parts into words with formatting
          let allWords: { text: string; bold: boolean }[] = [];
          parts.forEach(p => {
            const words = p.text.split(' ');
            words.forEach((w, i) => {
              if (w === '' && i > 0) return;
              allWords.push({ text: w, bold: p.bold });
            });
          });

          let lineWords: { text: string; bold: boolean }[] = [];
          let currentLineWidth = 0;
          let isFirstLine = startY === 45; // Only indent the very first paragraph of the cert

          const renderLine = (words: { text: string; bold: boolean }[], y: number, isLast: boolean, isFirst: boolean) => {
            const startX = isFirst ? indent : leftMargin;
            const availableWidth = rightMargin - startX;
            
            if (isLast || words.length === 1) {
              let x = startX;
              words.forEach(w => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                doc.text(w.text, x, y);
                x += doc.getTextWidth(w.text + ' ');
              });
            } else {
              const totalWordsWidth = words.reduce((acc, w) => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                return acc + doc.getTextWidth(w.text);
              }, 0);
              const totalSpacing = availableWidth - totalWordsWidth;
              const spacingPerWord = totalSpacing / (words.length - 1);
              
              let x = startX;
              words.forEach((w, i) => {
                doc.setFont('times', w.bold ? 'bold' : 'normal');
                doc.text(w.text, x, y);
                x += doc.getTextWidth(w.text) + spacingPerWord;
              });
            }
          };

          for (let i = 0; i < allWords.length; i++) {
            const word = allWords[i];
            const startX = isFirstLine ? indent : leftMargin;
            const availableWidth = rightMargin - startX;
            
            doc.setFont('times', word.bold ? 'bold' : 'normal');
            const wordWidth = doc.getTextWidth(word.text);
            const spaceWidth = doc.getTextWidth(' ');

            if (currentLineWidth + wordWidth > availableWidth) {
              renderLine(lineWords, currentY, false, isFirstLine);
              currentY += lineHeight;
              lineWords = [word];
              currentLineWidth = wordWidth + spaceWidth;
              isFirstLine = false;
            } else {
              lineWords.push(word);
              currentLineWidth += wordWidth + spaceWidth;
            }
          }
          
          if (lineWords.length > 0) {
            renderLine(lineWords, currentY, true, isFirstLine);
          }
          
          return currentY + lineHeight;
        };

        const p1Parts = [
          { text: 'Certified that an amount of ', bold: false },
          { text: `${totalAmount}/-`, bold: true },
          { text: ' on account of cost and other charges towards ', bold: false },
          { text: `${totalLitres}`, bold: true },
          { text: ' litres of HSD Oil issued to ', bold: false },
          { text: shed.is_power_car ? 'Power Car' : 'Coach/Goods/Shunting Departmental Engines', bold: true },
          { text: ' of ', bold: false },
          { text: `${shed.shed_name} Shed`, bold: true },
          { text: ' of ', bold: false },
          { text: `${shed.railway} Railway`, bold: true },
          { text: ' by DFO-', bold: false },
          { text: `${shed.supplying_shed}`, bold: true },
          { text: ', Rajkot Division, Western Railway, during ', bold: false },
          { text: `${getFullMonth(shed.during_month)} ${shed.during_year}`, bold: true },
          { text: ', as per the statement attached, has been duly accounted for.', bold: false }
        ];

        const p2Parts = [
          { text: 'The same has been audited and found to be a bona fide item of expenditure/receipt, debitable/creditable to TRHQ, ', bold: false },
          { text: `${shed.railway} Railway`, bold: true },
          { text: ', in the accounts for the month of ', bold: false },
          { text: `${getFullMonth(shed.for_month)} ${shed.for_year}`, bold: true },
          { text: ', as issued by DFO-', bold: false },
          { text: `${shed.supplying_shed}`, bold: true },
          { text: '.', bold: false }
        ];

        const nextY = drawJustifiedParagraph(p1Parts, 45);
        const lastY = drawJustifiedParagraph(p2Parts, nextY + 4);

        const qtyTitle = shed.is_power_car 
          ? `SR.DEE./${shed.shed_name} [${shed.railway} RLY]) Qty.HSD OIL`
          : `Shed  ${shed.shed_name}  ( ${shed.railway} RLY. )  Qty. HSD OIL`;

        doc.setFont('times', 'normal');
        doc.text('Encl: One statement', 15, lastY + 25);
        doc.text('For, Divisional Finance Manager,', 195, lastY + 25, { align: 'right' });
        doc.text('Western Railway, Rajkot.', 195, lastY + 30, { align: 'right' });

        doc.setFont('courier', 'bold');
        doc.text('Ltrs', 160, lastY + 50, { align: 'right' });
        doc.text('K.Ltrs', 185, lastY + 50, { align: 'right' });
        doc.setFont('courier', 'normal');
        
        doc.text(qtyTitle, 15, lastY + 57);
        doc.text('(COACH)', 120, lastY + 57);
        doc.text(`${shed.coach_litres}`, 160, lastY + 57, { align: 'right' });
        doc.text(`${(shed.coach_litres / 1000).toFixed(3)}`, 185, lastY + 57, { align: 'right' });

        if (!shed.is_power_car) {
          doc.text('(GOODS)', 120, lastY + 64);
          doc.text(`${shed.goods_litres}`, 160, lastY + 64, { align: 'right' });
          doc.text(`${(shed.goods_litres / 1000).toFixed(3)}`, 185, lastY + 64, { align: 'right' });
        }

        doc.line(140, lastY + 67, 195, lastY + 67);
        doc.setFont('courier', 'bold');
        doc.text('TOTAL', 120, lastY + 72);
        doc.text(`${shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)}`, 160, lastY + 72, { align: 'right' });
        doc.text(`${((shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)) / 1000).toFixed(3)}`, 185, lastY + 72, { align: 'right' });
        doc.setFont('courier', 'normal');

        const tableBody = [];
        if (shed.is_power_car) {
          tableBody.push(['Base Price', Math.round(calc.price?.base_price || 0).toLocaleString('en-IN'), '08066031', Math.round(calc.primeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Excise Duty', Math.round(calc.price?.excise || 0).toLocaleString('en-IN'), '08066036', Math.round(calc.excise || 0).toLocaleString('en-IN')]);
          tableBody.push(['Sales Tax/Add.Tax', Math.round(calc.price?.vat || 0).toLocaleString('en-IN'), '08066038', Math.round(calc.vat || 0).toLocaleString('en-IN')]);
          tableBody.push(['Other Taxes & Levies', Math.round(calc.price?.overhead || 0).toLocaleString('en-IN'), '08066099', Math.round(calc.overhead || 0).toLocaleString('en-IN')]);
        } else {
          tableBody.push(['Base Price (COACH)', Math.round(calc.price?.base_price || 0).toLocaleString('en-IN'), COACH_ALLOCATION, Math.round(calc.coachPrimeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Base Price (GOODS)', '', GOODS_ALLOCATION, Math.round(calc.goodsPrimeCost || 0).toLocaleString('en-IN')]);
          tableBody.push(['Excise Duty', Math.round(calc.price?.excise || 0).toLocaleString('en-IN'), '10023136', Math.round(calc.excise || 0).toLocaleString('en-IN')]);
          tableBody.push(['Sales Tax/Add.Tax', Math.round(calc.price?.vat || 0).toLocaleString('en-IN'), '10023238', Math.round(calc.vat || 0).toLocaleString('en-IN')]);
          tableBody.push(['Other Taxes & Levies', Math.round(calc.price?.overhead || 0).toLocaleString('en-IN'), '10022199', Math.round(calc.overhead || 0).toLocaleString('en-IN')]);
        }
        tableBody.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, Math.round((calc.price?.base_price || 0) + (calc.price?.excise || 0) + (calc.price?.vat || 0) + (calc.price?.overhead || 0)).toLocaleString('en-IN'), '', { content: (calculatedTotalAmount || 0).toLocaleString('en-IN'), styles: { fontStyle: 'bold' } }]);

        autoTable(doc, {
          startY: lastY + 85,
          head: [['Particulars', 'Rate per K.L.R.S.', 'Allocation', 'Amount']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, font: 'times' },
          styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1, font: 'times', textColor: [0, 0, 0] },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          }
        });

        const certPdfBytes = doc.output('arraybuffer');
        
        // 2. Merge with Voucher and Pricing PDF
        const mergedPdf = await PDFDocument.create();
        const certPdfDoc = await PDFDocument.load(certPdfBytes);
        const certPages = await mergedPdf.copyPages(certPdfDoc, certPdfDoc.getPageIndices());
        certPages.forEach(p => mergedPdf.addPage(p));

        // Add Voucher PDF
        if (shed.voucher_pdf_base64) {
          try {
            const voucherBytes = Uint8Array.from(atob(shed.voucher_pdf_base64.split(',')[1]), c => c.charCodeAt(0));
            const voucherPdfDoc = await PDFDocument.load(voucherBytes);
            const voucherPages = await mergedPdf.copyPages(voucherPdfDoc, voucherPdfDoc.getPageIndices());
            voucherPages.forEach(p => mergedPdf.addPage(p));
          } catch (e) {
            console.error('Error adding individual voucher PDF:', e);
          }
        } else if (masterVoucherPdf && shed.voucher_pages) {
          try {
            const masterBytes = Uint8Array.from(atob(masterVoucherPdf.split(',')[1]), c => c.charCodeAt(0));
            const masterPdfDoc = await PDFDocument.load(masterBytes);
            const maxPages = masterPdfDoc.getPageCount();
            const pageIndices = parsePageRanges(shed.voucher_pages, maxPages);
            
            if (pageIndices.length > 0) {
              const copiedPages = await mergedPdf.copyPages(masterPdfDoc, pageIndices);
              copiedPages.forEach(p => mergedPdf.addPage(p));
            }
          } catch (e) {
            console.error('Error extracting pages from master voucher PDF:', e);
          }
        }

        // Add Pricing PDF
        const priceEntry = priceMaster.find(p => p.supplying_shed === shed.supplying_shed && p.month === shed.during_month && p.year === shed.during_year);
        if (priceEntry) {
          if (shed.pricing_period === 'average') {
            // Merge p1 and p2 for average
            const pdf1 = priceEntry.periods.p1.pdf_base64;
            const pdf2 = priceEntry.periods.p2.pdf_base64;
            
            if (pdf1) {
              try {
                const p1Bytes = Uint8Array.from(atob(pdf1.split(',')[1]), c => c.charCodeAt(0));
                const doc1 = await PDFDocument.load(p1Bytes);
                const pages1 = await mergedPdf.copyPages(doc1, doc1.getPageIndices());
                pages1.forEach(p => mergedPdf.addPage(p));
              } catch (e) {
                console.error('Error adding pricing PDF p1:', e);
              }
            }
            
            if (pdf2) {
              try {
                const p2Bytes = Uint8Array.from(atob(pdf2.split(',')[1]), c => c.charCodeAt(0));
                const doc2 = await PDFDocument.load(p2Bytes);
                const pages2 = await mergedPdf.copyPages(doc2, doc2.getPageIndices());
                pages2.forEach(p => mergedPdf.addPage(p));
              } catch (e) {
                console.error('Error adding pricing PDF p2:', e);
              }
            }
          } else {
            const pricingPdfBase64 = priceEntry.periods[shed.pricing_period].pdf_base64;
            if (pricingPdfBase64) {
              try {
                const pricingBytes = Uint8Array.from(atob(pricingPdfBase64.split(',')[1]), c => c.charCodeAt(0));
                const pricingPdfDoc = await PDFDocument.load(pricingBytes);
                const pricingPages = await mergedPdf.copyPages(pricingPdfDoc, pricingPdfDoc.getPageIndices());
                pricingPages.forEach(p => mergedPdf.addPage(p));
              } catch (e) {
                console.error('Error adding pricing PDF:', e);
              }
            }
          }
        }

        const finalPdfBytes = await mergedPdf.save();
        const fileName = `${shed.shed_name}_${shed.railway}_RS_${calculatedTotalAmount}_${shed.coach_litres + (shed.is_power_car ? 0 : shed.goods_litres)}_LITRES_${shed.during_month}${shed.during_year}.pdf`;
        zip.file(fileName, finalPdfBytes);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = `HSD_Certificates_${selectedMonth}_${selectedYear}.zip`;
      link.click();
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Error generating certificates. Please check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0052CC] p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Western Railway</h1>
              <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">HSD Oil Cost Certificate System</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('generate')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === 'generate' ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <Calculator className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === 'prices' ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <Settings className="w-4 h-4" />
              Price Master
            </button>
            <button
              onClick={() => setActiveTab('sheds')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === 'sheds' ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <Building2 className="w-4 h-4" />
              Shed Master
            </button>
            <button
              onClick={() => setActiveTab('worklogs')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === 'worklogs' ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <History className="w-4 h-4" />
              Work Logs
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === 'analytics' ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center bg-[#0052CC]/5 p-4 rounded-2xl border border-[#0052CC]/10">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl border border-[#0052CC]/10 shadow-sm">
                    <History className="w-5 h-5 text-[#0052CC]" />
                  </div>
                  <div>
                    <div className={cn(
                      "flex items-center gap-1.5 mb-0.5 px-2 py-0.5 rounded-full w-fit",
                      currentSessionId ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      <p className="text-[9px] font-black uppercase tracking-[0.15em]">
                        {currentSessionId ? 'Active Session' : 'Draft Session'}
                      </p>
                    </div>
                    <h2 className="text-sm font-black text-[#1A1A1A] line-clamp-1">
                      {currentSessionId 
                        ? sessions.find(s => s.id === currentSessionId)?.name || 'Loading...'
                        : 'New Performance Log'}
                    </h2>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createNewLog}
                    className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#6B7280] hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    New Log
                  </button>
                  <button
                    onClick={() => handleSaveAction()}
                    className="px-4 py-2 bg-[#0052CC] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#0052CC]/10 hover:shadow-[#0052CC]/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    {currentSessionId ? 'Update Log' : 'Save Log'}
                  </button>
                </div>
              </div>

              {isSessionFinalized && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Archived/Finalized Work Log Mode</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      This work log has been completed and finalized. You are allowed to edit it; any updates you make will be saved and synchronized to analytics.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4 Sections */}
              {/* Step 1: Global Config */}
              <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="text-[#0052CC] w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Step 1: Select Period & Supply</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#6B7280] uppercase ml-1">For the month of</label>
                    <select
                      disabled={isCompleted}
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all outline-none"
                    >
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#6B7280] uppercase ml-1">Year</label>
                    <select
                      disabled={isCompleted}
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all outline-none"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#6B7280] uppercase ml-1">Supplying Shed</label>
                    <select
                      disabled={isCompleted}
                      value={selectedSupplyingShed}
                      onChange={(e) => setSelectedSupplyingShed(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all outline-none"
                    >
                      {Array.from(new Set(priceMaster.map(p => p.supplying_shed))).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#6B7280] uppercase ml-1">Certificate Date</label>
                    <div className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium text-[#6B7280]">
                      {new Date().toLocaleDateString('en-GB')} (Auto)
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Master Voucher PDF */}
              <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="text-[#0052CC] w-5 h-5" />
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Step 2: Upload Master Voucher PDF</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Upload combined fuel vouchers (HAPA / WKR) to extract consuming sheds & fuel figures</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (masterVoucherPdf) {
                        setVoucherPdfBase64(masterVoucherPdf);
                        setVoucherPdfName(masterVoucherPdfName);
                      }
                      setShowVoucherOcrModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#0052CC] to-[#0747A6] hover:from-[#0747A6] hover:to-[#0052CC] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer w-fit"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI Scan Combined Voucher</span>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={isCompleted}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await fileToBase64(file);
                          setMasterVoucherPdf(base64);
                          setMasterVoucherPdfName(file.name);
                          setVoucherPdfBase64(base64);
                          setVoucherPdfName(file.name);
                          
                          // Create Object URL for preview
                          if (masterVoucherPdfUrl) URL.revokeObjectURL(masterVoucherPdfUrl);
                          const url = URL.createObjectURL(file);
                          setMasterVoucherPdfUrl(url);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all",
                      masterVoucherPdf ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}>
                      {masterVoucherPdf ? (
                        <>
                          <div className="bg-emerald-500 p-2 rounded-full">
                            <Check className="text-white w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-700">{masterVoucherPdfName}</p>
                            <p className="text-xs text-emerald-600 mt-1">Master Combined Voucher uploaded successfully</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-[#0052CC]/10 p-3 rounded-full">
                            <Upload className="text-[#0052CC] w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-[#1A1A1A]">Click or drag to upload Combined Voucher PDF (HAPA / WKR)</p>
                            <p className="text-xs text-[#6B7280] mt-1">AI can OCR and automatically detect Consuming Sheds (SGUJ, ABR, ROZA), page ranges, and Coach/Goods litres</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {masterVoucherPdf && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setMasterVoucherPdf(null);
                          setMasterVoucherPdfName(null);
                          if (masterVoucherPdfUrl) URL.revokeObjectURL(masterVoucherPdfUrl);
                          setMasterVoucherPdfUrl(null);
                          setShowPdfPreview(false);
                        }}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 flex items-center justify-center gap-2 font-bold text-sm"
                        title="Remove PDF"
                      >
                        <Trash2 className="w-5 h-5" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {masterVoucherPdf && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-[#0052CC] shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Combined Voucher Ready for AI Extraction</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Scan multiple consuming sheds, extract page numbers/ranges, classify Coach & Goods litres from Train Nos, and review before adding to Step 3.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setVoucherPdfBase64(masterVoucherPdf);
                        setVoucherPdfName(masterVoucherPdfName);
                        setShowVoucherOcrModal(true);
                        if (scannedShedsReview.length === 0) {
                          handleRunCombinedVoucherScan(masterVoucherPdf, masterVoucherPdfName || undefined);
                        }
                      }}
                      className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan & Review Sheds</span>
                    </button>
                  </div>
                )}
              </section>

              {/* Step 3: Add Sheds */}
              <div className={cn(
                "grid gap-8 transition-all duration-500",
                masterVoucherPdf && showPdfPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
              )}>
                {masterVoucherPdf && showPdfPreview && (
                  <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 h-[calc(100vh-120px)] sticky top-24"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <FileText className="text-[#0052CC] w-5 h-5" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Master Voucher Preview</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {masterVoucherPdfUrl && (
                          <a 
                            href={masterVoucherPdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-[#0052CC]/5 rounded-lg text-[#0052CC] transition-colors flex items-center gap-1.5 text-xs font-bold"
                            title="Open in New Tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Full View
                          </a>
                        )}
                        <button 
                          onClick={() => setShowPdfPreview(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-[calc(100%-48px)]">
                      {masterVoucherPdf && <PdfCanvasRenderer pdfData={masterVoucherPdf} />}
                    </div>
                  </motion.section>
                )}

                <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 h-fit">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-[#0052CC] w-5 h-5" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Step 3: Add Consuming Sheds</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (masterVoucherPdf) {
                            setVoucherPdfBase64(masterVoucherPdf);
                            setVoucherPdfName(masterVoucherPdfName);
                          }
                          setShowVoucherOcrModal(true);
                        }}
                        className="text-xs font-bold text-white bg-gradient-to-r from-[#0052CC] to-[#0747A6] hover:from-[#0747A6] hover:to-[#0052CC] px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Scan combined voucher with Gemini OCR to auto-populate consuming sheds list"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>AI Scan Voucher</span>
                      </button>
                      {masterVoucherPdf && !showPdfPreview && (
                        <button
                          onClick={() => setShowPdfPreview(true)}
                          className="text-xs font-bold text-[#0052CC] hover:bg-[#0052CC]/5 px-3 py-1.5 rounded-lg border border-[#0052CC] flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Show PDF
                        </button>
                      )}
                      {selectedSheds.length > 0 && !isCompleted && (
                        <button
                          onClick={clearAllSheds}
                          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                
                <div className="relative mb-8">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                    <input
                      disabled={isCompleted}
                      type="text"
                      placeholder="Search shed name or railway (e.g. PUNE, CR)..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (!isCompleted) setIsDropdownOpen(true);
                      }}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto"
                      >
                        {filteredSheds.length > 0 ? (
                          filteredSheds.map(shed => (
                            <button
                              key={shed.id}
                              onClick={() => addShedToGeneration(shed)}
                              className="w-full px-4 py-3 text-left hover:bg-[#F3F4F6] flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <span className="font-bold text-sm">{shed.shed_name}</span>
                                <span className="text-xs text-[#6B7280] ml-2">({shed.railway})</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] group-hover:text-[#0052CC]">Add Shed</span>
                                <Plus className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#0052CC]" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-[#6B7280] text-sm italic">
                            No sheds found matching "{searchTerm}"
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Sheds List */}
                <div className="space-y-4">
                  {selectedSheds.length > 0 && (
                    <div className="bg-gradient-to-r from-[#0052CC]/10 to-[#0052CC]/5 border border-[#0052CC]/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-[#0052CC] uppercase tracking-widest mb-1">Total Estimated Package Amount</p>
                        <p className="text-sm text-[#4B5563] font-medium">
                          Aggregate estimate of <span className="font-bold text-[#1A1A1A]">{selectedSheds.length} consuming shed{selectedSheds.length > 1 ? 's' : ''}</span>
                        </p>
                      </div>
                      <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl border border-[#0052CC]/10 shadow-sm w-fit">
                        <span className="text-xs font-bold text-[#6B7280]">Total:</span>
                        <span className="text-2xl font-black text-[#0052CC]">
                          ₹{(selectedSheds.reduce((sum, s) => {
                            const c = calculateAmounts(s);
                            const roundedTotal = c ? (s.is_power_car
                              ? Math.round(c.primeCost || 0) + Math.round(c.excise || 0) + Math.round(c.vat || 0) + Math.round(c.overhead || 0)
                              : Math.round(c.coachPrimeCost || 0) + Math.round(c.goodsPrimeCost || 0) + Math.round(c.excise || 0) + Math.round(c.vat || 0) + Math.round(c.overhead || 0))
                              : 0;
                            return sum + (roundedTotal || 0);
                          }, 0) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSheds.length > 0 ? (
                    selectedSheds.map((shed, index) => {
                      const calc = calculateAmounts(shed);
                      const hasPrice = !!calc;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "group relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all",
                            hasPrice ? "border-[#E5E7EB]" : "border-red-200 bg-red-50/10"
                          )}
                          key={shed.instanceId}
                        >
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0052CC] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white z-10">
                            {selectedSheds.length - index}
                          </div>
                          <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-[#0052CC]/10 p-2 rounded-lg">
                                  <Building2 className="text-[#0052CC] w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-[#1A1A1A]">{shed.shed_name}</h3>
                                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{shed.railway} Railway</p>
                                </div>
                                {!hasPrice && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">
                                    <AlertCircle className="w-3 h-3" />
                                    Price Missing
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Estimated Total</p>
                                  <p className="text-xl font-black text-[#0052CC]">
                                    {hasPrice ? `₹${(Math.round(calc.total || 0) || 0).toLocaleString('en-IN')}` : '—'}
                                  </p>
                                </div>
                                {!isCompleted && (
                                  <button
                                    onClick={() => removeShed(shed.instanceId)}
                                    className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className={cn(
                              "grid gap-4",
                              masterVoucherPdf && showPdfPreview 
                                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                            )}>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">Power Car</label>
                                <div className="flex items-center justify-between bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 h-[42px]">
                                  <input
                                    disabled={isCompleted}
                                    type="checkbox"
                                    checked={shed.is_power_car}
                                    onChange={(e) => updateSelectedShed(shed.instanceId, { is_power_car: e.target.checked })}
                                    className="w-5 h-5 rounded border-[#E5E7EB] text-[#0052CC] focus:ring-[#0052CC]"
                                  />
                                  <span className="text-[10px] font-bold text-[#6B7280] uppercase">Active</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">
                                  {masterVoucherPdf ? "Voucher Pages" : "Voucher PDF"}
                                </label>
                                {masterVoucherPdf ? (
                                  <input
                                    disabled={isCompleted}
                                    type="text"
                                    placeholder="e.g. 1-3, 5"
                                    value={shed.voucher_pages || ''}
                                    onChange={(e) => updateSelectedShed(shed.instanceId, { voucher_pages: e.target.value })}
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent h-[42px]"
                                  />
                                ) : (
                                  <div className="relative h-[42px]">
                                    <input
                                      disabled={isCompleted}
                                      type="file"
                                      accept=".pdf"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const base64 = await fileToBase64(file);
                                          updateSelectedShed(shed.instanceId, { 
                                            voucher_pdf_base64: base64,
                                            voucher_pdf_name: file.name,
                                            voucher_pdf_size: file.size.toString(),
                                            voucher_pdf_type: file.type,
                                            voucher_pdf_last_modified: file.lastModified
                                          });
                                        }
                                      }}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={cn(
                                      "w-full h-full border border-[#E5E7EB] rounded-xl px-3 flex items-center justify-between transition-all",
                                      shed.voucher_pdf_base64 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F9FAFB] text-[#6B7280]"
                                    )}>
                                      <span className="text-xs font-bold truncate">
                                        {shed.voucher_pdf_base64 ? "Voucher Attached" : "Click to Upload"}
                                      </span>
                                      {shed.voucher_pdf_base64 ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">Coach Litres</label>
                                <input
                                  disabled={isCompleted}
                                  type="number"
                                  value={shed.coach_litres}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { coach_litres: parseFloat(e.target.value) || 0 })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent h-[42px]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">Goods Litres</label>
                                <input
                                  type="number"
                                  value={shed.goods_litres}
                                  disabled={isCompleted || shed.is_power_car}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { goods_litres: parseFloat(e.target.value) || 0 })}
                                  className={cn(
                                    "w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent h-[42px]",
                                    (isCompleted || shed.is_power_car) && "opacity-50 cursor-not-allowed"
                                  )}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">Supplying Shed</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.supplying_shed}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { supplying_shed: e.target.value })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  <option value="HXP">HXP</option>
                                  <option value="WKR">WKR</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">Pricing Period</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.pricing_period}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { pricing_period: e.target.value as any })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  {(() => {
                                    const entry = priceMaster.find(p => p.supplying_shed === shed.supplying_shed && p.month === shed.during_month && p.year === shed.during_year);
                                    return (
                                      <>
                                        <option value="p1">{entry?.periodNames?.p1 || '1st-15th'}</option>
                                        <option value="p2">{entry?.periodNames?.p2 || '16th-End'}</option>
                                        <option value="average">Average</option>
                                      </>
                                    );
                                  })()}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">For Month</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.for_month}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { for_month: e.target.value })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">For Year</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.for_year}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { for_year: e.target.value })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">During Month</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.during_month}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { during_month: e.target.value })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1 block min-h-[12px]">During Year</label>
                                <select
                                  disabled={isCompleted}
                                  value={shed.during_year}
                                  onChange={(e) => updateSelectedShed(shed.instanceId, { during_year: e.target.value })}
                                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] h-[42px]"
                                >
                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl py-12 flex flex-col items-center justify-center text-[#9CA3AF]">
                      <Building2 className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium">No sheds added yet. Search above to begin.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

              {/* Step 4: Final Review & Generate */}
              <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-8">
                  <CheckCircle2 className="text-[#0052CC] w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#6B7280]">Step 4: Save & Generate Package</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Log Identity */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1">Log Name</label>
                      <input
                        disabled={isCompleted}
                        placeholder="e.g. Feb 2026 Batch A"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#0052CC] outline-none h-[46px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1">Notes</label>
                      <textarea
                        disabled={isCompleted}
                        placeholder="Optional notes..."
                        value={sessionDesc}
                        onChange={(e) => setSessionDesc(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052CC] outline-none h-[80px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Status & Save */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase ml-1">Processing Status</label>
                      <select
                        disabled={isCompleted}
                        value={sessionStatus}
                        onChange={(e) => setSessionStatus(e.target.value as any)}
                        className={cn(
                          "w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none h-[46px] transition-all",
                          sessionStatus === 'completed' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#1A1A1A]"
                        )}
                      >
                        <option value="in_progress">In Progress (Draft)</option>
                        <option value="completed">Completed (Finalized)</option>
                      </select>
                      <p className="text-[10px] text-[#6B7280] mt-1 italic">
                        {sessionStatus === 'completed' ? 'Finalizing will lock the record and sync analytics.' : 'In Progress allows further edits.'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSaveAction()}
                      disabled={isSavingSession || isCompleted}
                      className="w-full bg-white border border-[#0052CC] text-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl font-bold text-sm hover:bg-[#0052CC]/5 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSavingSession ? <div className="w-4 h-4 border-2 border-[#0052CC]/20 border-t-[#0052CC] rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      {isCompleted ? 'Log finalized' : (currentSessionId ? 'Update Record' : 'Save Permanent Log')}
                    </button>
                  </div>

                  {/* Download Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      disabled={selectedSheds.length === 0 || selectedSheds.some(s => !calculateAmounts(s)) || isGenerating}
                      onClick={generateCertificatesOnlyZip}
                      className="flex-1 bg-[#0052CC] text-white disabled:bg-[#E5E7EB] p-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#0052CC]/10 hover:shadow-[#0052CC]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                      Download certificates (zip)
                    </button>
                    <button
                      disabled={selectedSheds.length === 0 || selectedSheds.some(s => !calculateAmounts(s)) || isGenerating}
                      onClick={generateCertificatesZip}
                      className="bg-[#0052CC]/5 border border-[#0052CC]/20 text-[#0052CC] disabled:opacity-50 p-3 rounded-xl font-bold text-xs hover:bg-[#0052CC]/10 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download Full Package (ZIP)
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : activeTab === 'worklogs' ? (
            <motion.div
              key="worklogs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-[#1A1A1A]">Work Logs & History</h2>
                <p className="text-sm text-[#6B7280] font-medium">Resume your saved progress or manage previous certificate generations.</p>
              </div>
              <WorkLogs 
                sessions={sessions} 
                currentSessionId={currentSessionId}
                onLoad={loadSession} 
                onDelete={deleteSession} 
                onComplete={completeSession}
                priceMaster={priceMaster}
              />
            </motion.div>
          ) : activeTab === 'analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-[#1A1A1A]">Oil Consumption Analytics</h2>
                <p className="text-sm text-[#6B7280] font-medium">Visualizing HSD oil usage patterns, costs, and trends across all railway sheds.</p>
              </div>
              <Analytics records={consumptionRecords} />
            </motion.div>
          ) : activeTab === 'prices' ? (
            <motion.div
              key="prices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Plus className="text-[#0052CC] w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Add New Price Entry</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase">Month</label>
                    <select
                      value={newPriceEntry.month}
                      onChange={(e) => setNewPriceEntry({ ...newPriceEntry, month: e.target.value })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0052CC]"
                    >
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase">Year</label>
                    <select
                      value={newPriceEntry.year}
                      onChange={(e) => setNewPriceEntry({ ...newPriceEntry, year: e.target.value })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0052CC]"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase">Supplying Shed</label>
                    <select
                      value={newPriceEntry.supplying_shed}
                      onChange={(e) => setNewPriceEntry({ ...newPriceEntry, supplying_shed: e.target.value })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0052CC]"
                    >
                      <option value="HXP">HXP</option>
                      <option value="WKR">WKR</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addPriceEntry}
                      className="w-full bg-[#0052CC] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#0747A6] transition-colors"
                    >
                      Add Entry
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Settings className="text-[#0052CC] w-5 h-5" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Price Master Management</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowOcrModal(true);
                        setOcrError(null);
                      }}
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-[#0052CC] to-[#0747A6] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all group cursor-pointer"
                      title="Upload and scan circular PDF with AI/OCR"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                      <span>Scan Circular (AI / OCR)</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-[#6B7280]">Year:</span>
                      <select
                        value={selectedPriceYear}
                        onChange={(e) => setSelectedPriceYear(e.target.value)}
                        className="bg-transparent text-xs font-bold text-[#1A1A1A] border-none outline-none focus:ring-0 p-0 cursor-pointer"
                      >
                        {priceMasterYears.length > 0 ? (
                          priceMasterYears.map(y => <option key={y} value={y}>{y}</option>)
                        ) : (
                          <option value="2026">2026</option>
                        )}
                      </select>
                    </div>

                    <div className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                      Page <span className="font-bold text-[#1A1A1A]">{pricePage}</span> of <span className="font-bold text-[#1A1A1A]">{totalPricePages}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-[#E5E7EB]">Period Info</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB]">Pricing Period</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Base Price</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Excise</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">VAT</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Overhead</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Total Rate</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-center">PDFs</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {paginatedPriceMaster.map((entry) => (
                        <React.Fragment key={entry.id}>
                          {(Object.entries(entry.periods) as [string, PriceData][]).map(([period, data], pIdx) => {
                            const total = (data?.base_price || 0) + (data?.excise || 0) + (data?.vat || 0) + (data?.overhead || 0);
                            return (
                              <tr key={period} className="hover:bg-[#F9FAFB] transition-colors group">
                                {pIdx === 0 && (
                                  <td rowSpan={3} className="px-6 py-4 font-black text-[#1A1A1A] bg-white border-r border-[#E5E7EB]">
                                    <div className="flex flex-col">
                                      <span className="text-[#0052CC]">{entry.supplying_shed}</span>
                                      <span className="text-[10px] text-[#6B7280]">{entry.month} {entry.year}</span>
                                    </div>
                                  </td>
                                )}
                                <td className="px-6 py-4 font-semibold text-[#6B7280]">
                                  {period === 'average' ? 'Average' : (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={entry.periodNames[period as 'p1' | 'p2']}
                                        onChange={(e) => updatePeriodName(entry.id, period as 'p1' | 'p2', e.target.value)}
                                        className="w-24 bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#0052CC] focus:ring-0 p-1 outline-none transition-all text-sm font-semibold"
                                      />
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right font-mono">
                                  <input
                                    type="number"
                                    value={data.base_price === 0 ? '' : data.base_price}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const newVal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                      updatePriceEntry(entry.id, period, { ...data, base_price: newVal });
                                    }}
                                    className="w-24 text-right bg-transparent hover:bg-blue-50/50 focus:bg-white border-b border-gray-200 hover:border-[#0052CC] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 p-1 outline-none transition-all font-mono font-medium rounded text-gray-900"
                                    title={`${period === 'average' ? 'Average' : period} Base Price (editable)`}
                                  />
                                </td>
                                <td className="px-6 py-4 text-right font-mono">
                                  <input
                                    type="number"
                                    value={data.excise === 0 ? '' : data.excise}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const newVal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                      updatePriceEntry(entry.id, period, { ...data, excise: newVal });
                                    }}
                                    className="w-24 text-right bg-transparent hover:bg-blue-50/50 focus:bg-white border-b border-gray-200 hover:border-[#0052CC] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 p-1 outline-none transition-all font-mono font-medium rounded text-gray-900"
                                    title={`${period === 'average' ? 'Average' : period} Excise Duty (editable)`}
                                  />
                                </td>
                                <td className="px-6 py-4 text-right font-mono">
                                  <input
                                    type="number"
                                    value={data.vat === 0 ? '' : data.vat}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const newVal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                      updatePriceEntry(entry.id, period, { ...data, vat: newVal });
                                    }}
                                    className="w-24 text-right bg-transparent hover:bg-blue-50/50 focus:bg-white border-b border-gray-200 hover:border-[#0052CC] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 p-1 outline-none transition-all font-mono font-medium rounded text-gray-900"
                                    title={`${period === 'average' ? 'Average' : period} VAT / Total Tax (editable)`}
                                  />
                                </td>
                                <td className="px-6 py-4 text-right font-mono">
                                  <input
                                    type="number"
                                    value={data.overhead === 0 ? '' : data.overhead}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const newVal = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                      updatePriceEntry(entry.id, period, { ...data, overhead: newVal });
                                    }}
                                    className="w-24 text-right bg-transparent hover:bg-blue-50/50 focus:bg-white border-b border-gray-200 hover:border-[#0052CC] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 p-1 outline-none transition-all font-mono font-medium rounded text-gray-900"
                                    title={`${period === 'average' ? 'Average' : period} Overhead (editable)`}
                                  />
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#0052CC] font-mono">
                                  {(total || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {period !== 'average' ? (
                                      <div className="flex items-center gap-2">
                                        <div className="relative">
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            disabled={scanningRowKey === `${entry.id}-${period}`}
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const base64 = await fileToBase64(file);
                                                handleRowScanPdf(entry, period as 'p1' | 'p2', base64);
                                              }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                          />
                                          <button 
                                            disabled={scanningRowKey === `${entry.id}-${period}`}
                                            className={cn(
                                              "p-2 rounded-lg transition-all flex items-center gap-1.5 border",
                                              scanningRowKey === `${entry.id}-${period}`
                                                ? "bg-blue-50 border-blue-200 text-blue-700 animate-pulse"
                                                : data.pdf_base64 
                                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" 
                                                  : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                                            )}
                                          >
                                            {scanningRowKey === `${entry.id}-${period}` ? (
                                              <>
                                                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-bold uppercase">Scanning...</span>
                                              </>
                                            ) : (
                                              <>
                                                <FileText className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">
                                                  {data.pdf_base64 ? "Update & Scan" : "Upload & Scan"}
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                        {data.pdf_base64 && (
                                          <button
                                            onClick={() => {
                                              const win = window.open();
                                              if (win) {
                                                win.document.write(`<iframe src="${data.pdf_base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                              }
                                            }}
                                            className="p-2 bg-[#0052CC]/10 text-[#0052CC] rounded-lg hover:bg-[#0052CC]/20 transition-all flex items-center gap-2 border border-[#0052CC]/20"
                                            title="View stored file"
                                          >
                                            <Search className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase">View</span>
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <>
                                        {entry.periods.p1.pdf_base64 && entry.periods.p2.pdf_base64 ? (
                                          <button
                                            onClick={async () => {
                                              try {
                                                const mergedPdf = await PDFDocument.create();
                                                const pdf1 = entry.periods.p1.pdf_base64!;
                                                const pdf2 = entry.periods.p2.pdf_base64!;
                                                
                                                const p1Bytes = Uint8Array.from(atob(pdf1.split(',')[1]), c => c.charCodeAt(0));
                                                const p2Bytes = Uint8Array.from(atob(pdf2.split(',')[1]), c => c.charCodeAt(0));
                                                
                                                const doc1 = await PDFDocument.load(p1Bytes);
                                                const doc2 = await PDFDocument.load(p2Bytes);
                                                
                                                const pages1 = await mergedPdf.copyPages(doc1, doc1.getPageIndices());
                                                const pages2 = await mergedPdf.copyPages(doc2, doc2.getPageIndices());
                                                
                                                pages1.forEach(p => mergedPdf.addPage(p));
                                                pages2.forEach(p => mergedPdf.addPage(p));
                                                
                                                const mergedBytes = await mergedPdf.save();
                                                const blob = new Blob([mergedBytes], { type: 'application/pdf' });
                                                const url = URL.createObjectURL(blob);
                                                const win = window.open();
                                                if (win) {
                                                  win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                }
                                              } catch (e) {
                                                console.error('Error merging PDFs for view:', e);
                                                alert('Error merging PDFs for preview.');
                                              }
                                            }}
                                            className="flex items-center gap-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all text-[10px] font-bold uppercase border border-indigo-200"
                                          >
                                            <FileText className="w-4 h-4" />
                                            View Merged
                                          </button>
                                        ) : (
                                          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Pending Uploads
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                                {pIdx === 0 && (
                                  <td rowSpan={3} className="px-6 py-4 text-right border-l border-[#E5E7EB] bg-white relative z-10">
                                    <div className="flex flex-col items-end gap-2">
                                      {deletingPriceId === entry.id ? (
                                        <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-100">
                                          <span className="text-[10px] font-bold text-red-600 uppercase">Confirm?</span>
                                          <button
                                            onClick={() => {
                                              deletePriceEntry(entry.id);
                                              setDeletingPriceId(null);
                                            }}
                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => setDeletingPriceId(null)}
                                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeletingPriceId(entry.id);
                                          }}
                                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 flex items-center gap-2 group/del cursor-pointer relative z-20"
                                          title="Delete entire entry"
                                        >
                                          <span className="text-[10px] font-bold uppercase hidden group-hover/del:inline">Delete Entry</span>
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Price Master Pagination */}
                {totalPricePages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4 bg-white animate-fade-in">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setPricePage(p => Math.max(1, p - 1))}
                        disabled={pricePage === 1}
                        className="relative inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPricePage(p => Math.min(totalPricePages, p + 1))}
                        disabled={pricePage === totalPricePages}
                        className="relative ml-3 inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Showing <span className="font-bold text-[#1A1A1A]">{uniqueMonthsForSelectedYear.slice((pricePage - 1) * priceMonthsPerPage, pricePage * priceMonthsPerPage).length}</span> of <span className="font-bold text-[#1A1A1A]">{uniqueMonthsForSelectedYear.length}</span> months for {selectedPriceYear}
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1 bg-gray-50 p-1 border border-[#E5E7EB]" aria-label="Price Pagination">
                          <button
                            onClick={() => setPricePage(1)}
                            disabled={pricePage === 1}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            First
                          </button>
                          <button
                            onClick={() => setPricePage(p => Math.max(1, p - 1))}
                            disabled={pricePage === 1}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          {Array.from({ length: totalPricePages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPricePage(p)}
                              className={cn(
                                "relative inline-flex items-center rounded-lg px-3.5 py-1 text-xs font-bold transition-all cursor-pointer",
                                pricePage === p
                                  ? "bg-white text-[#0052CC] shadow-sm border border-[#E5E7EB]"
                                  : "text-[#6B7280] hover:bg-white hover:text-[#1A1A1A]"
                              )}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            onClick={() => setPricePage(p => Math.min(totalPricePages, p + 1))}
                            disabled={pricePage === totalPricePages}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPricePage(totalPricePages)}
                            disabled={pricePage === totalPricePages}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            Last
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  <p className="text-xs font-medium text-[#6B7280]">Changes are saved locally for the current session. Ensure all rates are accurate before generating certificates.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sheds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="text-[#0052CC] w-5 h-5" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Add New Shed to Master</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase">Shed Name</label>
                    <input
                      type="text"
                      value={newShed.shed_name || ''}
                      onChange={(e) => setNewShed({ ...newShed, shed_name: e.target.value.toUpperCase() })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0052CC]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase">Railway</label>
                    <input
                      type="text"
                      value={newShed.railway || ''}
                      onChange={(e) => setNewShed({ ...newShed, railway: e.target.value.toUpperCase() })}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0052CC]"
                    />
                  </div>
                  <div className="flex items-end md:col-span-2">
                    <button
                      onClick={async () => {
                        if (newShed.shed_name && newShed.railway) {
                          const shed: ShedMasterEntry = { 
                            ...newShed, 
                            id: `shed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` 
                          } as ShedMasterEntry;
                          try {
                            await fetch('/api/sheds', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(shed)
                            });
                            setShedMaster([...shedMaster, shed]);
                            setNewShed({ railway: 'WR' });
                          } catch (error) {
                            console.error('Error adding shed:', error);
                          }
                        }
                      }}
                      className="w-full bg-[#0052CC] text-white rounded-lg py-2 text-sm font-bold hover:bg-[#0747A6] transition-colors"
                    >
                      Add to Master
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Shed Master List</h2>
                  <div className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    Page <span className="font-bold text-[#1A1A1A]">{shedMasterPage}</span> of <span className="font-bold text-[#1A1A1A]">{totalShedMasterPages}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-[#E5E7EB]">Shed Name</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB]">Railway</th>
                        <th className="px-6 py-4 border-b border-[#E5E7EB] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {paginatedShedMaster.map((shed) => (
                        <tr key={shed.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4 font-bold">{shed.shed_name}</td>
                          <td className="px-6 py-4">{shed.railway}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  await fetch(`/api/sheds/${shed.id}`, { method: 'DELETE' });
                                  setShedMaster(shedMaster.filter(s => s.id !== shed.id));
                                } catch (error) {
                                  console.error('Error deleting shed:', error);
                                }
                              }}
                              className="p-2 text-[#9CA3AF] hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Shed Master Pagination */}
                {totalShedMasterPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4 bg-white animate-fade-in">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setShedMasterPage(p => Math.max(1, p - 1))}
                        disabled={shedMasterPage === 1}
                        className="relative inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setShedMasterPage(p => Math.min(totalShedMasterPages, p + 1))}
                        disabled={shedMasterPage === totalShedMasterPages}
                        className="relative ml-3 inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Showing <span className="font-bold text-[#1A1A1A]">{paginatedShedMaster.length}</span> of <span className="font-bold text-[#1A1A1A]">{shedMaster.length}</span> sheds
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1 bg-gray-50 p-1 border border-[#E5E7EB]" aria-label="Shed Pagination">
                          <button
                            onClick={() => setShedMasterPage(1)}
                            disabled={shedMasterPage === 1}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            First
                          </button>
                          <button
                            onClick={() => setShedMasterPage(p => Math.max(1, p - 1))}
                            disabled={shedMasterPage === 1}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          {Array.from({ length: totalShedMasterPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setShedMasterPage(p)}
                              className={cn(
                                "relative inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                                shedMasterPage === p
                                  ? "bg-white text-[#0052CC] shadow-sm border border-[#E5E7EB]"
                                  : "text-[#6B7280] hover:bg-white hover:text-[#1A1A1A]"
                              )}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            onClick={() => setShedMasterPage(p => Math.min(totalShedMasterPages, p + 1))}
                            disabled={shedMasterPage === totalShedMasterPages}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShedMasterPage(totalShedMasterPages)}
                            disabled={shedMasterPage === totalShedMasterPages}
                            className="relative inline-flex items-center rounded-lg px-2 py-1 text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            Last
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Smart AI / OCR Circular Import Modal */}
      <AnimatePresence>
        {showOcrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0052CC] to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                      Price Circular AI / OCR Scanner
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">HSD Master</span>
                    </h3>
                    <p className="text-xs text-gray-500">Scan official 1-page HSD circular (HXP / WKR) to extract & verify rates with exact accounting formulas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: PDF Upload & Live Preview */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      1. Price Circular Document (1-Page PDF)
                    </span>
                    {ocrPdfBase64 && (
                      <button
                        onClick={() => {
                          setOcrPdfBase64(null);
                          setOcrPdfName(null);
                          setOcrResult(null);
                          setOcrError(null);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Change PDF
                      </button>
                    )}
                  </div>

                  {!ocrPdfBase64 ? (
                    <label className="border-2 border-dashed border-gray-300 hover:border-[#0052CC] bg-gray-50/50 hover:bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[360px] text-center group">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleOcrFileSelect(file);
                        }}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0052CC] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-500 mt-1">Official fuel price circular (IOCL, BPCL, HPCL) in PDF format</p>
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs mt-2">
                        Supported: Zone WR • RCD Locations Hapa (HXP) & Wankaner (WKR) • Gujarat
                      </div>
                    </label>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#0052CC] shrink-0" />
                          <span className="font-bold text-gray-800 truncate">{ocrPdfName}</span>
                          <span className="text-gray-400">({ocrPdfSize})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                          Loaded
                        </span>
                      </div>
                      <div className="h-[380px] rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                        <PdfCanvasRenderer pdfData={ocrPdfBase64} />
                      </div>
                    </div>
                  )}

                  {/* Accounting Formulas Reference */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wide">Mapping & Formula Rules:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <span>• Base Price ← Base Price</span>
                      <span>• Excise Duty ← Excise Duty</span>
                      <span>• VAT ← Total Tax</span>
                      <span>• Overhead ← ((Other + Freight) - Disc)</span>
                    </div>
                    <p className="text-blue-700 font-semibold pt-1 border-t border-slate-200/80">
                      ✓ Base + Excise + VAT + Overhead = All Inclusive Rate (strictly integer)
                    </p>
                  </div>
                </div>

                {/* Right Column: AI Extraction & Verification */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    2. AI Scan & Accounting Reconciliation
                  </span>

                  {ocrError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <p className="font-bold">Scan Failed</p>
                        <p className="text-[11px] mt-0.5 text-red-600">{ocrError}</p>
                      </div>
                    </div>
                  )}

                  {!ocrResult ? (
                    <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center flex-1 gap-4">
                      {isScanningOcr ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <div className="relative">
                            <div className="w-14 h-14 border-4 border-blue-200 border-t-[#0052CC] rounded-full animate-spin" />
                            <Cpu className="w-6 h-6 text-[#0052CC] absolute inset-0 m-auto" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">AI / OCR Scanning Document...</p>
                            <p className="text-xs text-[#0052CC] font-semibold mt-1 animate-pulse">{ocrScanStep}</p>
                          </div>
                          <p className="text-[11px] text-gray-400 max-w-xs">
                            Extracting circular w.e.f. date, depot rows for Hapa & Wankaner, and validating equations.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">Ready to Scan Circular</h4>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm">
                              {ocrPdfBase64 
                                ? "Click the button below to scan with Gemini AI. It will detect the effective date, period, and figures for HXP and WKR."
                                : "Upload a PDF circular first to extract rates automatically."}
                            </p>
                          </div>
                          <button
                            onClick={handleRunOcrScan}
                            disabled={!ocrPdfBase64 || isScanningOcr}
                            className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Scan with Gemini AI</span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Detected Circular Metadata Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">
                            Document Analysis Complete
                          </span>
                          <span className="text-xs font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-xs">
                            w.e.f. {ocrResult.effective_date_str}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-white/90 rounded-xl p-2 border border-blue-100 flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 block font-bold uppercase mb-1">Period</span>
                            <select
                              value={ocrResult.period}
                              onChange={(e) => {
                                const p = e.target.value as 'p1' | 'p2';
                                setOcrResult({
                                  ...ocrResult,
                                  period: p,
                                  period_name: p === 'p1' ? '1st-15th' : '16th-End'
                                });
                              }}
                              className="w-full bg-white border border-gray-200 rounded-lg px-1.5 py-1 text-xs font-bold text-blue-900 outline-none focus:ring-1 focus:ring-[#0052CC] cursor-pointer"
                            >
                              <option value="p1">1st-15th (p1)</option>
                              <option value="p2">16th-End (p2)</option>
                            </select>
                          </div>
                          <div className="bg-white/90 rounded-xl p-2 border border-blue-100 flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 block font-bold uppercase mb-1">Month</span>
                            <select
                              value={ocrResult.month}
                              onChange={(e) => setOcrResult({ ...ocrResult, month: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-1.5 py-1 text-xs font-bold text-blue-900 outline-none focus:ring-1 focus:ring-[#0052CC] cursor-pointer"
                            >
                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div className="bg-white/90 rounded-xl p-2 border border-blue-100 flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 block font-bold uppercase mb-1">Year</span>
                            <select
                              value={ocrResult.year}
                              onChange={(e) => setOcrResult({ ...ocrResult, year: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg px-1.5 py-1 text-xs font-bold text-blue-900 outline-none focus:ring-1 focus:ring-[#0052CC] cursor-pointer"
                            >
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Location Tabs / Selection */}
                      {ocrResult.locations?.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {ocrResult.locations.map((loc: any) => (
                                <button
                                  key={loc.shed_code}
                                  onClick={() => setOcrSelectedShed(loc.shed_code)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                                    ocrSelectedShed === loc.shed_code
                                      ? "bg-[#0052CC] text-white border-[#0052CC] shadow-sm"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                  )}
                                >
                                  {loc.shed_code} ({loc.rcd_location})
                                </button>
                              ))}
                            </div>

                            {ocrResult.locations.length > 1 && (
                              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer font-semibold">
                                <input
                                  type="checkbox"
                                  checked={ocrApplyBoth}
                                  onChange={(e) => setOcrApplyBoth(e.target.checked)}
                                  className="rounded text-[#0052CC] focus:ring-0"
                                />
                                <span>Apply all found sheds</span>
                              </label>
                            )}
                          </div>

                          {/* Selected Location Breakdown */}
                          {(() => {
                            const curLoc = ocrResult.locations?.find((l: any) => l.shed_code === ocrSelectedShed) || ocrResult.locations?.[0];
                            if (!curLoc) return null;
                            const basePrice = Math.round(Number(curLoc.calculated?.base_price ?? curLoc.raw?.base_price ?? 0));
                            const exciseDuty = Math.round(Number(curLoc.calculated?.excise ?? curLoc.calculated?.excise_duty ?? curLoc.raw?.excise_duty ?? 0));
                            const vat = Math.round(Number(curLoc.calculated?.vat ?? curLoc.raw?.total_tax ?? 0));
                            const overhead = Math.round(Number(curLoc.calculated?.overhead ?? 0));
                            const totalRate = basePrice + exciseDuty + vat + overhead;
                            const allInclusive = Math.round(Number(curLoc.calculated?.all_inclusive_rate ?? curLoc.raw?.all_inclusive_rate ?? totalRate));
                            return (
                              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-[#0052CC]">{curLoc.shed_code}</span>
                                    <span className="text-gray-500">• {curLoc.rcd_location} ({curLoc.zone}, {curLoc.state})</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#0052CC]" /> Editable Fields (Whole ₹)
                                  </span>
                                </div>

                                <div className="p-4 space-y-2.5 text-xs">
                                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800">Base Price</span>
                                      <span className="text-[10px] text-gray-400">Doc: Base Price</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 font-mono text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={basePrice === 0 ? '' : basePrice}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateOcrField(curLoc.shed_code, 'base_price', parseFloat(e.target.value) || 0)}
                                        className="w-32 text-right font-mono font-bold text-gray-900 bg-white border border-gray-200 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 rounded-lg px-2 py-1 text-xs outline-none transition-all shadow-2xs"
                                        title="Click to edit Base Price"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800">Excise Duty</span>
                                      <span className="text-[10px] text-gray-400">Doc: Excise Duty</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 font-mono text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={exciseDuty === 0 ? '' : exciseDuty}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateOcrField(curLoc.shed_code, 'excise', parseFloat(e.target.value) || 0)}
                                        className="w-32 text-right font-mono font-bold text-gray-900 bg-white border border-gray-200 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 rounded-lg px-2 py-1 text-xs outline-none transition-all shadow-2xs"
                                        title="Click to edit Excise Duty"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800">VAT</span>
                                      <span className="text-[10px] text-gray-400">Doc: Total Tax</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 font-mono text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={vat === 0 ? '' : vat}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateOcrField(curLoc.shed_code, 'vat', parseFloat(e.target.value) || 0)}
                                        className="w-32 text-right font-mono font-bold text-gray-900 bg-white border border-gray-200 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 rounded-lg px-2 py-1 text-xs outline-none transition-all shadow-2xs"
                                        title="Click to edit VAT"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800">Overhead</span>
                                      <span className="text-[10px] text-gray-400">
                                        ((Other ₹{Number(curLoc.raw?.other_charges) || 0} + Freight ₹{Number(curLoc.raw?.freight) || 0}) - Disc ₹{Number(curLoc.raw?.discount) || 0})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400 font-mono text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={overhead === 0 ? '' : overhead}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateOcrField(curLoc.shed_code, 'overhead', parseFloat(e.target.value) || 0)}
                                        className="w-32 text-right font-mono font-bold text-gray-900 bg-white border border-gray-200 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 rounded-lg px-2 py-1 text-xs outline-none transition-all shadow-2xs"
                                        title="Click to edit Overhead"
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-2 flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                      <span className="font-black text-[#0052CC]">Calculated Total Rate</span>
                                      <span className="text-[10px] text-gray-400">Sum of above 4 variables</span>
                                    </div>
                                    <span className="font-mono font-black text-[#0052CC] text-base">₹{(totalRate || 0).toLocaleString('en-IN')}</span>
                                  </div>

                                  {/* All Inclusive Reconciliation Section */}
                                  <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-800">Target All Inclusive Rate</span>
                                        <span className="text-[10px] text-gray-400">Document Column: All Inclusive Rate</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-400 font-mono text-xs">₹</span>
                                        <input
                                          type="number"
                                          value={allInclusive === 0 ? '' : allInclusive}
                                          placeholder="0"
                                          onChange={(e) => handleUpdateOcrField(curLoc.shed_code, 'all_inclusive_rate', parseFloat(e.target.value) || 0)}
                                          className="w-32 text-right font-mono font-bold text-gray-900 bg-white border border-gray-200 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 rounded-lg px-2 py-1 text-xs outline-none transition-all shadow-2xs"
                                          title="Target All Inclusive Rate from document"
                                        />
                                      </div>
                                    </div>

                                    {totalRate === allInclusive ? (
                                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800">
                                        <div className="flex items-center gap-1.5 font-bold">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                          <span>Exact 100% Match with Circular All Inclusive Rate (₹{(allInclusive || 0).toLocaleString('en-IN')})</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black uppercase">
                                          Verified
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] text-amber-800">
                                        <div className="flex items-center gap-1.5 font-semibold">
                                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                          <span>Difference: ₹{allInclusive - totalRate}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleAutoBalanceOcrOverhead(curLoc.shed_code)}
                                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                          title="Auto-balances Overhead so sum equals All Inclusive Rate"
                                        >
                                          <Sparkles className="w-3 h-3" />
                                          Auto-Balance Overhead
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Average Row Specification Notice */}
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                            <Calculator className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Average Row Rule:</span>
                              <p className="text-[10px] text-amber-800 mt-0.5 leading-relaxed">
                                When applied, the Average row will be automatically calculated with whole integer values. Its total rate will strictly never exceed the mathematical average rate.
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={handleApplyOcrToPriceMaster}
                              className="flex-1 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Apply to Price Master</span>
                            </button>
                            <button
                              onClick={() => {
                                setOcrResult(null);
                                setOcrPdfBase64(null);
                                setOcrPdfName(null);
                              }}
                              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Scan Another
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Combined Voucher OCR & Consuming Sheds Review Modal */}
      <AnimatePresence>
        {showVoucherOcrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-5xl w-full p-6 space-y-5 max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#0052CC] to-[#0747A6] text-white shadow-sm">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-gray-900">AI Combined Voucher OCR Review</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0052CC] border border-blue-200">
                        Supplying: {selectedSupplyingShed} (Fixed Step 1)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Extracts Consuming Sheds, page ranges (e.g. 1, 2-3, 4-5), Coach vs. Goods litres from Train Nos, and Pricing Period.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVoucherOcrModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Banner */}
              {voucherOcrError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div className="flex-1">
                    <p className="font-bold">OCR Extraction Issue</p>
                    <p className="text-[11px] mt-0.5 text-red-600">{voucherOcrError}</p>
                  </div>
                  <button 
                    onClick={() => setVoucherOcrError(null)}
                    className="text-red-400 hover:text-red-600 font-bold text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {isScanningVoucher ? (
                  /* Loading / Scanning Indicator */
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-[#0052CC] rounded-full animate-spin" />
                      <Cpu className="w-7 h-7 text-[#0052CC] absolute inset-0 m-auto" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Scanning Combined Voucher with Gemini OCR...</h4>
                      <p className="text-xs text-[#0052CC] font-bold mt-1.5 animate-pulse">{voucherScanStep}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-w-md text-[11px] text-gray-600 space-y-1.5 text-left">
                      <p className="font-bold text-gray-800 uppercase tracking-wide">Automated AI Rules in Progress:</p>
                      <p>✓ Reading multi-page portrait & landscape orientations</p>
                      <p>✓ Detecting Consuming Shed headers & grouping ranges (e.g. SGUJ, ABR, ROZA)</p>
                      <p>✓ Train No with numbers (e.g. 19015) → Coach Litres</p>
                      <p>✓ Train No alphabetical only (e.g. GOODS) → Goods Litres</p>
                      <p>✓ Checking dates for Pricing Period (1st-15th, 16th-End, or Average)</p>
                    </div>
                  </div>
                ) : scannedShedsReview.length === 0 ? (
                  /* Initial Upload State */
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 hover:border-[#0052CC] rounded-3xl p-8 bg-gray-50/50 hover:bg-blue-50/20 transition-all text-center flex flex-col items-center justify-center gap-4 relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const base64 = await fileToBase64(file);
                            setVoucherPdfBase64(base64);
                            setVoucherPdfName(file.name);
                            setVoucherPdfSize((file.size / 1024).toFixed(1) + ' KB');
                            // Run scan immediately on upload
                            handleRunCombinedVoucherScan(base64, file.name);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0052CC] flex items-center justify-center shadow-inner">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Upload Combined Voucher PDF to OCR</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                          Drop your multi-page HAPA or WKR Combined Voucher PDF here. AI will scan each page, group consuming sheds (such as ROZA or ABR over 2 pages), classify litres, and show you a full review screen.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0052CC] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Select or Drag PDF to Begin Scan</span>
                      </div>
                    </div>

                    {masterVoucherPdf && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#0052CC] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-gray-800">Use Already Uploaded Master PDF</p>
                            <p className="text-[11px] text-gray-500">{masterVoucherPdfName || 'Master Voucher PDF in Step 2'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setVoucherPdfBase64(masterVoucherPdf);
                            setVoucherPdfName(masterVoucherPdfName);
                            handleRunCombinedVoucherScan(masterVoucherPdf, masterVoucherPdfName || undefined);
                          }}
                          className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Scan Current PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Review State with Detected Consuming Sheds */
                  <div className="space-y-5">
                    {/* Review Instructions & Summary Metrics */}
                    <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase text-[#0052CC] tracking-wider">
                            Review AI Scanned Sheds & Litres
                          </span>
                          <span className="text-[11px] font-bold text-gray-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {scannedVoucherMeta?.total_pages || 1} Pages Scanned • Supplying: {scannedVoucherMeta?.supplying_shed || selectedSupplyingShed}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          All fields below are editable before adding to Step 3
                        </span>
                      </div>

                      {/* 4 Stat Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="bg-white/90 rounded-xl p-2.5 border border-blue-100 flex flex-col">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Consuming Sheds</span>
                          <span className="text-base font-black text-gray-900 mt-0.5">
                            {scannedShedsReview.filter(s => s.selected).length} <span className="text-xs text-gray-400 font-normal">/ {scannedShedsReview.length}</span>
                          </span>
                        </div>
                        <div className="bg-white/90 rounded-xl p-2.5 border border-blue-100 flex flex-col">
                          <span className="text-[10px] font-bold text-[#0052CC] uppercase flex items-center justify-center gap-1">
                            <span>Coach Litres</span>
                          </span>
                          <span className="text-base font-black text-[#0052CC] mt-0.5 font-mono">
                            {scannedShedsReview.filter(s => s.selected).reduce((sum, s) => sum + s.coach_litres, 0).toLocaleString('en-IN')} L
                          </span>
                          <span className="text-[9px] text-gray-400">Numerical Train #</span>
                        </div>
                        <div className="bg-white/90 rounded-xl p-2.5 border border-blue-100 flex flex-col">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center justify-center gap-1">
                            <span>Goods Litres</span>
                          </span>
                          <span className="text-base font-black text-emerald-700 mt-0.5 font-mono">
                            {scannedShedsReview.filter(s => s.selected).reduce((sum, s) => sum + s.goods_litres, 0).toLocaleString('en-IN')} L
                          </span>
                          <span className="text-[9px] text-gray-400">Alphabetical Train #</span>
                        </div>
                        <div className="bg-white/90 rounded-xl p-2.5 border border-blue-100 flex flex-col">
                          <span className="text-[10px] font-bold text-gray-600 uppercase">Total Fuel</span>
                          <span className="text-base font-black text-gray-900 mt-0.5 font-mono">
                            {scannedShedsReview.filter(s => s.selected).reduce((sum, s) => sum + s.total_litres, 0).toLocaleString('en-IN')} L
                          </span>
                          <span className="text-[9px] text-gray-400">Combined</span>
                        </div>
                      </div>
                    </div>

                    {/* Detected Consuming Sheds List */}
                    <div className="space-y-4">
                      {scannedShedsReview.map((shed, sIdx) => {
                        const isMultiPage = shed.voucher_pages.includes('-') || shed.voucher_pages.includes(',');
                        const existsInMaster = shedMaster.some(sm => sm.shed_name.toUpperCase() === shed.shed_name.toUpperCase());

                        return (
                          <div
                            key={shed.id}
                            className={cn(
                              "rounded-2xl border transition-all overflow-hidden",
                              shed.selected 
                                ? "bg-white border-blue-200 shadow-sm" 
                                : "bg-gray-50/70 border-gray-200 opacity-60"
                            )}
                          >
                            {/* Card Top Header */}
                            <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={shed.selected}
                                  onChange={() => toggleReviewShedSelect(shed.id)}
                                  className="w-5 h-5 rounded border-gray-300 text-[#0052CC] focus:ring-0 cursor-pointer"
                                  title="Check to include this consuming shed in Step 3"
                                />
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#0052CC] text-white">
                                    #{sIdx + 1}
                                  </span>
                                  {/* Shed Name Selector / Input */}
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={shed.shed_name}
                                      onChange={(e) => updateReviewShed(shed.id, { shed_name: e.target.value.toUpperCase() })}
                                      className="font-bold text-base text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-0.5 outline-none focus:border-[#0052CC] w-28 uppercase"
                                      placeholder="SHED"
                                      title="Consuming Shed Name"
                                    />
                                    {/* Quick selector from existing Shed Master */}
                                    <select
                                      value={existsInMaster ? shed.shed_name : ''}
                                      onChange={(e) => {
                                        const found = shedMaster.find(sm => sm.shed_name === e.target.value);
                                        if (found) {
                                          updateReviewShed(shed.id, { shed_name: found.shed_name, railway: found.railway });
                                        }
                                      }}
                                      className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
                                      title="Match with an existing shed from Shed Master"
                                    >
                                      <option value="">{existsInMaster ? 'Select existing...' : 'New / Custom Shed'}</option>
                                      {shedMaster.map(sm => (
                                        <option key={sm.id} value={sm.shed_name}>{sm.shed_name} ({sm.railway})</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Railway Input */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-400">Rly:</span>
                                    <input
                                      type="text"
                                      value={shed.railway}
                                      onChange={(e) => updateReviewShed(shed.id, { railway: e.target.value.toUpperCase() })}
                                      className="font-bold text-xs text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-[#0052CC] w-16 uppercase text-center"
                                      placeholder="RLY"
                                      title="Railway Zone (e.g. NFR, NR, WR)"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Page Range Input */}
                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-200">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">Pages:</span>
                                  <input
                                    type="text"
                                    value={shed.voucher_pages}
                                    onChange={(e) => updateReviewShed(shed.id, { voucher_pages: e.target.value })}
                                    className="w-16 font-bold text-xs text-gray-900 bg-transparent outline-none text-center"
                                    placeholder="1 or 2-3"
                                    title="Page number or range (e.g. 1, 2-3, 4-5)"
                                  />
                                  {isMultiPage ? (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                      Multi-Page
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                      Single
                                    </span>
                                  )}
                                </div>

                                {/* Delete Shed button */}
                                <button
                                  onClick={() => removeShedFromReview(shed.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove this shed from review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body: Litres & Pricing Period */}
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                {/* Coach Litres (Numerical Train Nos) */}
                                <div className="space-y-1 bg-blue-50/50 p-2.5 rounded-xl border border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-[#0052CC]">Coach Litres</label>
                                    <span className="text-[9px] text-[#0052CC] font-semibold">Train # with digits</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={shed.coach_litres === 0 ? '' : shed.coach_litres}
                                    placeholder="0"
                                    onChange={(e) => updateReviewShed(shed.id, { coach_litres: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm font-bold font-mono text-gray-900 outline-none focus:ring-1 focus:ring-[#0052CC]"
                                  />
                                </div>

                                {/* Goods Litres (Alphabetical Train Nos) */}
                                <div className="space-y-1 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-emerald-800">Goods Litres</label>
                                    <span className="text-[9px] text-emerald-700 font-semibold">Letters only</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={shed.goods_litres === 0 ? '' : shed.goods_litres}
                                    placeholder="0"
                                    onChange={(e) => updateReviewShed(shed.id, { goods_litres: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-sm font-bold font-mono text-gray-900 outline-none focus:ring-1 focus:ring-emerald-600"
                                  />
                                </div>

                                {/* Pricing Period */}
                                <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-amber-900">Pricing Period</label>
                                    <span className="text-[9px] text-amber-700 truncate max-w-[100px]" title={shed.period_reason}>
                                      {shed.period_reason || 'Table dates'}
                                    </span>
                                  </div>
                                  <select
                                    value={shed.pricing_period}
                                    onChange={(e) => updateReviewShed(shed.id, { pricing_period: e.target.value as any })}
                                    className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 outline-none cursor-pointer"
                                  >
                                    <option value="average">Average (1st-End)</option>
                                    <option value="p1">1st-15th (p1)</option>
                                    <option value="p2">16th-End (p2)</option>
                                  </select>
                                </div>

                                {/* Supplying Shed (Fixed from Step 1) */}
                                <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                                  <label className="text-[10px] font-bold uppercase text-gray-500 block">Supplying Shed</label>
                                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700">
                                    <span>DFO-{selectedSupplyingShed}</span>
                                    <span className="text-[9px] font-black uppercase px-1 rounded bg-blue-50 text-[#0052CC]">Fixed</span>
                                  </div>
                                </div>
                              </div>

                              {/* Collapsible Line Items Table Toggle */}
                              {shed.items && shed.items.length > 0 && (
                                <div className="pt-1">
                                  <button
                                    onClick={() => toggleReviewShedItems(shed.id)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:text-[#0747A6] transition-colors cursor-pointer"
                                  >
                                    {shed.showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    <span>
                                      {shed.showItems ? 'Hide' : 'View'} Extracted Line Items ({shed.items.length} fuel transactions)
                                    </span>
                                  </button>

                                  {shed.showItems && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2.5 rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
                                    >
                                      <div className="max-h-48 overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[9px] tracking-wider sticky top-0">
                                            <tr>
                                              <th className="py-2 px-3">Page</th>
                                              <th className="py-2 px-3">Date</th>
                                              <th className="py-2 px-3">Loco No</th>
                                              <th className="py-2 px-3">Train No</th>
                                              <th className="py-2 px-3 text-right">Litres</th>
                                              <th className="py-2 px-3">Classified As</th>
                                              <th className="py-2 px-3">Rule Applied</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200/60 bg-white font-mono text-[11px]">
                                            {shed.items.map((item, itIdx) => (
                                              <tr key={itIdx} className="hover:bg-blue-50/30">
                                                <td className="py-1.5 px-3 text-gray-500 font-sans">{item.page}</td>
                                                <td className="py-1.5 px-3 text-gray-700">{item.date || '—'}</td>
                                                <td className="py-1.5 px-3 text-gray-800 font-bold">{item.loco_no || '—'}</td>
                                                <td className="py-1.5 px-3 font-black text-gray-900">{item.train_no || '—'}</td>
                                                <td className="py-1.5 px-3 text-right font-black text-gray-900">{item.litres.toLocaleString('en-IN')} L</td>
                                                <td className="py-1.5 px-3 font-sans">
                                                  {item.category === 'coach' ? (
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#0052CC] font-bold text-[10px] uppercase">
                                                      Coach
                                                    </span>
                                                  ) : (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                                      Goods
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="py-1.5 px-3 text-gray-500 font-sans text-[10px]">{item.reason}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Another Consuming Shed Button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={addManualShedToReview}
                        className="text-xs font-bold text-[#0052CC] hover:bg-[#0052CC]/5 px-3 py-1.5 rounded-xl border border-dashed border-[#0052CC]/40 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Consuming Shed Manually</span>
                      </button>

                      <button
                        onClick={() => {
                          setScannedShedsReview([]);
                          setVoucherPdfBase64(null);
                          setVoucherPdfName(null);
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        Scan Another PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setShowVoucherOcrModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {scannedShedsReview.length > 0 && (
                  <button
                    onClick={handleApplyScannedShedsToStep3}
                    disabled={isScanningVoucher || scannedShedsReview.filter(s => s.selected).length === 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0052CC] to-[#0747A6] hover:from-[#0747A6] hover:to-[#0052CC] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>
                      Apply Reviewed Sheds to Step 3 ({scannedShedsReview.filter(s => s.selected).length} Shed{scannedShedsReview.filter(s => s.selected).length > 1 ? 's' : ''})
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E5E7EB] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40 grayscale">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Rajkot Division Finance Office</span>
          </div>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">
            Internal Use Only • Western Railway • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
              <div className="bg-emerald-500 p-1 rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
