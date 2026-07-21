import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { conferences, type Conference } from "@/data/conferences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/conferences")({
  component: AdminConferences,
});

function AdminConferences() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConference, setEditingConference] =
    useState<Conference | null>(null);

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
          onClick={() => setShowAddModal(true)}
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
              <div className="flex items-center gap-1">
                {conf.pickupEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-brand-green-soft px-2.5 py-1 text-xs font-medium text-brand-green">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <XCircle className="h-3 w-3" /> Disabled
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingConference(conf)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                <Edit className="h-3 w-3" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingConference) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-foreground">
                {editingConference ? "Edit Conference" : "Add Conference"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingConference(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Conference Name
                </label>
                <input
                  defaultValue={editingConference?.name}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="e.g. CMDA National Conference 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Location
                </label>
                <input
                  defaultValue={editingConference?.location}
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
                    defaultValue={editingConference?.date}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <input
                    type="date"
                    defaultValue={editingConference?.endDate}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">
                  Pickup Enabled
                </label>
                <button
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    editingConference?.pickupEnabled !== false
                      ? "bg-brand-green"
                      : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      editingConference?.pickupEnabled !== false
                        ? "translate-x-6"
                        : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingConference(null);
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
                <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  {editingConference ? "Save Changes" : "Add Conference"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
