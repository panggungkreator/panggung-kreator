"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useLandingCMS } from "./LandingCMSContext";
import { updateLandingSectionAction, toggleSectionVisibilityAction } from "@/lib/actions/landing-actions";
import { X, Save, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SectionEditorPanel({ sectionsData }: { sectionsData: any[] }) {
  const { activeSectionId, setActiveSectionId, isEditMode } = useLandingCMS();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Sync state when active section changes
  useEffect(() => {
    if (activeSectionId) {
      const section = sectionsData.find(s => s.section_type === activeSectionId);
      if (section) {
        // Deep copy to avoid mutating original
        setFormData(JSON.parse(JSON.stringify(section.content)));
        setIsVisible(section.is_visible);
      }
    } else {
      setFormData(null);
    }
  }, [activeSectionId, sectionsData]);

  if (!isEditMode || !activeSectionId || !formData) return null;

  const handleSave = async () => {
    startTransition(async () => {
      const result = await updateLandingSectionAction(activeSectionId, formData);
      if (result.success) {
        // Update visibility if changed
        const section = sectionsData.find(s => s.section_type === activeSectionId);
        if (section && section.is_visible !== isVisible) {
          await toggleSectionVisibilityAction(activeSectionId, isVisible);
        }
        setActiveSectionId(null);
        router.refresh();
      } else {
        alert("Gagal menyimpan: " + result.error);
      }
    });
  };

  // Helper to render dynamic form fields
  const renderField = (key: string, value: any, path: string[]) => {
    // Array of objects (e.g. cards, items, faqs)
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        return (
          <div key={key} className="mb-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <button 
                onClick={() => {
                  const newFormData = { ...formData };
                  let target = newFormData;
                  for (let i = 0; i < path.length; i++) target = target[path[i]];
                  const newItem = { ...target[key][0] };
                  // clear string values
                  Object.keys(newItem).forEach(k => { if(typeof newItem[k] === 'string') newItem[k] = ''; });
                  target[key].push(newItem);
                  setFormData(newFormData);
                }}
                className="text-xs flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            
            <div className="space-y-4">
              {value.map((item: any, index: number) => (
                <div key={index} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg relative bg-white dark:bg-zinc-950">
                  <button
                    onClick={() => {
                      const newFormData = { ...formData };
                      let target = newFormData;
                      for (let i = 0; i < path.length; i++) target = target[path[i]];
                      target[key].splice(index, 1);
                      setFormData(newFormData);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  {Object.entries(item).map(([itemKey, itemVal]) => (
                    <div key={itemKey} className="mb-3">
                      <label className="block text-xs text-zinc-500 mb-1 capitalize">{itemKey}</label>
                      <textarea
                        value={itemVal as string}
                        onChange={(e) => {
                          const newFormData = { ...formData };
                          let target = newFormData;
                          for (let i = 0; i < path.length; i++) target = target[path[i]];
                          target[key][index][itemKey] = e.target.value;
                          setFormData(newFormData);
                        }}
                        className="w-full text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 rounded p-2 min-h-[40px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Array of strings
      if (value.length === 0 || typeof value[0] === 'string') {
        return (
          <div key={key} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              <button 
                onClick={() => {
                  const newFormData = { ...formData };
                  let target = newFormData;
                  for (let i = 0; i < path.length; i++) target = target[path[i]];
                  target[key].push("Item Baru");
                  setFormData(newFormData);
                }}
                className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-200"
              >
                <Plus size={12} /> Tambah
              </button>
            </div>
            
            <div className="space-y-2">
              {value.map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={item}
                    onChange={(e) => {
                      const newFormData = { ...formData };
                      let target = newFormData;
                      for (let i = 0; i < path.length; i++) target = target[path[i]];
                      target[key][index] = e.target.value;
                      setFormData(newFormData);
                    }}
                    className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded p-2 h-10 resize-y"
                  />
                  <button
                    onClick={() => {
                      const newFormData = { ...formData };
                      let target = newFormData;
                      for (let i = 0; i < path.length; i++) target = target[path[i]];
                      target[key].splice(index, 1);
                      setFormData(newFormData);
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded border border-transparent hover:border-red-200 self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    // String fields
    if (typeof value === 'string') {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-semibold mb-1 capitalize text-zinc-700 dark:text-zinc-300">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {value.length > 50 ? (
            <textarea
              value={value}
              onChange={(e) => {
                const newFormData = { ...formData };
                let target = newFormData;
                for (let i = 0; i < path.length; i++) target = target[path[i]];
                target[key] = e.target.value;
                setFormData(newFormData);
              }}
              className="w-full text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-3 min-h-[100px] resize-y focus:ring-2 focus:ring-[#bc151b] outline-none"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const newFormData = { ...formData };
                let target = newFormData;
                for (let i = 0; i < path.length; i++) target = target[path[i]];
                target[key] = e.target.value;
                setFormData(newFormData);
              }}
              className="w-full text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-3 focus:ring-2 focus:ring-[#bc151b] outline-none"
            />
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={() => setActiveSectionId(null)}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[70] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white capitalize flex items-center gap-2">
              Edit Section <span className="text-[#bc151b]">{activeSectionId.replace('_', ' ')}</span>
            </h3>
            <p className="text-xs text-zinc-500">Sesuaikan konten yang akan ditampilkan</p>
          </div>
          <button 
            onClick={() => setActiveSectionId(null)}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isVisible ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-amber-500" />}
            <span className="text-sm font-medium">Visibilitas Section</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              {renderField(key, value, [])}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={() => setActiveSectionId(null)}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium bg-[#bc151b] text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </div>
    </>
  );
}
