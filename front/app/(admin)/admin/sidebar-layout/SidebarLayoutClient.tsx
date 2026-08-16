"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Loader, 
  AlertCircle, 
  CheckCircle,
  FolderSync,
  Edit2,
  XCircle,
  FileText,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/Button";
import { getIconComponent } from "../layout";

const AVAILABLE_ICONS = [
  "users",
  "credit-card",
  "check-square",
  "package",
  "tag",
  "dollar-sign",
  "calendar",
  "file-text",
  "map-pin",
  "briefcase",
  "image",
  "folder-open",
  "trending-up",
  "activity",
  "shield-alert",
  "key",
  "clipboard-list",
  "settings"
];

interface DBItem {
  id: string;
  group_id: string;
  label: string;
  href: string;
  icon_name: string;
  module: string;
  item_order: number;
  is_active: boolean;
}

interface LocalGroup {
  id: string; // can be "temp-*" for new groups
  title: string;
  group_order: number;
  is_active: boolean;
  items: DBItem[];
}

export default function SidebarLayoutClient() {
  const [localGroups, setLocalGroups] = useState<LocalGroup[]>([]);
  const [deletedGroupIds, setDeletedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Group creation modal state
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");

  // Inline group title editing states
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState("");

  // Item editing modal states
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DBItem | null>(null);
  const [editItemLabel, setEditItemLabel] = useState("");
  const [editItemHref, setEditItemHref] = useState("");
  const [editItemIconName, setEditItemIconName] = useState("");
  const [editItemModule, setEditItemModule] = useState("");

  const toggleGroupActive = (groupId: string) => {
    const updated = localGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, is_active: !g.is_active };
      }
      return g;
    });
    setLocalGroups(updated);
    setHasChanges(true);
  };

  const toggleItemActive = (groupId: string, itemId: string) => {
    const updated = localGroups.map(g => {
      if (g.id === groupId) {
        const updatedItems = g.items.map(item => {
          if (item.id === itemId) {
            return { ...item, is_active: !item.is_active };
          }
          return item;
        });
        return { ...g, items: updatedItems };
      }
      return g;
    });
    setLocalGroups(updated);
    setHasChanges(true);
  };

  const openEditItemModal = (item: DBItem) => {
    setEditingItem(item);
    setEditItemLabel(item.label);
    setEditItemHref(item.href);
    setEditItemIconName(item.icon_name);
    setEditItemModule(item.module);
    setIsEditItemOpen(true);
  };

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = localGroups.map(g => {
      const updatedItems = g.items.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            label: editItemLabel.trim(),
            href: editItemHref.trim(),
            icon_name: editItemIconName,
            module: editItemModule.trim()
          };
        }
        return item;
      });
      return { ...g, items: updatedItems };
    });

    setLocalGroups(updated);
    setIsEditItemOpen(false);
    setEditingItem(null);
    setHasChanges(true);
  };

  const fetchSidebarData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // Fetch all groups (active/inactive) in the editor
      const { data: groupsData, error: groupsError } = await supabase
        .from("privilege_groups")
        .select("*")
        .order("sort_order", { ascending: true });

      if (groupsError) throw groupsError;

      // Fetch all items (active/inactive) in the editor
      const { data: itemsData, error: itemsError } = await supabase
        .from("privilege_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      if (groupsData && itemsData) {
        const groups: LocalGroup[] = groupsData.map((g: any) => {
          const groupItems = itemsData
            .filter((item: any) => item.group_id === g.id)
            .map((item: any) => ({
              id: item.id,
              group_id: item.group_id,
              label: item.name,
              href: item.href,
              icon_name: item.icon_name,
              module: item.slug,
              item_order: item.sort_order,
              is_active: item.status === "active"
            }))
            .sort((a: DBItem, b: DBItem) => a.item_order - b.item_order);

          return {
            id: g.id,
            title: g.name,
            group_order: g.sort_order,
            is_active: g.status === "active",
            items: groupItems
          };
        });

        setLocalGroups(groups);
      }
    } catch (err: any) {
      console.error("Error loading sidebar data:", err);
      setError(err.message || "Gagal memuat data layout sidebar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  // Drag and Drop End handler
  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceGroupId = source.droppableId;
    const destGroupId = destination.droppableId;

    const newGroups = [...localGroups];
    const sourceGroupIndex = newGroups.findIndex(g => g.id === sourceGroupId);
    const destGroupIndex = newGroups.findIndex(g => g.id === destGroupId);

    if (sourceGroupIndex === -1 || destGroupIndex === -1) return;

    const sourceGroup = newGroups[sourceGroupIndex];
    const destGroup = newGroups[destGroupIndex];

    const sourceItems = [...sourceGroup.items];
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceGroupId === destGroupId) {
      // Reordering in same group
      sourceItems.splice(destination.index, 0, movedItem);
      
      const updatedItems = sourceItems.map((item, idx) => ({
        ...item,
        item_order: idx + 1
      }));

      newGroups[sourceGroupIndex] = {
        ...sourceGroup,
        items: updatedItems
      };
    } else {
      // Moving to different group
      movedItem.group_id = destGroupId;
      const destItems = [...destGroup.items];
      destItems.splice(destination.index, 0, movedItem);

      const updatedSourceItems = sourceItems.map((item, idx) => ({
        ...item,
        item_order: idx + 1
      }));

      const updatedDestItems = destItems.map((item, idx) => ({
        ...item,
        item_order: idx + 1
      }));

      newGroups[sourceGroupIndex] = {
        ...sourceGroup,
        items: updatedSourceItems
      };

      newGroups[destGroupIndex] = {
        ...destGroup,
        items: updatedDestItems
      };
    }

    setLocalGroups(newGroups);
    setHasChanges(true);
  };

  // Group re-ordering (Up/Down arrows)
  const moveGroupUp = (idx: number) => {
    if (idx === 0) return;
    const newGroups = [...localGroups];
    const temp = newGroups[idx];
    newGroups[idx] = newGroups[idx - 1];
    newGroups[idx - 1] = temp;

    const updated = newGroups.map((g, i) => ({
      ...g,
      group_order: i + 1
    }));

    setLocalGroups(updated);
    setHasChanges(true);
  };

  const moveGroupDown = (idx: number) => {
    if (idx === localGroups.length - 1) return;
    const newGroups = [...localGroups];
    const temp = newGroups[idx];
    newGroups[idx] = newGroups[idx + 1];
    newGroups[idx + 1] = temp;

    const updated = newGroups.map((g, i) => ({
      ...g,
      group_order: i + 1
    }));

    setLocalGroups(updated);
    setHasChanges(true);
  };

  // Add group
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newGroup: LocalGroup = {
      id: tempId,
      title: newGroupTitle.trim().toUpperCase(),
      group_order: localGroups.length + 1,
      is_active: true,
      items: []
    };

    setLocalGroups([...localGroups, newGroup]);
    setNewGroupTitle("");
    setIsAddGroupOpen(false);
    setHasChanges(true);
  };

  // Delete group
  const handleDeleteGroup = (groupId: string) => {
    const group = localGroups.find(g => g.id === groupId);
    if (!group) return;

    const confirmMsg = group.items.length > 0 
      ? `Grup "${group.title}" memiliki ${group.items.length} menu di dalamnya. Menghapus grup ini akan menghapus semua menu tersebut secara permanen. Apakah Anda yakin?`
      : `Hapus grup navigasi "${group.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    if (!groupId.startsWith("temp-")) {
      setDeletedGroupIds([...deletedGroupIds, groupId]);
    }

    setLocalGroups(localGroups.filter(g => g.id !== groupId));
    setHasChanges(true);
  };

  // Rename group inline
  const startEditingGroup = (groupId: string, currentTitle: string) => {
    setEditingGroupId(groupId);
    setEditingGroupTitle(currentTitle);
  };

  const saveEditingGroup = () => {
    if (!editingGroupId) return;
    if (!editingGroupTitle.trim()) {
      setEditingGroupId(null);
      return;
    }

    const updated = localGroups.map(g => {
      if (g.id === editingGroupId) {
        return {
          ...g,
          title: editingGroupTitle.trim().toUpperCase()
        };
      }
      return g;
    });

    setLocalGroups(updated);
    setEditingGroupId(null);
    setHasChanges(true);
  };

  // Save changes to database
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      // 1. Delete removed groups
      if (deletedGroupIds.length > 0) {
        const { error: delError } = await supabase
          .from("privilege_groups")
          .delete()
          .in("id", deletedGroupIds);
        if (delError) throw delError;
      }

      // 2. Save / update groups
      const tempGroupMap: Record<string, string> = {};

      for (const group of localGroups) {
        if (group.id.startsWith("temp-")) {
          // Insert new group
          const slug = group.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const { data, error: insertError } = await supabase
            .from("privilege_groups")
            .insert({
              name: group.title,
              slug: slug,
              sort_order: group.group_order,
              status: group.is_active ? "active" : "inactive"
            })
            .select("id")
            .single();

          if (insertError) throw insertError;
          tempGroupMap[group.id] = data.id;
          group.id = data.id; // update local ref
        } else {
          // Update existing group title, order, is_active
          const slug = group.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const { error: updateError } = await supabase
            .from("privilege_groups")
            .update({
              name: group.title,
              slug: slug,
              sort_order: group.group_order,
              status: group.is_active ? "active" : "inactive"
            })
            .eq("id", group.id);

          if (updateError) throw updateError;
        }
      }

      // 3. Save all items (moved/reordered)
      const itemsToSave = localGroups.flatMap(g => 
        g.items.map(item => {
          const groupId = g.id.startsWith("temp-") ? tempGroupMap[g.id] : g.id;
          return {
            id: item.id,
            group_id: groupId,
            name: item.label,
            href: item.href,
            icon_name: item.icon_name,
            slug: item.module,
            sort_order: item.item_order,
            status: item.is_active ? "active" : "inactive"
          };
        })
      );

      const { error: itemsError } = await supabase
        .from("privilege_items")
        .upsert(itemsToSave);

      if (itemsError) throw itemsError;

      setHasChanges(false);
      setDeletedGroupIds([]);
      setSuccess(true);

      // Reload structure
      await fetchSidebarData();

      // Refresh layout
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      console.error("Error saving sidebar layout changes:", err);
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("Batalkan semua perubahan yang belum disimpan?")) {
      fetchSidebarData();
      setDeletedGroupIds([]);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader className="w-8 h-8 animate-spin text-text-primary" />
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Memuat Struktur Layout...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 border border-border-default hover:bg-bg-well rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Kembali ke Dashboard Admin"
          >
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-wider text-text-primary uppercase">
              SIDEBAR NAVIGATION LAYOUT
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Sesuaikan grup menu dan susun urutan menu navigasi sidebar admin menggunakan fitur seret-lepas.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3.5 shrink-0">
          <Button
            onClick={() => setIsAddGroupOpen(true)}
            className="bg-bg-well hover:bg-bg-page border border-border-default text-text-primary rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer h-10 shadow-none"
          >
            <Plus size={14} />
            <span>Tambah Grup</span>
          </Button>

          {hasChanges && (
            <>
              <button
                onClick={handleDiscardChanges}
                disabled={isSaving}
                className="text-[10px] font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer h-10 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Feedbacks */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Perubahan layout navigasi berhasil disimpan! Memuat ulang sistem...</span>
        </div>
      )}

      {/* Main DragDropContext Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localGroups.map((group, groupIdx) => (
            <div 
              key={group.id} 
              className={`bg-bg-card border border-border-default rounded-2xl flex flex-col overflow-hidden min-h-[300px] transition-all duration-200 ${
                !group.is_active ? "opacity-60 bg-bg-well/25 border-dashed" : ""
              }`}
            >
              
              {/* Group Card Header */}
              <div className="p-4 bg-bg-well/45 border-b border-border-default/60 flex items-center justify-between gap-2">
                {editingGroupId === group.id ? (
                  <div className="flex items-center gap-1.5 flex-grow">
                    <input
                      type="text"
                      value={editingGroupTitle}
                      onChange={(e) => setEditingGroupTitle(e.target.value)}
                      onBlur={saveEditingGroup}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditingGroup();
                        if (e.key === "Escape") setEditingGroupId(null);
                      }}
                      className="bg-bg-well border border-border-default rounded px-2 py-1 text-xs text-text-primary font-black uppercase tracking-wider focus:outline-none w-full"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/title flex-grow min-w-0">
                    <span className="text-xs font-black tracking-wider text-text-primary uppercase truncate">
                      {group.title} {!group.is_active && <span className="text-[9px] text-red-500 font-bold lowercase tracking-normal">(nonaktif)</span>}
                    </span>
                    <button
                      onClick={() => startEditingGroup(group.id, group.title)}
                      className="opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5 text-text-secondary hover:text-text-primary cursor-pointer shrink-0"
                      title="Ubah Nama Grup"
                    >
                      <Edit2 size={11} />
                    </button>
                  </div>
                )}

                {/* Group Control Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleGroupActive(group.id)}
                    className="p-1 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary cursor-pointer"
                    title={group.is_active ? "Nonaktifkan Grup" : "Aktifkan Grup"}
                  >
                    {group.is_active ? <Eye size={13} /> : <EyeOff size={13} className="text-red-500" />}
                  </button>
                  <button
                    onClick={() => moveGroupUp(groupIdx)}
                    disabled={groupIdx === 0}
                    className="p-1 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary disabled:opacity-30 cursor-pointer"
                    title="Geser Grup ke Atas"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveGroupDown(groupIdx)}
                    disabled={groupIdx === localGroups.length - 1}
                    className="p-1 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary disabled:opacity-30 cursor-pointer"
                    title="Geser Grup ke Bawah"
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-text-secondary hover:text-red-500 cursor-pointer"
                    title="Hapus Grup"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Droppable Menu Items Area */}
              <Droppable droppableId={group.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 flex-grow space-y-2 transition-colors duration-150 ${
                      snapshot.isDraggingOver ? "bg-bg-well/20" : ""
                    }`}
                  >
                    {group.items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center min-h-[150px] border border-dashed border-border-default/40 rounded-xl p-4 text-center text-text-muted">
                        <FolderSync className="w-5 h-5 mb-1.5 opacity-60" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider">
                          Grup Kosong
                        </p>
                        <p className="text-[9px] mt-0.5 max-w-[150px]">
                          Seret menu dari grup lain ke sini.
                        </p>
                      </div>
                    ) : (
                      group.items.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={`flex items-center gap-2 p-2.5 bg-bg-well border border-border-default rounded-xl hover:bg-bg-well/65 transition-all text-xs font-semibold text-text-primary ${
                                dragSnapshot.isDragging ? "shadow-lg scale-98 border-text-primary/40 bg-bg-card" : ""
                              } ${!item.is_active ? "opacity-55 border-dashed line-through bg-bg-well/10" : ""}`}
                            >
                              {/* Drag Handle */}
                              <div
                                {...dragProvided.dragHandleProps}
                                className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing shrink-0 p-0.5"
                                title="Seret untuk memindahkan"
                              >
                                <GripVertical size={13} />
                              </div>

                              {/* Icon Indicator */}
                              <div className="text-text-secondary shrink-0">
                                {getIconComponent(item.icon_name, 13)}
                              </div>

                              {/* Item Details */}
                              <div className="flex-grow min-w-0">
                                <p className="truncate leading-none">
                                  {item.label} {!item.is_active && <span className="text-[8px] text-red-500 font-bold lowercase tracking-normal">(nonaktif)</span>}
                                </p>
                                <p className="text-[9px] text-text-muted font-normal mt-1 truncate">
                                  {item.href}
                                </p>
                              </div>

                              {/* Action Buttons: Toggle Active and Edit */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleItemActive(group.id, item.id)}
                                  className="p-1 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary cursor-pointer"
                                  title={item.is_active ? "Nonaktifkan Menu" : "Aktifkan Menu"}
                                >
                                  {item.is_active ? <Eye size={12} /> : <EyeOff size={12} className="text-red-500" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditItemModal(item)}
                                  className="p-1 rounded hover:bg-bg-well text-text-secondary hover:text-text-primary cursor-pointer"
                                  title="Edit Menu"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>

                              {/* Access Module Tag */}
                              <div className="shrink-0 text-[8px] bg-border-default/45 text-text-secondary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                {item.module}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Add Group Modal Dialog */}
      {isAddGroupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddGroupOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4">
              TAMBAH GRUP NAVIGASI BARU
            </h3>

            <form onSubmit={handleAddGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Nama Grup Navigasi
                </label>
                <input
                  type="text"
                  placeholder="E.g. SETTINGS, REPORTING"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-text-primary font-bold uppercase tracking-wider"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAddGroupOpen(false)}
                  className="bg-transparent hover:bg-bg-well text-text-secondary rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-none h-10"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer h-10"
                >
                  Buat Grup
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal Dialog */}
      {isEditItemOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-bg-card border border-border-default rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsEditItemOpen(false);
                setEditingItem(null);
              }}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4">
              EDIT ITEM MENU NAVIGASI
            </h3>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              {/* Label */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Label Menu
                </label>
                <input
                  type="text"
                  value={editItemLabel}
                  onChange={(e) => setEditItemLabel(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-text-primary font-bold"
                  required
                />
              </div>

              {/* Href */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  URL / Path
                </label>
                <input
                  type="text"
                  value={editItemHref}
                  onChange={(e) => setEditItemHref(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-text-primary font-bold"
                  required
                />
              </div>

              {/* Icon Name Dropdown select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Pilih Ikon
                </label>
                <div className="relative">
                  <select
                    value={editItemIconName}
                    onChange={(e) => setEditItemIconName(e.target.value)}
                    className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none appearance-none cursor-pointer pr-10 font-bold"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3 w-3.5 h-3.5 text-text-secondary pointer-events-none flex items-center justify-center">
                    {getIconComponent(editItemIconName, 13)}
                  </div>
                </div>
              </div>

              {/* Permission Module */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Modul Izin Akses
                </label>
                <input
                  type="text"
                  value={editItemModule}
                  onChange={(e) => setEditItemModule(e.target.value)}
                  className="w-full bg-bg-well border border-border-default rounded-full py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-text-primary font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditItemOpen(false);
                    setEditingItem(null);
                  }}
                  className="bg-transparent hover:bg-bg-well text-text-secondary rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-none h-10"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-text-primary text-bg-card border border-text-primary hover:opacity-90 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer h-10"
                >
                  Simpan Menu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
