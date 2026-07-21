import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { type Conference } from "@/data/conferences";
import { useConferences } from "@/stores/conferences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/conferences")({
  component: AdminConferences,
});

type FormState = {
  name: string;
  location: string;
  date: string;
  endDate: string;
  pickupEnabled: boolean;
};

const emptyForm: FormState = {
  name: "",
  location: "",
  date: "",
  endDate: "",
  pickupEnabled: true,
};

function AdminConferences() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConference, setEditingConference] =
    useState<Conference | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    conferences,
    addConference,
    updateConference,
    deleteConference,
    togglePickup,
  } = useConferences();

  const openAdd = () => {
    setEditingConference(null);
    setForm(emptyForm);
    setShowAddModal(true);
  };

  const openEdit = (conf: Conference) => {
    setEditingConference(conf);
    setForm({
      name: conf.name,
      location: conf.location,
      date: conf.date,
      endDate: conf.endDate,
      pickupEnabled: conf.pickupEnabled,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingConference(null);
  };

  const handleSave = () => {
    if (!form.name || !form.location || !form.date || !form.endDate) return;

    if (editingConference) {
      updateConference(editingConference.id, {
        name: form.name,
        location: form.location,
        date: form.date,
        endDate: form.endDate,
        pickupEnabled: form.pickupEnabled,
      });
    } else {
      const id = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      addConference({
        id: `conference-${id}-${Date.now()}`,
        name: form.name,
        location: form.location,
        date: form.date,
        endDate: form.endDate,
        pickupEnabled: form.pickupEnabled,
      });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    deleteConference(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Conference Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage pickup conferences and events.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Conference
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {conferences.map((conf) => (
          <div
            key={conf.id}
            className="rounded-2xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-foreground">
                  {conf.name}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {conf.location}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {new Date(conf.date).toLocaleDateString("en-NG", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  –{" "}
                  {new Date(conf.endDate).toLocaleDateString("en-NG", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <button
                onClick={() => togglePickup(conf.id)}
                className="shrink-0"
              >
                {conf.pickupEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-brand-green-soft px-2.5 py-1 text-xs font-medium text-brand-green">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <XCircle className="h-3 w-3" /> Disabled
                  </span>
                )}
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEdit(conf)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                <Edit className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(conf.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {conferences.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="font-display text-2xl font-bold text-foreground">
            No conferences
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a conference to enable pickup options at checkout.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-foreground">
                {editingConference ? "Edit Conference" : "Add Conference"}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Conference Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. CMDA National Conference 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. University of Jos, Plateau State"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">
                  Pickup Enabled
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      pickupEnabled: !f.pickupEnabled,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    form.pickupEnabled ? "bg-brand-green" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      form.pickupEnabled
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.location || !form.date || !form.endDate}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingConference ? "Save Changes" : "Add Conference"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-foreground">
              Delete Conference?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove this conference. This action cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
