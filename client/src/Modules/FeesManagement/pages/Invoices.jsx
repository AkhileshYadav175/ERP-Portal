import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Eye, X, RefreshCw } from 'lucide-react';
import { useSystemSettings } from '../context/SettingsContext';
import { feesApi } from '../../../api/feesApi';
import CommonTable from '../components/CommonTable';
import StatusBadge from '../components/StatusBadge';
import FilterPanel from '../components/FilterPanel';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';

const Invoices = () => {
  const { settings } = useSystemSettings();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All'); // All, today, week, month
  
  // Data states
  const [invoicesList, setInvoicesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeInvoice, setActiveInvoice] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 20,
        status: statusFilter === 'All' ? undefined : statusFilter,
        dateFilter: dateFilter === 'All' ? undefined : dateFilter,
        search: searchQuery === '' ? undefined : searchQuery
      };
      const res = await feesApi.getInvoices(params);
      if (res.success) {
        setInvoicesList(res.data.invoices || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch billing invoices from database.');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceDetails = async (id) => {
    setModalLoading(true);
    try {
      const res = await feesApi.getInvoiceById(id);
      if (res.success) {
        setActiveInvoice(res.data);
      }
    } catch (err) {
      console.error('Error loading invoice details:', err);
      showToast('Failed to load invoice details.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, dateFilter]);

  // Format currency
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = useMemo(() => [
    {
      header: 'Invoice ID',
      accessor: 'invoiceNumber',
      render: (inv) => <span className="font-mono text-slate-500 font-bold">{inv.invoiceNumber}</span>
    },
    {
      header: 'Student Name',
      accessor: 'studentId',
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-800">{inv.studentId?.fullName || 'N/A'}</div>
          <span className="text-[10px] text-slate-400 font-semibold">{inv.studentId?.studentId || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'studentId',
      render: (inv) => <span className="text-slate-650">{inv.studentId?.course || 'N/A'}</span>
    },
    {
      header: 'Amount Due',
      accessor: 'amount',
      render: (inv) => <span className="font-extrabold text-slate-800">{formatINR(inv.amount)}</span>
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      render: (inv) => <span className="text-slate-500">{formatDate(inv.issueDate)}</span>
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (inv) => <span className="text-slate-500">{formatDate(inv.dueDate)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (inv) => <StatusBadge status={inv.status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => loadInvoiceDetails(inv._id)}
            className="p-1.5 rounded-lg border border-[#DEDCD8] bg-white text-slate-655 hover:bg-[#FAF9F6] transition-all cursor-pointer"
            title="Preview Invoice"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ], []);

  const dropdownFilters = (
    <FilterPanel showIcon={true}>
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer text-slate-700"
      >
        <option value="All">All Dates</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer text-slate-700"
      >
        <option value="All">All Statuses</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Overdue">Overdue</option>
      </select>
    </FilterPanel>
  );

  return (
    <div className="space-y-4 print:p-0 print:bg-white print:text-black">
      
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border flex items-center gap-2 animate-fade-in ${
          toast.type === 'error' 
            ? 'bg-rose-50 border-rose-100 text-rose-600' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header action panel */}
      <div className="flex justify-between items-center bg-white p-4 border border-[#EBEAE6] rounded-2xl shadow-sm print:hidden">
        <div className="space-y-0.5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Fee Demands & Invoices</h3>
          <p className="text-[10px] font-semibold text-slate-400">Total Demands generated: {totalCount}</p>
        </div>
        <button 
          onClick={fetchInvoices}
          className="p-2 border border-[#DEDCD8] bg-white text-slate-500 rounded-xl hover:bg-[#FAF9F6] transition-all cursor-pointer shadow-xs active:scale-95"
          title="Refresh invoices"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={fetchInvoices} />}

      <div className="print:hidden">
        <CommonTable
          columns={columns}
          data={invoicesList}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search Invoice No, Student Name, Student ID..."
          emptyMessage="No billing invoices found matching selection."
          filters={dropdownFilters}
          itemsPerPage={20}
        />
      </div>

      {/* Invoice Modal Preview Drawer */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:relative print:inset-auto print:bg-white print:p-0">
          <div className="relative w-full max-w-2xl bg-white border border-[#EBEAE6] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-h-full print:w-full">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#FAF9F6] print:hidden">
              <span className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                {settings?.invoice?.invoiceHeader || 'Billing Invoice Voucher'}
              </span>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="p-1 rounded-lg border border-slate-200 hover:bg-[#FAF9F6] text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Printable Content */}
            <div id="printable-invoice" className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-700 print:overflow-visible print:p-0">
              
              {/* Invoice Header block */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {settings?.receipt?.showLogo && (
                    <div className="h-8 w-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-xs uppercase tracking-wide">
                      {settings?.institute?.logo || 'LOGO'}
                    </div>
                  )}
                  <h2 className="text-base font-extrabold text-slate-900 mt-1">
                    {settings?.institute?.name || 'JCMS ERP Academy'}
                  </h2>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[250px]">
                    {settings?.institute?.address || '12, Corporate Block, Educational Hub'}, {settings?.institute?.city || 'New Delhi'}, {settings?.institute?.state || 'Delhi'} - {settings?.institute?.pincode || '110001'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800">{activeInvoice.invoiceNumber}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Issued: {formatDate(activeInvoice.issueDate)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-red">Due Date: {formatDate(activeInvoice.dueDate)}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Bill to Section */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1 bg-[#FAF9F6]/50 p-4 border border-[#EBEAE6] rounded-2xl">
                  <span className="text-[9px] uppercase tracking-wide text-slate-400 font-extrabold">Bill To Student:</span>
                  <div className="text-slate-800 font-bold">{activeInvoice.studentId?.fullName || 'N/A'}</div>
                  <div className="text-slate-500 font-mono">Reg ID: {activeInvoice.studentId?.studentId || 'N/A'}</div>
                  <div className="text-slate-500">Course Class: {activeInvoice.studentId?.course || 'N/A'}</div>
                </div>
                <div className="space-y-1 bg-[#FAF9F6]/50 p-4 border border-[#EBEAE6] rounded-2xl">
                  <span className="text-[9px] uppercase tracking-wide text-slate-400 font-extrabold">Billing Parameters:</span>
                  <div>Year FY: <span className="text-slate-800 font-bold">{settings?.fee?.financialYear || '2026-2027'}</span></div>
                  <div>Installment Term: <span className="text-slate-800 font-bold">Term #{activeInvoice.installmentId?.installmentNo || 'N/A'}</span></div>
                  <div>Account Status: <StatusBadge status={activeInvoice.status} /></div>
                </div>
              </div>

              {/* Items details table */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Fee Particular description</th>
                      <th className="px-4 py-3 text-right">Taxable Subtotal</th>
                      <th className="px-4 py-3 text-right">GST (18% Std)</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-semibold text-slate-655">
                      <td className="px-4 py-3">
                        ERP Fee Term Installment (Particular Item charge: Class {activeInvoice.studentId?.course || 'N/A'})
                      </td>
                      <td className="px-4 py-3 text-right">{formatINR(Math.round(activeInvoice.amount / 1.18))}</td>
                      <td className="px-4 py-3 text-right">{formatINR(activeInvoice.amount - Math.round(activeInvoice.amount / 1.18))}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-800">{formatINR(activeInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms and Sign block */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wide text-slate-400 font-extrabold">Terms & Conditions:</span>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                    {settings?.invoice?.termsAndConditions || 'Fees once paid are non-refundable under normal circumstances. Pay before due date to avoid late fine assessments.'}
                  </p>
                </div>
                <div className="text-center self-end space-y-12">
                  <div className="h-px bg-slate-300 w-2/3 mx-auto" />
                  <span className="text-[10px] uppercase tracking-wider text-slate-450 font-bold block">
                    {settings?.invoice?.signaturePlaceholder || 'Authorized Signatory'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-2.5 p-4 border-t border-[#FAF9F6] bg-slate-50 print:hidden">
              <button 
                onClick={() => setActiveInvoice(null)}
                className="py-2 px-4 border border-[#DEDCD8] hover:bg-[#FAF9F6] rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Close Preview
              </button>
              <button 
                onClick={handlePrint}
                className="py-2 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/10 active:scale-95"
              >
                Print / Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
