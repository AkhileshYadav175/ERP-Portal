import React, { useState } from 'react';
import { Plus, List } from 'lucide-react';
import OfflineLeadForm from './OfflineLeadForm';

export default function OfflineLeadsTab() {
  const [nestedTab, setNestedTab] = useState('new-lead'); // 'new-lead' | 'saved-leads'
  const [offlineLeads, setOfflineLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);

  const handleLeadSubmit = (leadData) => {
    if (!leadData) return; // cancelled
    if (editingLead) {
      setOfflineLeads(prev =>
        prev.map(l => l.id === editingLead.id ? { ...leadData, id: l.id } : l)
      );
      setEditingLead(null);
      setNestedTab('saved-leads');
    } else {
      setOfflineLeads(prev => [{ ...leadData, id: Date.now().toString() }, ...prev]);
      setNestedTab('saved-leads');
    }
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setNestedTab('new-lead');
  };

  const handleDeleteLead = (id) => {
    setOfflineLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingLead(null);
    setNestedTab('saved-leads');
  };

  return (
    <div className="space-y-6">
      {/* Nested Tabs — identical style to AdmissionTab */}
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-2 flex items-center shadow-sm w-fit gap-2">
        <button
          onClick={() => {
            setNestedTab('new-lead');
            setEditingLead(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            nestedTab === 'new-lead'
              ? 'bg-rose-50 text-[#E31C1C]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <Plus size={14} />
          {editingLead ? 'Edit Lead' : 'New Offline Lead'}
        </button>
        <button
          onClick={() => {
            setNestedTab('saved-leads');
            setEditingLead(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            nestedTab === 'saved-leads'
              ? 'bg-slate-100 text-slate-800'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <List size={14} />
          Saved Leads ({offlineLeads.length})
        </button>
      </div>

      {/* Content Area */}
      {nestedTab === 'new-lead' ? (
        <OfflineLeadForm
          onSubmit={handleLeadSubmit}
          editingLead={editingLead}
          onCancel={editingLead ? handleCancelEdit : null}
        />
      ) : (
        /* Saved Leads Table — same aesthetic as RegisteredStudents */
        <div className="bg-white border border-[#E8E6E1] rounded-2xl shadow-sm overflow-hidden">
          {offlineLeads.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xs font-bold text-slate-400">No offline leads recorded yet.</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Use the "New Offline Lead" tab to add entries.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-2 px-5 py-3 bg-[#FAF9F6] border-b border-[#E8E6E1] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <span>Name</span>
                <span>Contact</span>
                <span>Reference</span>
                <span>Course</span>
                <span>Counsellor</span>
                <span>Date</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Table Rows */}
              {offlineLeads.map(lead => (
                <div
                  key={lead.id}
                  className="grid grid-cols-7 gap-2 px-5 py-3.5 border-b border-[#F0EEEA] last:border-b-0 hover:bg-[#FAFAF9] transition-colors items-center"
                >
                  <span className="text-xs font-bold text-slate-800 truncate">{lead.name}</span>
                  <span className="text-xs font-semibold text-slate-600">{lead.contact}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{lead.reference}</span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{lead.course}</span>
                  <span className="text-xs font-semibold text-slate-600">{lead.counsellor || '—'}</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {new Date(lead.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditLead(lead)}
                      className="text-[10px] font-black text-[#E31C1C] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-[10px] font-black text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
